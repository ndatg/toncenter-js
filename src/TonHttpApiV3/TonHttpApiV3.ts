import { z } from "zod";
import axios, { AxiosAdapter } from "axios";
import {Cell, TupleItem, TupleReader} from "@ton/core";
import * as Schema from "./SchemaV3";

export interface TonHttpApiV3Parameters {

    endpoint: string;

    apiKey?: string;

    timeout?: number;

    adapter?: AxiosAdapter;

    /**
     * If true, will throw error on schema validation failure.
     * If false, will log warning and return data as is.
     * Default: false (lenient mode)
     */
    strictValidation?: boolean;

}

export class TonHttpApiV3 {

    readonly #endpoint: string;

    readonly #timeout: number;

    readonly #apiKey?: string;

    readonly #adapter?: AxiosAdapter;

    readonly #strictValidation: boolean;

    constructor(params: TonHttpApiV3Parameters) {
        this.#endpoint = params.endpoint;
        this.#timeout = params?.timeout || 10_000;
        this.#apiKey = params?.apiKey && params.apiKey.trim() !== "" ? params.apiKey : undefined;
        this.#adapter = params?.adapter;
        this.#strictValidation = params?.strictValidation ?? false;
    }

    /**
     * Get smart contract information.
     * @param address
     */
    async getAccount(address: string) {
        return this.get(
            "/api/v3/account",
            {
                address
            },
            Schema.account
        );
    }

    /**
     * Query account states for multiple addresses.
     * @param addresses - List of addresses (max 1024)
     * @param include_boc - Include code and data BOCs (default: true)
     */
    async getAccountStates(addresses: string[], include_boc: boolean = true) {
        return this.get(
            "/api/v3/accountStates",
            {
                address: addresses,
                include_boc
            },
            Schema.accountStatesResponse
        );
    }

    /**
     * Get actions by specified filter.
     * @param optional - Filter parameters for actions
     */
    async getActions(optional?: {
        account?: string;
        tx_hash?: string[];
        msg_hash?: string[];
        action_id?: string[];
        trace_id?: string[];
        mc_seqno?: number;
        start_utime?: number;
        end_utime?: number;
        start_lt?: number;
        end_lt?: number;
        action_type?: string[];
        exclude_action_type?: string[];
        supported_action_types?: string[];
        include_accounts?: boolean;
        limit?: number;
        offset?: number;
        sort?: "asc" | "desc";
    }) {
        let query = "";
        
        // Handle array parameters that need special query formatting
        const arrayParams = ['tx_hash', 'msg_hash', 'action_id', 'trace_id', 'action_type', 'exclude_action_type', 'supported_action_types'];
        const params: any = { ...optional };
        
        for (const param of arrayParams) {
            if (params[param] && Array.isArray(params[param])) {
                for (const value of params[param]) {
                    if (query.length <= 0) {
                        query += `?${param}=${value}`;
                    } else {
                        query += `&${param}=${value}`;
                    }
                }
                delete params[param];
            }
        }

        return this.get(
            `/api/v3/actions${query}`,
            params,
            Schema.actionsResponse
        );
    }

    /**
     * Get pending actions by specified filter.
     * @param optional - Filter parameters for pending actions
     */
    async getPendingActions(optional?: {
        account?: string;
        tx_hash?: string[];
        msg_hash?: string[];
        action_id?: string[];
        trace_id?: string[];
        mc_seqno?: number;
        start_utime?: number;
        end_utime?: number;
        start_lt?: number;
        end_lt?: number;
        action_type?: string[];
        exclude_action_type?: string[];
        supported_action_types?: string[];
        include_accounts?: boolean;
        limit?: number;
        offset?: number;
        sort?: "asc" | "desc";
    }) {
        let query = "";
        
        // Handle array parameters that need special query formatting
        const arrayParams = ['tx_hash', 'msg_hash', 'action_id', 'trace_id', 'action_type', 'exclude_action_type', 'supported_action_types'];
        const params: any = { ...optional };
        
        for (const param of arrayParams) {
            if (params[param] && Array.isArray(params[param])) {
                for (const value of params[param]) {
                    if (query.length <= 0) {
                        query += `?${param}=${value}`;
                    } else {
                        query += `&${param}=${value}`;
                    }
                }
                delete params[param];
            }
        }

        return this.get(
            `/api/v3/pendingActions${query}`,
            params,
            Schema.pendingActionsResponse
        );
    }

