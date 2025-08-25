import {
    Address,
    Cell,
    ContractProvider,
    Contract,
    openContract,
    external,
    beginCell,
    storeMessage,
    toNano,
    comment,
    TupleItem,
    StateInit,
    OpenedContract,
    Transaction,
    loadTransaction
} from "@ton/core";
// Local Maybe type definition for compatibility
type Maybe<T> = T | null | undefined;
import { TonHttpApiV2, TonHttpApiV2Parameters } from "../TonHttpApiV2/TonHttpApiV2";

export class TonClientV2 {

    readonly api: TonHttpApiV2;

    constructor(parameters: TonHttpApiV2Parameters) {
        this.api = new TonHttpApiV2(parameters);
    }

    /**
     * Run get method on smart contract.
     * You get a parsed stack in the response.
     * @param address
     * @param method
     * @param stack
     */
    async callGetMethod(address: Address, method: string, stack: TupleItem[]) {
        const data = await this.api.runGetMethod(address.toString(), method, stack);
        if (data.exit_code !== 0) {
            throw Error(`Got exit_code: ${data.exit_code}`);
        }

        return {
            gas_used: data.gas_used,
            stack: TonHttpApiV2.parseStack(data.stack)
        };
    }

    /**
     * Check if contract is deployed.
     * @param address
     */
    async isContractDeployed(address: Address) {
        return (await this.api.getAddressState(address.toString())) === "active";
    }

    /**
     * Open smart contract.
     * @param contract
     */
    open<T extends Contract>(contract: T) {
        return openContract<T>(contract, (args) => createProvider(this, args.address, args.init));
    }

    /**
     * Create provider.
     * @param address
     * @param [init={ code, data }]
     */
    provider(address: Address, init?: StateInit | null) {
        return createProvider(this, address, init ? init : null);
    }

    /**
     * Get transactions
     * @param address address
     * @param opts options
     */
    async getTransactions(address: Address, opts: { limit: number, lt?: string, hash?: string, to_lt?: string, inclusive?: boolean, archival?: boolean }) {
        // Fetch transactions using HTTP API v2
        const transactions = await this.api.getTransactions(address.toString(), {
            limit: opts.limit,
            lt: opts.lt,
            hash: opts.hash,
            to_lt: opts.to_lt,
            archival: opts.archival
        });

        // Convert to Transaction objects
        const result: Transaction[] = [];
        for (const tx of transactions) {
            try {
                const cell = Cell.fromBase64(tx.data);
                const transaction = loadTransaction(cell.beginParse());
                result.push(transaction);
            } catch (error) {
                // Skip invalid transactions
                console.warn('Failed to parse transaction:', error);
            }
        }

        return result;
    }
}

function createProvider(client: TonClientV2, address: Address, init: StateInit | null) : ContractProvider {
    return {
        async getState() {
            const data = (await client.api.getAddressInformation(address.toString()));

            const last = data.last_transaction_id ? {
                lt: BigInt(data.last_transaction_id.lt),
                hash: Buffer.from(data.last_transaction_id.hash, "base64")
            } : null;

            let storage: {
                type: "uninit";
            } | {
                type: "active";
                code: Maybe<Buffer>;
                data: Maybe<Buffer>;
            } | {
                type: "frozen";
                stateHash: Buffer;
            };

            if (data.state == "uninitialized") {
                storage = {
                    type: "uninit",
                };
            } else if (data.state == "active") {
                storage = {
                    type: "active",
                    code: data.code ? Buffer.from(data.code, "base64") : null,
                    data: data.data ? Buffer.from(data.data, "base64") : null,
                };
            } else if (data.state == "frozen") {
                storage = {
                    type: "frozen",
                    stateHash: Buffer.from(data.frozen_hash, "base64"),
                };
            }  else {
                throw Error("Unsupported state");
            }

            return {
                balance: BigInt(data.balance),
                extracurrency: null, // Not supported in HTTP API v2
                last: last,
                state: storage
            };
        },

        async get(name, args) {
            if (typeof name !== 'string') {
                throw new Error('Method name must be a string for TonClient provider');
            }

            const data = await client.callGetMethod(address, name, args);
            return { stack: data.stack };
        },

        async external(message) {
            // resolve init
            let neededInit: StateInit | null = null;
            if (init && (!await client.isContractDeployed(address))) {
                neededInit = init;
            }

            // send package
            const ext = external({
                to: address,
                init: neededInit ? { code: neededInit.code, data: neededInit.data } : null,
                body: message
            });

            const boc = beginCell()
                .store(storeMessage(ext))
                .endCell()
                .toBoc();

            await client.api.sendBoc(boc.toString("base64"));
        },

        async internal(via, message) {
            // resolve init
            let neededInit: StateInit | null = null;
            if (init && (!await client.isContractDeployed(address))) {
                neededInit = init;
            }

            // resolve bounce
            let bounce = true;
            if (message.bounce !== null && message.bounce !== undefined) {
                bounce = message.bounce;
            }

            // resolve value
            let value: bigint;
            if (typeof message.value === "string") {
                value = toNano(message.value);
            } else {
                value = message.value;
            }

            // resolve body
            let body: Cell | null = null;
            if (typeof message.body === "string") {
                body = comment(message.body);
            } else if (message.body) {
                body = message.body;
            }

            // send internal message
            await via.send({
                value,
                to: address,
                sendMode: message.sendMode,
                bounce,
                init: neededInit,
                body
            });
        },

        open<T extends Contract>(contract: T) {
            return openContract<T>(contract, (args) => createProvider(client, args.address, args.init ?? null));
        },

        async getTransactions(address: Address, lt: bigint, hash: Buffer, limit?: number) {
            return client.getTransactions(address, { 
                limit: limit ?? 100, 
                lt: lt.toString(), 
                hash: hash.toString('base64'), 
                inclusive: true 
            });
        }
    };
}
