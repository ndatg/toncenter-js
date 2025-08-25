# toncenter-js

[![npm version](https://img.shields.io/npm/v/toncenter-js.svg)](https://www.npmjs.com/package/toncenter-js)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Downloads](https://img.shields.io/npm/dm/toncenter-js.svg)](https://www.npmjs.com/package/toncenter-js)

**toncenter-js** is a comprehensive TypeScript/JavaScript SDK for interacting with the TON blockchain via Toncenter API. It provides a simple and powerful interface for working with TON smart contracts, transactions, and blockchain data.

## ✨ Features

- 🚀 **Full Toncenter API Support** - Complete coverage of V2 and V3 APIs
- 📦 **TypeScript First** - Built with TypeScript, includes full type definitions
- 🔄 **Real-time Subscriptions** - Subscribe to blockchain events and new blocks
- 🛠️ **Smart Contract Integration** - Deploy and interact with smart contracts

## Documentation

Go to the [documentation](https://ndatg.github.io/toncenter-js/) for detailed information.

## Migration

If you need an older version of the library, use the [migrate](https://github.com/ndatg/toncenter-js/tree/migrate) branch.

## 🏗️ Architecture

| Component | Description | Status |
|-----------|-------------|--------|
| **TonHttpApiV3** | Latest Toncenter API V3 client | ✅ |
| **TonHttpApiV2** | Legacy Toncenter API V2 client | ✅ |
| **TonClientV3** | TON blockchain client (V3-based) | ✅ |
| **TonClientV2** | TON blockchain client (V2-based) | ✅ |
| **TonSubscriberV3** | Real-time block subscriber (V3) | ✅ |
| **TonSubscriberV2** | Real-time block subscriber (V2) | ✅ |
| **Block Storage** | Memory & Redis storage adapters | ✅ |


## 📦 Installation

```bash
npm install toncenter-js
```

```bash
yarn add toncenter-js
```

```bash
pnpm add toncenter-js
```

## 🚀 Quick Start

```typescript
import { TonHttpApiV3 } from "toncenter-js";

// Initialize API client
const api = new TonHttpApiV3({
    endpoint: "https://toncenter.com/",
    apiKey: "your-api-key" // Get it from @tonapibot
});

// Get masterchain info
const info = await api.getMasterchainInfo();
console.log(info);
```

## 📚 Usage Examples

> 💡 **API Key**: Register your API key with [@tonapibot](https://t.me/tonapibot) for higher rate limits and better performance.

> 📁 **More Examples**: Check out the [examples directory](https://github.com/ndatg/toncenter-js/tree/main/examples) for complete working examples.

### 🔥 Toncenter API V3 (Recommended)

The latest and most feature-rich API version with improved performance and additional endpoints.

```typescript
import { TonHttpApiV3 } from "toncenter-js";

const api = new TonHttpApiV3({
    endpoint: "https://toncenter.com/",
    apiKey: "your-api-key" // Get from @tonapibot
});

// Get blockchain info
const masterchainInfo = await api.getMasterchainInfo();
console.log("Masterchain info:", masterchainInfo);

// Work with NFTs
const nftCollections = await api.getNftCollections({
    collection_address: "EQCA14o1-VWhS2efqoh_9M1b_A9DtKTuoqfmkn83AbJzwnPi"
});

const nftItems = await api.getNftItems({
    collection_address: "EQCA14o1-VWhS2efqoh_9M1b_A9DtKTuoqfmkn83AbJzwnPi",
    limit: 10
});

// Work with Jettons
const jettonWallets = await api.getJettonWallets({
    jetton_address: "EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA",
    limit: 50
});
```

### 📜 Toncenter API V2 (Legacy)

For compatibility with older integrations, you can still use the V2 API.

```typescript
import { TonHttpApiV2 } from "toncenter-js";

const api = new TonHttpApiV2({
    endpoint: "https://toncenter.com/",
    apiKey: "your-api-key" // optional
});

// Get masterchain info
const masterchainInfo = await api.getMasterchainInfo();
console.log("Masterchain info:", masterchainInfo);

// Get account transactions
const transactions = await api.getTransactions(
    "EQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqB2N",
    { limit: 10 }
);
console.log("Transactions:", transactions);
```

### 🔧 Smart Contract Integration

`TonClientV3` and `TonClientV2` provide seamless integration with [@ton/core](https://github.com/ton-org/ton) for smart contract interactions.

#### 💰 Highload Wallet Example

Deploy and use a highload wallet for batch transactions:

```bash
npm install ton-highload-wallet-contract @ton/crypto @ton/core --save
```

```javascript
import { TonClientV3 } from "toncenter-js";
import { HighloadWalletContractV2 } from "ton-highload-wallet-contract";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { internal } from "@ton/core";

const client = new TonClientV3({
    endpoint: "https://toncenter.com/",
    apiKey: "", // optional
});

const mnemonic = [ /* ... */ ];

// create contract
const key = await mnemonicToPrivateKey(mnemonic);
const contract = client.open(HighloadWalletContractV2.create({ publicKey: key.publicKey, workchain: 0 }));
console.log(`send test coins to the address: ${contract.address}`);

// send transfer
await contract.sendTransfer({
    secretKey: key.secretKey,
    messages: [
        internal({
            to: "EQBYivdc0GAk-nnczaMnYNuSjpeXu2nJS3DZ4KqLjosX5sVC",
            value: "0.2",
            body: "test 1",
            bounce: false,
        }),
        internal({
            to: "EQBYivdc0GAk-nnczaMnYNuSjpeXu2nJS3DZ4KqLjosX5sVC",
            value: "0.2",
            body: "test 2",
            bounce: false,
        })
    ],
});

```

### 📡 Real-time Block Subscriber V3

Monitor blockchain events in real-time with `TonSubscriberV3`. It automatically handles block synchronization and provides transaction data from both masterchain and shardchains.

```javascript
import { 
    TonHttpApiV3, TonSubscriberV3, 
    TonMemoryBlockStorageV3, SchemaV3 
} from "toncenter-js";

const api = new TonHttpApiV3({
    endpoint: "https://toncenter.com/",
    apiKey: "" // optional
});

const storage = new TonMemoryBlockStorageV3();

const subscriber = new TonSubscriberV3({
    api: api,
    storage: storage,
    // logger: logger,
    // masterchainTickSleepTime: 3000,
    // startSeqno: 35744539
});
await subscriber.start();

subscriber.on("block", async (args: { block: SchemaV3.Block }) => {
    try {

        let offset = 0;
        let stopped = false;
        let transactions: any = [];

        do {
            try {
                const data = await api.getTransactionsByMasterchainBlock(args.block.seqno, {
                    limit: 256,
                    offset
                });
                transactions = [...transactions, ...data.transactions];

                if (data.transactions.length < 256) {
                    stopped = true;
                    break;
                }

                offset += 256;
            } catch (error) {
                console.log(error);
            }
        } while(!stopped);

        console.log(`seqno: ${args.block.seqno} / transactions: ${transactions.length}`);

    } catch (error) {
        console.log(error);
    }
});
```

### 📡 Real-time Block Subscriber V2 (Legacy)

For compatibility with V2 API, you can use `TonSubscriberV2` to monitor blockchain events.

```javascript
import { 
    TonHttpApiV2, TonSubscriberV2, 
    TonMemoryBlockStorageV2, SchemaV2 
} from "toncenter-js";

const api = new TonHttpApiV2({
    endpoint: "https://toncenter.com/",
    apiKey: "" // optional
});

const storage = new TonMemoryBlockStorageV2();

const subscriber = new TonSubscriberV2({
    api: api,
    storage: storage,
    // logger: logger,
    // masterchainTickSleepTime: 3000,
    // shardchainTickSleepTime: 100,
    // startSeqno: 35744539
});

subscriber.on("block", async (args: { block: SchemaV2.BlockHeader, shards?: SchemaV2.BlockShards }) => {
    try {

        const { workchain, shard, seqno } = args.block.id;

        let stopped = false;
        let transactions: any = [];
        do {
            try {
                const data = await api.getBlockTransactions(workchain, shard, seqno, {
                    count: 1024,
                });
                transactions = [...transactions, ...data.transactions];
                stopped = true;
            } catch (error) {
                console.log(error);
            }
        } while(!stopped);

        console.log(`workchain: ${workchain} / seqno: ${seqno} / transactions: ${transactions.length}`);

    } catch (error) {
        console.log(error);
    }
});
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/ndatg/toncenter-js/blob/main/LICENSE) file for details.

## 🔗 Links

- **Documentation**: [https://ndatg.github.io/toncenter-js/](https://ndatg.github.io/toncenter-js/)
- **NPM Package**: [https://www.npmjs.com/package/toncenter-js](https://www.npmjs.com/package/toncenter-js)
- **GitHub**: [https://github.com/ndatg/toncenter-js](https://github.com/ndatg/toncenter-js)
- **Toncenter API**: [https://toncenter.com/](https://toncenter.com/)
- **TON Documentation**: [https://docs.ton.org/](https://docs.ton.org/)

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/ndatg/toncenter-js/issues)
- **Telegram**: [@ndatg](https://t.me/ndatg)
- **API Key**: [@tonapibot](https://t.me/tonapibot)


