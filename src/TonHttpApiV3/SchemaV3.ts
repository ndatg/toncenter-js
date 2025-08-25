import { z } from "zod";

// AccountStatus
export const accountStatus = z.union([
    z.literal("uninit"),
    z.literal("frozen"),
    z.literal("active"),
    z.literal("nonexist")
]);
export type AccountStatus = z.infer<typeof accountStatus>;

// Account (for /api/v3/account endpoint)
export const account = z.object({
    balance: z.string(),
    code: z.string().nullable(),
    data: z.string().nullable(),
    last_transaction_lt: z.string().nullable(),
    last_transaction_hash: z.string().nullable(),
    frozen_hash: z.string().nullable(),
    status: accountStatus
});
export type Account = z.infer<typeof account>;

// AccountStateInfo (for /api/v3/accountStates endpoint)
export const accountStateInfo = z.object({
    address: z.string(),
    account_state_hash: z.string(),
    balance: z.string(),
    extra_currencies: z.object({}).passthrough(),
    status: z.string(),
    last_transaction_hash: z.string(),
    last_transaction_lt: z.string(),
    data_hash: z.string(),
    code_hash: z.string(),
    data_boc: z.string(),
    code_boc: z.string(),
    contract_methods: z.any().nullable()
});
export type AccountStateInfo = z.infer<typeof accountStateInfo>;

// AccountBalance
export const accountBalance = z.object({
    account: z.string(),
    balance: z.string()
});
export type AccountBalance = z.infer<typeof accountBalance>;

// AccountState
export const accountState = z.object({
    hash: z.string(),
    // account: z.string(),
    balance: z.string().nullable(),
    account_status: accountStatus.nullable(),
    frozen_hash: z.string().nullable(),
    code_hash: z.string().nullable(),
    data_hash: z.string().nullable()
});
export type AccountState = z.infer<typeof accountState>;

// AddressBookEntry
export const addressBookEntry = z.object({
    user_friendly: z.string()
});
export type AddressBookEntry = z.infer<typeof addressBookEntry>;

// Wallet
export const wallet = z.object({
    balance: z.string(),
    wallet_type: z.string().nullable(),
    seqno: z.number().nullable(),
    wallet_id: z.number().nullable(),
    last_transaction_lt: z.string().nullable(),
    last_transaction_hash: z.string().nullable(),
    status: z.string()
});
export type Wallet = z.infer<typeof wallet>;

// BlockReference
export const blockReference = z.object({
    workchain: z.number(),
    shard: z.string(),
    seqno: z.number()
});
export type BlockReference = z.infer<typeof blockReference>;

// Block
export const block = z.object({
    workchain: z.number(),
    shard: z.string(),
    seqno: z.number(),
    root_hash: z.string(),
    file_hash: z.string(),
    global_id: z.number(),
    version: z.number(),
    after_merge: z.boolean(),
    before_split: z.boolean(),
    after_split: z.boolean(),
    want_split: z.boolean(),
    key_block: z.boolean(),
    vert_seqno_incr: z.boolean(),
    flags: z.number(),
    gen_utime: z.string(),
    start_lt: z.string(),
    end_lt: z.string(),
    validator_list_hash_short: z.number(),
    gen_catchain_seqno: z.number(),
    min_ref_mc_seqno: z.number(),
    prev_key_block_seqno: z.number(),
    vert_seqno: z.number(),
    master_ref_seqno: z.number().nullable(),
    rand_seed: z.string(),
    created_by: z.string(),
    tx_count: z.number().nullable(),
    masterchain_block_ref: blockReference.nullable().optional()
});
export type Block = z.infer<typeof block>;

// MasterchainInfo
export const masterchainInfo = z.object({
    first: block,
    last: block
});
export type MasterchainInfo = z.infer<typeof masterchainInfo>;

// Blocks
export const blocks = z.object({
    blocks: z.array(block)
});
export type Blocks = z.infer<typeof blocks>;

// MasterchainBlockShards
export const masterchainBlockShards = blocks;
export type MasterchainBlockShards = z.infer<typeof masterchainBlockShards>;