    /**
     * Query address book for multiple addresses.
     * @param addresses - List of addresses (max 1024)
     */
    async getAddressBook(addresses: string[]) {
        return this.get(
            "/api/v3/addressBook",
            {
                address: addresses
            },
            Schema.addressBook
        );
    }



    /**
     * Get wallet smart contract information.
     * The following wallets are supported: v1r1, v1r2, v1r3, v2r1, v2r2, v3r1, v3r2, v4r1, v4r2.
     * In case the account is not a wallet error code 409 is returned.
     * @param address
     */
    async getWallet(address: string) {
        return this.get(
            "/api/v3/wallet",
            {
                address
            },
            Schema.wallet
        );
    }

    /**
     * Get detailed wallet information including balance, seqno, wallet type and other parameters.
     * This method provides comprehensive wallet details for supported wallet types.
     * @param address - Wallet address
     */
    async getWalletInformation(address: string) {
        return this.get(
            "/api/v3/walletInformation",
            {
                address
            },
            Schema.walletInformation
        );
    }

    /**
     * Get metadata for multiple addresses.
     * @param addresses - List of addresses to get metadata for (max 1024)
     */
    async getMetadata(addresses: string[]) {
        return this.get(
            "/api/v3/metadata",
            {
                address: addresses
            },
            Schema.metadataResponse
        );
    }

    /**
     * Get wallet states for multiple addresses.
     * @param addresses - List of addresses to get wallet states for (max 1024)
     * @param include_boc - Include code and data BOCs (default: true)
     */
    async getWalletStates(addresses: string[], include_boc: boolean = true) {
        return this.get(
            "/api/v3/walletStates",
            {
                address: addresses,
                include_boc
            },
            Schema.walletStatesResponse
        );
    }

    /**
     * Get masterchain info.
     */
    async getMasterchainInfo() {
        return this.get(
            "/api/v3/masterchainInfo",
            {},
            Schema.masterchainInfo
        );
    }

    /**
     * Returns blocks by specified filters.
     * @param [optional={ workchain, shard, seqno, start_utime, end_utime, start_lt, end_lt, limit, offset, sort }]
     */
    async getBlocks(optional? : {
        workchain?: number, shard?: string, seqno?: number, start_utime?: string, end_utime?: string,
        start_lt?: string, end_lt?: string, limit?: number, offset?: number, sort?: "asc" | "desc"
    }) {
        return this.get(
            "/api/v3/blocks",
            {
                ...optional
            },
            Schema.blocks
        );
    }

    /**
     * Returns all workchain blocks, that appeared after previous masterchain block.
     * @param seqno
     * @param [optional={ include_mc_block }]
     */
    async getMasterchainBlockShards(seqno: number, optional?: {
        include_mc_block?: boolean
    }) {
        return this.get(
            "/api/v3/masterchainBlockShards",
            {
                seqno, ...optional
            },
            Schema.masterchainBlockShards
        );
    }

    /**
     * Get masterchain block shard state information.
     * @param seqno - Masterchain block sequence number
     */
    async getMasterchainBlockShardState(seqno: number) {
        return this.get(
            "/api/v3/masterchainBlockShardState",
            {
                seqno
            },
            Schema.masterchainBlockShardStateResponse
        );
    }

