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
import { TonHttpApiV3, TonHttpApiV3Parameters } from "../TonHttpApiV3/TonHttpApiV3";

export class TonClientV3 {

    readonly api: TonHttpApiV3;

    constructor(parameters: TonHttpApiV3Parameters) {
        this.api = new TonHttpApiV3(parameters);
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
            stack: TonHttpApiV3.parseStack(data.stack)
        };
    }

    /**
     * Check if contract is deployed.
     * @param address
     */
    async isContractDeployed(address: Address) {
        return (await this.api.getAccount(address.toString())).status === "active";
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
        // HTTP API v3 doesn't provide BOC data directly, so we can't create Transaction objects
        // This would need additional implementation to convert v3 transaction format to @ton/core Transaction
        throw new Error("getTransactions with Transaction objects is not directly supported in HTTP API v3. Use api.getTransactions() for raw data.");
    }
}

function createProvider(client: TonClientV3, address: Address, init: StateInit | null) : ContractProvider {
    return {
        async getState() {
            const data = await client.api.getAccount(address.toString());

            const last = data.last_transaction_lt && data.last_transaction_hash ? {
                lt: BigInt(data.last_transaction_lt),
                hash: Buffer.from(data.last_transaction_hash, "base64")
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

            if (data.status == "uninit") {
                storage = {
                    type: "uninit",
                };
            } else if (data.status == "active") {
                storage = {
                    type: "active",
                    code: data.code ? Buffer.from(data.code, "base64") : null,
                    data: data.data ? Buffer.from(data.data, "base64") : null,
                };
            } else if (data.status == "frozen" && data.frozen_hash) {
                storage = {
                    type: "frozen",
                    stateHash: Buffer.from(data.frozen_hash, "base64"),
                };
            }  else {
                throw Error("Unsupported state");
            }

            return {
                balance: BigInt(data.balance),
                extracurrency: null, // Not supported in HTTP API v3
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

            await client.api.sendMessage(boc.toString("base64"));
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

        async getTransactions(address: Address, lt: bigint, hash: Buffer, limit?: number): Promise<Transaction[]> {
            // HTTP API v3 doesn't provide BOC data directly, so we can't create Transaction objects
            // Return empty array to satisfy the interface
            console.warn("getTransactions with Transaction objects is not directly supported in HTTP API v3. Use api.getTransactions() for raw data.");
            return [];
        }
    };
}