// TextComment
export const textComment = z.object({
    type: z.literal("text_comment"),
    comment: z.string()
});
export type TextComment = z.infer<typeof textComment>;

// BinaryComment
export const binaryComment = z.object({
    type: z.literal("binary_comment"),
    hex_comment: z.string()
});
export type BinaryComment = z.infer<typeof binaryComment>;

// MesageContent
export const messageContent = z.object({
    hash: z.string(),
    body: z.string(),
    decoded: z.union([
        textComment,
        binaryComment
    ]).nullable()
});
export type MessageContent = z.infer<typeof messageContent>;

// MessageInitState
export const messageInitState = z.object({
    hash: z.string(),
    body: z.string()
});
export type MessageInitState = z.infer<typeof messageInitState>;

// Message
export const message = z.object({
    hash: z.string(),
    source: z.string().nullable(),
    destination: z.string().nullable(),
    value: z.string().nullable(),
    fwd_fee: z.string().nullable(),
    ihr_fee: z.string().nullable(),
    created_lt: z.string().nullable(),
    created_at: z.string().nullable(),
    opcode: z.string().nullable(),
    ihr_disabled: z.boolean().nullable(),
    bounce: z.boolean().nullable(),
    bounced: z.boolean().nullable(),
    import_fee: z.string().nullable(),
    message_content: messageContent.nullable(),
    init_state: messageInitState.nullable()
});
export type Message = z.infer<typeof message>;

// Transaction
export const transaction = z.object({
    account: z.string(),
    hash: z.string(),
    lt: z.string(),
    now: z.number(),
    orig_status: accountStatus,
    end_status: accountStatus,
    total_fees: z.string(),
    prev_trans_hash: z.string(),
    prev_trans_lt: z.string(),
    description: z.lazy(() => transactionDescr),
    block_ref: blockReference.nullable(),
    in_msg: message.nullable(),
    out_msgs: z.array(message),
    account_state_before: accountState.nullable(),
    account_state_after: accountState.nullable(),
    mc_block_seqno: z.number().nullable(),
    // New fields from official API
    trace_id: z.string().nullable(),
    trace_external_hash: z.string().nullable().optional(),
    emulated: z.boolean().optional(),
    total_fees_extra_currencies: z.record(z.string(), z.string()).optional()
});
export type Transaction = z.infer<typeof transaction>;

// Transactions
export const transactions = z.object({
    transactions: z.array(transaction),
    address_book: z.record(z.string(), addressBookEntry)
});
export type Transactions = z.infer<typeof transactions>;

// TransactionTrace
export const transactionTrace = z.object({
    id: z.string(),
    transaction: transaction,
    children: z.array(z.any())
});
export type TransactionTrace = z.infer<typeof transactionTrace>;

// Traces
export const traces = z.array(transactionTrace.nullable());
export type Traces = z.infer<typeof traces>;

// Messages
export const messages = z.object({
    messages: z.array(message)
});
export type Messages = z.infer<typeof messages>;

// NftCollection
export const nftCollection = z.object({
    address: z.string(),
    owner_address: z.string().nullable(),
    last_transaction_lt: z.string(),
    next_item_index: z.string(),
    collection_content: z.any(),
    code_hash: z.string(),
    data_hash: z.string()
});
export type NftCollection = z.infer<typeof nftCollection>;

// NftCollections
export const nftCollections = z.object({
    nft_collections: z.array(nftCollection)
});
export type NftCollections = z.infer<typeof nftCollections>;

// NftItem
export const nftItem = z.object({
    address: z.string(),
    collection_address: z.string().nullable(),
    owner_address: z.string().nullable(),
    init: z.boolean(),
    index: z.string(),
    last_transaction_lt: z.string(),
    code_hash: z.string(),
    data_hash: z.string(),
    content: z.any(),
    collection: nftCollection.nullable()
});
export type NftItem = z.infer<typeof nftItem>;

// NftItems
export const nftItems = z.object({
    nft_items: z.array(nftItem)
});
export type NftItems = z.infer<typeof nftItems>;