    /**
     * Get transactions by specified filters.
     * @param [optional={ workchain, shard, seqno, account, exclude_account, hash, lt,
     * start_utime, end_utime, start_lt, end_lt, limit, offset, sort }]
     */
    async getTransactions(optional?: {
        workchain?: number, shard?: string, seqno?: number, account?: string | string[], exclude_account?: string | string[],
        hash?: string, lt?: string, start_utime?: string, end_utime?: string, start_lt?: string, end_lt?: string, limit?: number,
        offset?: number, sort?: "asc" | "desc"
    }) {
        let query = "";

        if (optional?.account && typeof optional?.account !== "string") {
            for (const account of optional.account) {
                if (query.length <= 0) {
                    query += `?account=${account}`;
                } else {
                    query += `&account=${account}`;
                }
            }

            delete optional?.account;
        }

        if (optional?.exclude_account && typeof optional?.exclude_account !== "string") {
            for (const account of optional.exclude_account) {
                if (query.length <= 0) {
                    query += `?exclude_account=${account}`;
                } else {
                    query += `&exclude_account=${account}`;
                }
            }

            delete optional?.exclude_account;
        }

        return this.get(
            `/api/v3/transactions${query}`,
            {
                ...optional
            },
            Schema.transactions
        );
    }

    /**
     * Returns transactions from masterchain block and from all shards.
     * @param seqno
     * @param [optional={ limit, offset, sort }]
     */
    async getTransactionsByMasterchainBlock(seqno: number, optional?: {
        limit?: number, offset?: number, sort?: "asc" | "desc"
    }) {
        return this.get(
            "/api/v3/transactionsByMasterchainBlock",
            {
                seqno, ...optional
            },
            Schema.transactions
        );
    }

    /**
     * Get pending transactions by specified filters.
     * At least one account address is required.
     * @param accounts - Account addresses (at least one required)
     * @param optional - Filter parameters for pending transactions
     */
    async getPendingTransactions(accounts: string | string[], optional?: {
        workchain?: number;
        shard?: string;
        seqno?: number;
        exclude_account?: string | string[];
        hash?: string;
        lt?: string;
        start_utime?: string;
        end_utime?: string;
        start_lt?: string;
        end_lt?: string;
        limit?: number;
        offset?: number;
        sort?: "asc" | "desc";
    }) {
        let query = "";

        // Handle account parameter
        if (typeof accounts === "string") {
            query += `?account=${accounts}`;
        } else {
            for (const account of accounts) {
                if (query.length <= 0) {
                    query += `?account=${account}`;
                } else {
                    query += `&account=${account}`;
                }
            }
        }

        if (optional?.exclude_account && typeof optional?.exclude_account !== "string") {
            for (const account of optional.exclude_account) {
                query += `&exclude_account=${account}`;
            }
            delete optional?.exclude_account;
        }

        return this.get(
            `/api/v3/pendingTransactions${query}`,
            {
                ...optional
            },
            Schema.pendingTransactionsResponse
        );
    }

    /**
     * Get transactions whose inbound/outbound message has the specified hash.
     * This endpoint returns list of Transaction objects since collisions of message hashes can occur.
     * @param direction
     * @param msg_hash
     * @param [optional={ limit, offset }]
     */
    async getTransactionsByMessage(direction: "in" | "out", msg_hash: string, optional?: {
        limit?: number, offset?: number
    }) {
        return this.get(
            "/api/v3/transactionsByMessage",
            {
                direction, msg_hash, ...optional
            },
            Schema.transactions
        );
    }

    /**
     * Get parent and/or children for specified transaction.
     * @param hash
     * @param [optional={ direction, limit, offset, sort }]
     */
    async getAdjacentTransactions(hash: string, optional?: {
        direction?: "in" | "out" | "both", limit?: number, offset?: number, sort?: "asc" | "desc"
    }) {
        return this.get(
            "/api/v3/adjacentTransactions",
            {
                hash, ...optional
            },
            Schema.transactions
        );
    }