// NftTransfer
export const nftTransfer = z.object({
    query_id: z.string(),
    nft_address: z.string(),
    transaction_hash: z.string(),
    transaction_lt: z.string(),
    transaction_now: z.number(),
    old_owner: z.string(),
    new_owner: z.string(),
    response_destination: z.string().nullable(),
    custom_payload: z.string().nullable(),
    forward_amount: z.string(),
    forward_payload: z.string().nullable()
});

// NftTransfers
export const nftTransfers = z.object({
    nft_transfers: z.array(nftTransfer)
});
export type NftTransfers = z.infer<typeof nftTransfers>;

// JettonMaster
export const jettonMaster = z.object({
    address: z.string(),
    total_supply: z.string(),
    mintable: z.boolean(),
    admin_address: z.string().nullable(),
    last_transaction_lt: z.string(),
    jetton_wallet_code_hash: z.string(),
    jetton_content: z.any(),
    code_hash: z.string(),
    data_hash: z.string()
});
export type JettonMaster = z.infer<typeof jettonMaster>;

// JettonMasters
export const jettonMasters = z.object({
    jetton_masters: z.array(jettonMaster)
});
export type JettonMasters = z.infer<typeof jettonMasters>;

// JettonWallet
export const jettonWallet = z.object({
    address: z.string(),
    balance: z.string(),
    owner: z.string(),
    jetton: z.string(),
    last_transaction_lt: z.string(),
    code_hash: z.string(),
    data_hash: z.string()
});
export type JettonWallet = z.infer<typeof jettonWallet>;

// JettonWallets
export const jettonWallets = z.object({
    jetton_wallets: z.array(jettonWallet)
});
export type JettonWallets = z.infer<typeof jettonWallets>;

export const jettonTransfer = z.object({
    query_id: z.string(),
    source: z.string(),
    destination: z.string(),
    amount: z.string(),
    source_wallet: z.string(),
    jetton_master: z.string(),
    transaction_hash: z.string(),
    transaction_lt: z.string(),
    transaction_now: z.number(),
    response_destination: z.string().nullable(),
    custom_payload: z.string().nullable(),
    forward_ton_amount: z.string().nullable(),
    forward_payload: z.string().nullable()
});
export type JettonTransfer = z.infer<typeof jettonTransfer>;

// JettonTransfers
export const jettonTransfers = z.object({
    jetton_transfers: z.array(jettonTransfer)
});
export type JettonTransfers = z.infer<typeof jettonTransfers>;

// JettonBurn
export const jettonBurn = z.object({
    query_id: z.string(),
    owner: z.string(),
    jetton_master: z.string(),
    transaction_hash: z.string(),
    transaction_lt: z.string(),
    transaction_now: z.number(),
    response_destination: z.string().nullable(),
    custom_payload: z.string().nullable(),
});
export type JettonBurn = z.infer<typeof jettonBurn>;

// JettonBurns
export const jettonBurns = z.object({
    jetton_burns: z.array(jettonBurn)
});
export type JettonBurns = z.infer<typeof jettonBurns>;

// TopAccountsByBalance
export const topAccountByBalance = z.array(accountBalance);
export type TopAccountByBalance = z.infer<typeof topAccountByBalance>;

// SendMessage
export const sendMessage = z.object({
    message_hash: z.string()
});
export type SendMessage = z.infer<typeof sendMessage>;

// RunGetMethod
export const runGetMethod = z.object({
    gas_used: z.number(),
    exit_code: z.number(),
    stack: z.array(z.object({
        type: z.union([
            z.literal("cell"),
            z.literal("slice"),
            z.literal("num"),
            z.literal("list"),
            z.literal("tuple"),
            z.literal("unsupported_type")
        ]),
        value: z.any()
    }))
});
export type RunGetMethod = z.infer<typeof runGetMethod>;

// Fee
export const fee = z.object({
    in_fwd_fee: z.number(),
    storage_fee: z.number(),
    gas_fee: z.number(),
    fwd_fee: z.number()
});

// EstimateFee
export const estimateFee = z.object({
    source_fees: fee,
    destination_fees: z.array(fee)
});
export type EstimateFee = z.infer<typeof estimateFee>;

// Additional schemas from OpenAPI v3 specification