    /**
     * Get traces by specified filter.
     * @param optional - Filter parameters for traces
     */
    async getTraces(optional?: {
        account?: string;
        tx_hash?: string[];
        msg_hash?: string[];
        trace_id?: string[];
        mc_seqno?: number;
        start_utime?: number;
        end_utime?: number;
        start_lt?: number;
        end_lt?: number;
        limit?: number;
        offset?: number;
        sort?: 'asc' | 'desc';
    }) {
        return this.get(
            "/api/v3/traces",
            optional || {},
            Schema.tracesResponse
        );
    }

    /**
     * Get pending traces by specified filter.
     * @param optional - Filter parameters for pending traces
     */
    async getPendingTraces(optional?: {
        account?: string;
        tx_hash?: string[];
        msg_hash?: string[];
        trace_id?: string[];
        mc_seqno?: number;
        start_utime?: number;
        end_utime?: number;
        start_lt?: number;
        end_lt?: number;
        limit?: number;
        offset?: number;
        sort?: 'asc' | 'desc';
    }) {
        return this.get(
            "/api/v3/pendingTraces",
            optional || {},
            Schema.pendingTracesResponse
        );
    }

    /**
     * Get trace graph for specified transaction.
     * @param hash
     * @param [optional={ sort }]
     */
    async getTransactionTrace(hash: string, optional?: {
        sort?: "asc" | "desc"
    }) {
        return this.get(
            "/api/v3/traces",
            {
                tx_hash: [hash], ...optional
            },
            Schema.tracesResponse
        );
    }

    /**
     * Get messages by specified filters.
     * @param [optional={ hash, source, destination, body_hash, limit, offset }]
     */
    async getMessages(optional?: {
        hash?: string, source?: string, destination?: string, body_hash?: string, limit?: number, offset?: number
    }) {
        return this.get(
            "/api/v3/messages",
            {
                ...optional
            },
            Schema.messages
        );
    }

    /**
     * Get NFT collections.
     * @param [optional={ collection_address, owner_address, limit, offset }]
     */
    async getNftCollections(optional?: {
        collection_address?: string, owner_address?: string, limit?: number, offset?: number
    }) {
        return this.get(
            "/api/v3/nft/collections",
            {
                ...optional
            },
            Schema.nftCollections
        );
    }

    /**
     * Get NFT items.
     * @param [optional={ address, collection_address, owner_address, index, limit, offset }]
     */
    async getNftItems(optional?: {
        address?: string, collection_address?: string, owner_address?: string, index?: string, limit?: number, offset?: number
    }) {
        return this.get(
            "/api/v3/nft/items",
            {
                ...optional
            },
            Schema.nftItems
        );
    }

    /**
     * Get NFT transfers by specified filters.
     * @param [optional={ address, item_address, collection_address, direction, start_utime, end_utime,
     * start_lt, end_lt, limit, offset }]
     */
    async getNftTransfers(optional?: {
        address?: string, item_address?: string, collection_address?: string, direction?: "in" | "out" | "both",
        start_utime?: string, end_utime?: string, start_lt?: string, end_lt?: string, limit?: number, offset?: number,
        sort?: "asc" | "desc"
    }) {
        return this.get(
            "/api/v3/nft/transfers",
            {
                ...optional
            },
            Schema.nftTransfers
        );
    }

    /**
     * Get Jetton masters by specified filters.
     * @param [optional={ address, admin_address, limit, offset }]
     */
    async getJettonMasters(optional?: {
        address?: string, admin_address?: string, limit?: number, offset?: number
    }) {
        return this.get(
            "/api/v3/jetton/masters",
            {
                ...optional
            },
            Schema.jettonMasters
        );
    }