// BlockId
export const blockId = z.object({
    workchain: z.number(),
    shard: z.string(),
    seqno: z.number()
});
export type BlockId = z.infer<typeof blockId>;

// ActionPhase
export const actionPhase = z.object({
    success: z.boolean(),
    valid: z.boolean(),
    no_funds: z.boolean(),
    status_change: z.string(),
    total_fwd_fees: z.string().optional(),
    total_action_fees: z.string().optional(),
    result_code: z.number(),
    result_arg: z.number().optional(),
    tot_actions: z.number(),
    spec_actions: z.number(),
    skipped_actions: z.number(),
    msgs_created: z.number(),
    action_list_hash: z.string(),
    tot_msg_size_cells: z.number().optional(),
    tot_msg_size_bits: z.number().optional()
});
export type ActionPhase = z.infer<typeof actionPhase>;

// BouncePhase
export const bouncePhase = z.object({
    type: z.string(),
    msg_size_cells: z.number().optional(),
    msg_size_bits: z.number().optional(),
    req_fwd_fees: z.string().optional(),
    msg_fees: z.string().optional(),
    fwd_fees: z.string().optional()
});
export type BouncePhase = z.infer<typeof bouncePhase>;

// ComputePhase
export const computePhase = z.object({
    type: z.string().optional(),
    success: z.boolean().optional(),
    msg_state_used: z.boolean().optional(),
    account_activated: z.boolean().optional(),
    gas_fees: z.string().optional(),
    gas_used: z.string().optional(),
    gas_limit: z.string().optional(),
    gas_credit: z.string().optional(),
    mode: z.number().optional(),
    exit_code: z.number().optional(),
    exit_arg: z.number().optional(),
    vm_steps: z.number().optional(),
    vm_init_state_hash: z.string().optional(),
    vm_final_state_hash: z.string().optional()
});
export type ComputePhase = z.infer<typeof computePhase>;

// CreditPhase
export const creditPhase = z.object({
    fees_collected: z.string().optional(),
    credit: z.string().optional()
});
export type CreditPhase = z.infer<typeof creditPhase>;

// StoragePhase
export const storagePhase = z.object({
    fees_collected: z.string().optional(),
    fees_due: z.string().optional(),
    status_change: z.string()
});
export type StoragePhase = z.infer<typeof storagePhase>;

// SplitInfo
export const splitInfo = z.object({
    cur_shard_pfx_len: z.number(),
    acc_split_depth: z.number(),
    this_addr: z.string(),
    sibling_addr: z.string()
});
export type SplitInfo = z.infer<typeof splitInfo>;

// TransactionDescr
export const transactionDescr = z.object({
    type: z.string(),
    credit_first: z.boolean().optional(),
    storage_ph: storagePhase.optional(),
    credit_ph: creditPhase.optional(),
    compute_ph: computePhase.optional(),
    action: actionPhase.optional(),
    bounce: bouncePhase.optional(),
    aborted: z.boolean().optional(),
    destroyed: z.boolean().optional(),
    split_info: splitInfo.optional(),
    installed: z.boolean().optional(),
    is_tock: z.boolean().optional()
});
export type TransactionDescr = z.infer<typeof transactionDescr>;

// Action (from actions endpoint) - updated to match real API response
export const action = z.object({
    trace_id: z.string(),
    action_id: z.string(),
    start_lt: z.string(),
    end_lt: z.string(),
    start_utime: z.number(),
    end_utime: z.number(),
    trace_end_lt: z.string(),
    trace_end_utime: z.number(),
    trace_mc_seqno_end: z.number(),
    transactions: z.array(z.string()),
    success: z.boolean(),
    type: z.string(),
    details: z.object({
        source: z.string().optional(),
        destination: z.string().optional(),
        value: z.string().optional(),
        value_extra_currencies: z.object({}).passthrough().optional(),
        comment: z.string().nullable().optional(),
        encrypted: z.boolean().optional(),
        asset: z.string().optional(),
        sender: z.string().optional(),
        receiver: z.string().optional(),
        sender_jetton_wallet: z.string().optional(),
        receiver_jetton_wallet: z.string().optional(),
        amount: z.string().optional(),
        is_encrypted_comment: z.boolean().optional(),
        query_id: z.string().optional(),
        response_destination: z.string().optional(),
        custom_payload: z.string().nullable().optional(),
        forward_payload: z.string().nullable().optional(),
        forward_amount: z.string().optional()
    }),
    trace_external_hash: z.string(),
    trace_external_hash_norm: z.string().optional()
});
export type Action = z.infer<typeof action>;