    /**
     * Get Jetton wallets by specified filters.
     * @param [optional={ address, owner_address, jetton_address, limit, offset }]
     */
    async getJettonWallets(optional?: {
        address?: string, owner_address?: string, jetton_address?: string, limit?: number, offset?: number
    }) {
        return this.get(
            "/api/v3/jetton/wallets",
            {
                ...optional
            },
            Schema.jettonWallets
        );
    }

    /**
     * Get Jetton transfers by specified filters.
     * @param [optional={ address, jetton_wallet, jetton_master, direction, start_utime, end_utime,
     * start_lt, end_lt, limit, offset, sort }]
     */
    async getJettonTransfers(optional?: {
        address?: string, jetton_wallet?: string, jetton_master?: string, direction?: "in" | "out" | "both",
        start_utime?: string, end_utime?: string, start_lt?: string, end_lt?: string, limit?: number, offset?: number,
        sort?: "asc" | "desc"
    }) {
        return this.get(
            "/api/v3/jetton/transfers",
            {
                ...optional
            },
            Schema.jettonTransfers
        );
    }

    /**
     * Get Jetton burns by specified filters.
     * @param [optional={ address, jetton_wallet, jetton_master, start_utime, end_utime,
     * start_lt, end_lt, limit, offset, sort }]
     */
    async getJettonBurns(optional?: {
        address?: string, jetton_wallet?: string, jetton_master?: string, start_utime?: string, end_utime?: string,
        start_lt?: string, end_lt?: string, limit?: number, offset?: number, sort?: "asc" | "desc"
    }) {
        return this.get(
            "/api/v3/jetton/burns",
            {
                ...optional
            },
            Schema.jettonBurns
        );
    }

    /**
     * Get list of accounts sorted descending by balance.
     * @param [optional={ limit, offset }]
     */
    async topAccountByBalance(optional?: {
        limit?: number, offset?: number
    }) {
        return this.get(
            "/api/v3/topAccountsByBalance",
            {
                ...optional
            },
            Schema.topAccountByBalance
        );
    }

    /**
     * Send external message to TON network.
     * @param boc
     */
    async sendMessage(boc: string) {
        return this.post(
            "/api/v3/message",
            {
                boc
            },
            Schema.sendMessage
        );
    }

    /**
     * Run get method of smart contract. Stack supports only num, cell and slice types.
     * @param address
     * @param method
     * @param stack
     */
    async runGetMethod(address: string, method: string, stack: TupleItem[]) {
        return this.post(
            "/api/v3/runGetMethod",
            {
                address, method, stack: TonHttpApiV3.serializeStack(stack)
            },
            Schema.runGetMethod
        );
    }

    /**
     * Estimate fee for external message.
     * @param address
     * @param body
     * @param init_code
     * @param init_data
     * @param ignore_chksig
     */
    async estimateFee(address: string, body: string, init_code: string, init_data: string, ignore_chksig: boolean) {
        return this.post(
            "/api/v3/estimateFee",
            {
                address, body, init_code, init_data, ignore_chksig
            },
            Schema.estimateFee
        );
    }

    /**
     * Get DNS records by domain or resolver address.
     * @param wallet_address - Wallet address (required)
     * @param optional - Filter parameters for DNS records
     */
    async getDnsRecords(wallet_address: string, optional?: {
        domain?: string;
        resolver_address?: string;
        limit?: number;
        offset?: number;
    }) {
        return this.get(
            "/api/v3/dns/records",
            {
                wallet_address,
                ...optional
            },
            Schema.dnsRecordsResponse
        );
    }

    /**
     * Get multisig orders by specified filters.
     * At least one of address or multisig_address is required.
     * @param required - Required parameters (address or multisig_address)
     * @param optional - Optional filter parameters
     */
    async getMultisigOrders(required: {
        address?: string;
        multisig_address?: string;
    }, optional?: {
        order_id?: string;
        limit?: number;
        offset?: number;
    }) {
        return this.get(
            "/api/v3/multisig/orders",
            {
                ...required,
                ...optional
            },
            Schema.multisigOrdersResponse
        );
    }

    /**
     * Get multisig wallets by specified filters.
     * At least one of address or wallet_address is required.
     * @param required - Required parameters (address or wallet_address)
     * @param optional - Optional filter parameters
     */
    async getMultisigWallets(required: {
        address?: string;
        wallet_address?: string;
    }, optional?: {
        owner_address?: string;
        limit?: number;
        offset?: number;
    }) {
        return this.get(
            "/api/v3/multisig/wallets",
            {
                ...required,
                ...optional
            },
            Schema.multisigWalletsResponse
        );
    }

    /**
     * Get vesting contracts by specified filters.
     * At least one of contract_address or wallet_address is required.
     * @param required - Required parameters (contract_address or wallet_address)
     * @param optional - Optional filter parameters
     */
    async getVesting(required: {
        contract_address?: string;
        wallet_address?: string;
    }, optional?: {
        owner_address?: string;
        sender_address?: string;
        limit?: number;
        offset?: number;
    }) {
        return this.get(
            "/api/v3/vesting",
            {
                ...required,
                ...optional
            },
            Schema.vestingResponse
        );
    }

    // V2 compatibility methods (available in v3 API)

    /**
     * V2 compatible: Get address information.
     * @param address
     */
    async v2GetAddressInformation(address: string) {
        return this.get(
            "/api/v2/getAddressInformation",
            {
                address
            },
            Schema.v2AddressInformation
        );
    }

    /**
     * V2 compatible: Get wallet information.
     * @param address
     */
    async v2GetWalletInformation(address: string) {
        return this.get(
            "/api/v2/getWalletInformation",
            {
                address
            },
            Schema.v2WalletInformation
        );
    }

    /**
     * V2 compatible: Send message.
     * @param boc
     */
    async v2SendMessage(boc: string) {
        return this.post(
            "/api/v2/sendMessage",
            {
                boc
            },
            Schema.v2SendMessageResult
        );
    }

    /**
     * V2 compatible: Run get method.
     * @param address
     * @param method
     * @param stack
     */
    async v2RunGetMethod(address: string, method: string, stack: any[]) {
        return this.post(
            "/api/v2/runGetMethod",
            {
                address,
                method,
                stack
            },
            Schema.v2RunGetMethodResult
        );
    }

    /**
     * V2 compatible: Estimate fee.
     * @param address
     * @param body
     * @param init_code
     * @param init_data
     * @param ignore_chksig
     */
    async v2EstimateFee(address: string, body: string, init_code?: string, init_data?: string, ignore_chksig?: boolean) {
        return this.post(
            "/api/v2/estimateFee",
            {
                address,
                body,
                init_code,
                init_data,
                ignore_chksig
            },
            Schema.v2EstimateFeeResult
        );
    }

    /**
     * Get method of adapter.
     * @param method
     * @param params
     * @param returnSchema
     * @private
     */
    private async get<T>(method: string, params: any, returnSchema: z.ZodType<T>) {
        const headers: { [key: string]: any } = {
            "Content-Type": "application/json"
        };

        const requestParams: any = { ...params };
        if (this.#apiKey) {
            requestParams.api_key = this.#apiKey;
        }

        const config: { [key: string]: any } = {
            headers,
            timeout: this.#timeout,
            params: requestParams
        };
        if (this.#adapter) {
            config.adapter = this.#adapter;
        }

        const endpoint = this.#endpoint.endsWith("/") ? this.#endpoint.slice(0, -1) : this.#endpoint;

        const response = await axios.get<T>(
            endpoint + method,
            config
        );

        if (response.status !== 200) {
            throw Error("Error received: " + JSON.stringify(response.data));
        }

        const decoded = returnSchema.safeParse(response.data);
        if (!decoded.success) {
            if (this.#strictValidation) {
                throw Error(
                    "Broken response received: " + 
                    JSON.stringify(decoded.error.format(), null, 2) + 
                    "\n\nReceived data: " + 
                    JSON.stringify(response.data, null, 2)
                );
            } else {
                // Lenient mode: log warning and return raw data
                console.warn(
                    `[TonHttpApiV3] Schema validation warning for ${method}:`,
                    decoded.error.issues.slice(0, 5).map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
                );
                return response.data as T;
            }
        }

        return decoded.data;
    }