// ActionsResponse
export const actionsResponse = z.object({
    actions: z.array(action),
    address_book: z.record(z.string(), addressBookEntry).optional(),
    metadata: z.record(z.string(), z.object({
        is_indexed: z.boolean(),
        token_info: z.array(z.object({
            valid: z.boolean(),
            type: z.string(),
            name: z.string().optional(),
            symbol: z.string().optional(),
            description: z.string().optional(),
            image: z.string().optional(),
            extra: z.object({}).passthrough().optional()
        })).optional()
    })).optional()
});
export type ActionsResponse = z.infer<typeof actionsResponse>;

// AccountStatesResponse
export const accountStatesResponse = z.object({
    accounts: z.array(accountStateInfo),
    address_book: z.record(z.string(), addressBookEntry).optional(),
    metadata: z.object({}).passthrough().optional()
});
export type AccountStatesResponse = z.infer<typeof accountStatesResponse>;

// AddressBook (standalone)
export const addressBook = z.record(z.string(), addressBookEntry);
export type AddressBook = z.infer<typeof addressBook>;



// TraceInfo
export const traceInfo = z.object({
    trace_state: z.string(),
    messages: z.number(),
    transactions: z.number(),
    pending_messages: z.number(),
    classification_state: z.string()
});
export type TraceInfo = z.infer<typeof traceInfo>;

// Simple TraceNode for trace field
export const simpleTraceNode = z.object({
    tx_hash: z.string(),
    children: z.array(z.any()) // Can be empty or contain other trace nodes
});
export type SimpleTraceNode = z.infer<typeof simpleTraceNode>;

// Full Trace object
export const trace = z.object({
    trace_id: z.string(),
    external_hash: z.string().nullable(),
    mc_seqno_start: z.string(),
    mc_seqno_end: z.string(),
    start_lt: z.string(),
    start_utime: z.number(),
    end_lt: z.string(),
    end_utime: z.number(),
    trace_info: traceInfo,
    is_incomplete: z.boolean(),
    trace: simpleTraceNode,
    transactions_order: z.array(z.string()),
    transactions: z.record(z.string(), z.any()) // Use z.any() to avoid validation issues
});
export type Trace = z.infer<typeof trace>;

// TraceNode (with lazy evaluation for circular reference) - for transaction trace
export const traceNode: z.ZodType<{
    tx_hash: string;
    in_msg_hash?: string;
    transaction: Transaction;
    in_msg?: Message;
    children: TraceNode[];
}> = z.object({
    tx_hash: z.string(),
    in_msg_hash: z.string().optional(),
    transaction: transaction,
    in_msg: message.optional(),
    children: z.array(z.lazy(() => traceNode))
});
export type TraceNode = z.infer<typeof traceNode>;

// TracesResponse (for /api/v3/traces)
export const tracesResponse = z.object({
    traces: z.array(trace),
    address_book: z.record(z.string(), addressBookEntry).optional(),
    metadata: z.object({}).passthrough().optional()
});
export type TracesResponse = z.infer<typeof tracesResponse>;

// V2 compatibility schemas for mixed endpoints
export const v2AddressInformation = z.object({
    ok: z.boolean(),
    result: z.object({
        "@type": z.string(),
        balance: z.string(),
        extra_currencies: z.array(z.any()),
        code: z.string(),
        data: z.string(),
        last_transaction_id: z.object({
            "@type": z.string(),
            lt: z.string(),
            hash: z.string()
        }),
        block_id: z.object({
            "@type": z.string(),
            workchain: z.number(),
            shard: z.string(),
            seqno: z.number(),
            root_hash: z.string(),
            file_hash: z.string()
        }),
        frozen_hash: z.string(),
        sync_utime: z.number(),
        "@extra": z.string(),
        state: z.string()
    })
});
export type V2AddressInformation = z.infer<typeof v2AddressInformation>;

export const v2WalletInformation = z.object({
    ok: z.boolean(),
    result: z.object({
        wallet: z.boolean(),
        balance: z.string(),
        account_state: z.string(),
        wallet_type: z.string(),
        seqno: z.number(),
        last_transaction_id: z.object({
            "@type": z.string(),
            lt: z.string(),
            hash: z.string()
        }),
        wallet_id: z.number()
    })
});
export type V2WalletInformation = z.infer<typeof v2WalletInformation>;

// V2 RunGetMethod result
export const v2RunGetMethodResult = z.object({
    ok: z.boolean(),
    result: z.object({
        "@type": z.string(),
        gas_used: z.number(),
        stack: z.array(z.tuple([z.string(), z.any()])),
        exit_code: z.number(),
        "@extra": z.string(),
        block_id: z.object({
            "@type": z.string(),
            workchain: z.number(),
            shard: z.string(),
            seqno: z.number(),
            root_hash: z.string(),
            file_hash: z.string()
        }),
        last_transaction_id: z.object({
            "@type": z.string(),
            lt: z.string(),
            hash: z.string()
        })
    })
});
export type V2RunGetMethodResult = z.infer<typeof v2RunGetMethodResult>;

// V2 EstimateFee result
export const v2EstimateFeeResult = z.object({
    ok: z.boolean(),
    result: z.object({
        "@type": z.string(),
        source_fees: z.object({
            "@type": z.string(),
            in_fwd_fee: z.number(),
            storage_fee: z.number(),
            gas_fee: z.number(),
            fwd_fee: z.number()
        }),
        destination_fees: z.array(z.object({
            "@type": z.string(),
            in_fwd_fee: z.number(),
            storage_fee: z.number(),
            gas_fee: z.number(),
            fwd_fee: z.number()
        })),
        "@extra": z.string()
    })
});
export type V2EstimateFeeResult = z.infer<typeof v2EstimateFeeResult>;

// Request schemas
export const v2EstimateFeeRequest = z.object({
    address: z.string(),
    body: z.string(),
    init_code: z.string().optional(),
    init_data: z.string().optional(),
    ignore_chksig: z.boolean().optional()
});
export type V2EstimateFeeRequest = z.infer<typeof v2EstimateFeeRequest>;

export const v2RunGetMethodRequest = z.object({
    address: z.string(),
    method: z.string(),
    stack: z.array(z.object({
        type: z.string(),
        value: z.any()
    }))
});
export type V2RunGetMethodRequest = z.infer<typeof v2RunGetMethodRequest>;

export const v2SendMessageRequest = z.object({
    boc: z.string()
});
export type V2SendMessageRequest = z.infer<typeof v2SendMessageRequest>;

// Response schemas
export const v2SendMessageResult = z.object({
    message_hash: z.string(),
    message_hash_norm: z.string()
});
export type V2SendMessageResult = z.infer<typeof v2SendMessageResult>;

// Metadata schema (for /api/v3/metadata endpoint)
export const metadata = z.object({
    is_indexed: z.boolean(),
    token_info: z.array(z.object({
        valid: z.boolean(),
        type: z.string(),
        name: z.string().optional(),
        symbol: z.string().optional(),
        description: z.string().optional(),
        image: z.string().optional(),
        extra: z.object({}).passthrough().optional()
    })).optional()
});
export type Metadata = z.infer<typeof metadata>;

// MetadataResponse (for /api/v3/metadata endpoint)
export const metadataResponse = z.record(z.string(), z.any());
export type MetadataResponse = z.infer<typeof metadataResponse>;

// WalletState (for /api/v3/walletStates endpoint)
export const walletState = z.object({
    address: z.string(),
    balance: z.string(),
    wallet_type: z.string().nullable(),
    seqno: z.number().nullable(),
    wallet_id: z.number().nullable(),
    last_transaction_lt: z.string(),
    last_transaction_hash: z.string(),
    status: z.string(),
    code_hash: z.string(),
    extra_currencies: z.record(z.string(), z.string()).optional(),
    is_wallet: z.boolean(),
    is_signature_allowed: z.boolean().optional()
});
export type WalletState = z.infer<typeof walletState>;