    /**
     * Post method of adapter.
     * @param method
     * @param params
     * @param returnSchema
     */
    private async post<T>(method: string, params: any, returnSchema: z.ZodType<T>) {
        const headers: { [key: string]: any } = {
            "Content-Type": "application/json"
        };
        if (this.#apiKey) {
            headers["X-API-Key"] = this.#apiKey;
        }

        const config: { [key: string]: any } = {
            headers,
            timeout: this.#timeout
        };
        if (this.#adapter) {
            config.adapter = this.#adapter;
        }

        const endpoint = this.#endpoint.endsWith("/") ? this.#endpoint.slice(0, -1) : this.#endpoint;

        const response = await axios.post<{ ok: boolean, result: T }>(
            endpoint + method,
            params,
            config
        );

        if (response.status !== 200) {
            throw Error("Error received: " + JSON.stringify(response.data));
        }

        const decoded = returnSchema.safeParse(response.data);
        if (!decoded.success) {
            if (this.#strictValidation) {
                throw Error(
                    "Broken response received: " + 
                    JSON.stringify(decoded.error.format(), null, 2) + 
                    "\n\nReceived data: " + 
                    JSON.stringify(response.data, null, 2)
                );
            } else {
                // Lenient mode: log warning and return raw data
                console.warn(
                    `[TonHttpApiV3] Schema validation warning for ${method}:`,
                    decoded.error.issues.slice(0, 5).map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
                );
                return response.data as T;
            }
        }

        return decoded.data;
    }

    /**
     * Serialization of stack items.
     * @param items
     */
    static serializeStack(items: TupleItem[]) {
        const stack: any[] = [];

        for (const item of items) {
            if (item.type === "int") {
                stack.push({
                    type: "num",
                    value: item.value.toString()
                });
                continue;
            }

            if (item.type === "cell") {
                stack.push({
                    type: "cell",
                    value: item.cell.toBoc().toString("base64")
                });
                continue;
            }

            if (item.type === "slice") {
                stack.push({
                    type: "slice",
                    value: item.cell.toBoc().toString("base64")
                });
                continue;
            }

            throw Error(`Unsupported stack item type received: ${item.type}`);
        }

        return stack;
    }

    /**
     * Deserialization of stack items.
     * @param items
     */
    static parseStack(items: any[]) {
        const stack: TupleItem[] = [];

        for (const item of items) {
            stack.push(TonHttpApiV3.parseStackItem(item));
        }

        return new TupleReader(stack);
    }

    /**
     * Deserialization of stack item.
     * @param item
     */
    static parseStackItem(item: any): TupleItem {
        if (item.value === null) {
            return {
                type: "null"
            };
        }

        if (item.type === "num") {
            if (item.value.startsWith("-")) {
                return {
                    type: "int",
                    value: -BigInt(item.value.slice(1))
                };
            }

            return {
                type: "int",
                value: BigInt(item.value)
            };
        }

        if (item.type === "cell") {
            return {
                type: "cell",
                cell: Cell.fromBase64(item.value)
            };
        }

        if (item.type === "slice") {
            return {
                type: "slice",
                cell: Cell.fromBase64(item.value)
            };
        }

        if (item.type === "list" || item.type === "tuple") {
            if (item.value.length === 0) {
                return {
                    type: "null"
                };
            }

            return {
                type: item.type,
                items: item.value.map(TonHttpApiV3.parseStackItem)
            };
        }

        throw Error(`Unsupported stack item type: ${item.type}`);
    }
}