// WalletStatesResponse (for /api/v3/walletStates endpoint)
export const walletStatesResponse = z.object({
    wallets: z.array(walletState),
    address_book: z.record(z.string(), addressBookEntry).optional(),
    metadata: z.record(z.string(), metadata).optional()
});
export type WalletStatesResponse = z.infer<typeof walletStatesResponse>;

// PendingAction (for /api/v3/pendingActions endpoint)
export const pendingAction = z.object({
    trace_id: z.string(),
    action_id: z.string(),
    start_lt: z.string(),
    end_lt: z.string(),
    start_utime: z.number(),
    end_utime: z.number(),
    trace_end_lt: z.string(),
    trace_end_utime: z.number(),
    trace_mc_seqno_end: z.number(),
    transactions: z.array(z.string()),
    success: z.boolean(),
    type: z.string(),
    details: z.object({
        source: z.string().optional(),
        destination: z.string().optional(),
        value: z.string().optional(),
        value_extra_currencies: z.object({}).passthrough().optional(),
        comment: z.string().nullable().optional(),
        encrypted: z.boolean().optional(),
        asset: z.string().optional(),
        sender: z.string().optional(),
        receiver: z.string().optional(),
        sender_jetton_wallet: z.string().optional(),
        receiver_jetton_wallet: z.string().optional(),
        amount: z.string().optional(),
        is_encrypted_comment: z.boolean().optional(),
        query_id: z.string().optional(),
        response_destination: z.string().optional(),
        custom_payload: z.string().nullable().optional(),
        forward_payload: z.string().nullable().optional(),
        forward_amount: z.string().optional()
    }),
    trace_external_hash: z.string(),
    trace_external_hash_norm: z.string().optional(),
    pending: z.boolean()
});
export type PendingAction = z.infer<typeof pendingAction>;

// PendingActionsResponse (for /api/v3/pendingActions endpoint)
export const pendingActionsResponse = z.object({
    actions: z.array(pendingAction),
    address_book: z.record(z.string(), addressBookEntry).optional(),
    metadata: z.record(z.string(), metadata).optional()
});
export type PendingActionsResponse = z.infer<typeof pendingActionsResponse>;

// PendingTrace (for /api/v3/pendingTraces endpoint)
export const pendingTrace = z.object({
    trace_id: z.string(),
    external_hash: z.string().nullable(),
    mc_seqno_start: z.string(),
    mc_seqno_end: z.string(),
    start_lt: z.string(),
    start_utime: z.number(),
    end_lt: z.string(),
    end_utime: z.number(),
    trace_info: traceInfo,
    is_incomplete: z.boolean(),
    trace: simpleTraceNode,
    transactions_order: z.array(z.string()),
    transactions: z.record(z.string(), z.any()),
    pending: z.boolean()
});
export type PendingTrace = z.infer<typeof pendingTrace>;

// PendingTracesResponse (for /api/v3/pendingTraces endpoint)
export const pendingTracesResponse = z.object({
    traces: z.array(pendingTrace).nullable(),
    address_book: z.record(z.string(), addressBookEntry).optional(),
    metadata: z.record(z.string(), metadata).optional()
});
export type PendingTracesResponse = z.infer<typeof pendingTracesResponse>;

// WalletInformation (for /api/v3/walletInformation endpoint)
export const walletInformation = z.object({
    balance: z.string(),
    wallet_type: z.string().nullable(),
    seqno: z.number().nullable(),
    wallet_id: z.number().nullable(),
    last_transaction_lt: z.string(),
    last_transaction_hash: z.string(),
    status: z.string()
});
export type WalletInformation = z.infer<typeof walletInformation>;

// MasterchainBlockShardStateResponse (for /api/v3/masterchainBlockShardState endpoint)
export const masterchainBlockShardStateResponse = z.object({
    blocks: z.array(block)
});
export type MasterchainBlockShardStateResponse = z.infer<typeof masterchainBlockShardStateResponse>;

// PendingTransaction (for /api/v3/pendingTransactions endpoint)
export const pendingTransaction = z.object({
    account: z.string(),
    hash: z.string(),
    lt: z.string(),
    now: z.number(),
    orig_status: accountStatus,
    end_status: accountStatus,
    total_fees: z.string(),
    prev_trans_hash: z.string(),
    prev_trans_lt: z.string(),
    description: transactionDescr,
    block_ref: blockReference.nullable(),
    in_msg: message.nullable(),
    out_msgs: z.array(message),
    account_state_before: accountState.nullable(),
    account_state_after: accountState.nullable(),
    mc_block_seqno: z.number().nullable(),
    trace_id: z.string().nullable(),
    trace_external_hash: z.string().nullable().optional(),
    emulated: z.boolean().optional(),
    total_fees_extra_currencies: z.record(z.string(), z.string()).optional(),
    pending: z.boolean()
});
export type PendingTransaction = z.infer<typeof pendingTransaction>;

// PendingTransactionsResponse
export const pendingTransactionsResponse = z.object({
    transactions: z.array(pendingTransaction),
    address_book: z.record(z.string(), addressBookEntry).optional()
});
export type PendingTransactionsResponse = z.infer<typeof pendingTransactionsResponse>;

// DNSRecord (for /api/v3/dns/records endpoint)
export const dnsRecord = z.object({
    domain: z.string(),
    record_type: z.string(),
    value: z.string(),
    resolver_address: z.string(),
    last_update_time: z.number()
});
export type DNSRecord = z.infer<typeof dnsRecord>;

// DNSRecordsResponse
export const dnsRecordsResponse = z.object({
    records: z.array(dnsRecord)
});
export type DNSRecordsResponse = z.infer<typeof dnsRecordsResponse>;

// MultisigOrder (for /api/v3/multisig/orders endpoint)
export const multisigOrder = z.object({
    order_id: z.string(),
    multisig_address: z.string(),
    order_seqno: z.number(),
    threshold: z.number(),
    sent_for_execution: z.boolean(),
    signers: z.array(z.string()),
    approvals_mask: z.string(),
    approvals_num: z.number(),
    expiration_date: z.number(),
    order: z.object({
        type: z.string(),
        actions: z.array(z.any())
    })
});
export type MultisigOrder = z.infer<typeof multisigOrder>;

// MultisigOrdersResponse
export const multisigOrdersResponse = z.object({
    orders: z.array(multisigOrder),
    address_book: z.record(z.string(), addressBookEntry).optional()
});
export type MultisigOrdersResponse = z.infer<typeof multisigOrdersResponse>;

// MultisigWallet (for /api/v3/multisig/wallets endpoint)
export const multisigWallet = z.object({
    address: z.string(),
    balance: z.string(),
    threshold: z.number(),
    signers: z.array(z.string()),
    proposers: z.array(z.string()),
    orders_count: z.number(),
    last_transaction_lt: z.string(),
    last_transaction_hash: z.string(),
    status: z.string()
});
export type MultisigWallet = z.infer<typeof multisigWallet>;

// MultisigWalletsResponse
export const multisigWalletsResponse = z.object({
    wallets: z.array(multisigWallet),
    address_book: z.record(z.string(), addressBookEntry).optional()
});
export type MultisigWalletsResponse = z.infer<typeof multisigWalletsResponse>;

// VestingContract (for /api/v3/vesting endpoint)
export const vestingContract = z.object({
    address: z.string(),
    owner_address: z.string(),
    sender_address: z.string(),
    start_time: z.number(),
    total_duration: z.number(),
    unlock_period: z.number(),
    cliff_duration: z.number(),
    total_amount: z.string(),
    whitelist: z.array(z.string())
});
export type VestingContract = z.infer<typeof vestingContract>;

// VestingResponse
export const vestingResponse = z.object({
    vesting_contracts: z.array(vestingContract),
    address_book: z.record(z.string(), addressBookEntry).optional()
});
export type VestingResponse = z.infer<typeof vestingResponse>;


