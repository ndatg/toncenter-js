import { TonBlockStorageV2 } from "./TonBlockStorageV2";
import { BlockIdExt } from "../TonHttpApiV2/SchemaV2";

export class TonMemoryBlockStorageV2 implements TonBlockStorageV2 {

    #masterchainBlocks: {
        [key: number]: boolean
    };

    #shardchainBlocks: {
        [key: string]: boolean
    };

    constructor() {
        this.#masterchainBlocks = {};
        this.#shardchainBlocks = {};
    }

    /**
     * Insert new shardchain blocks into the shardchains hashtable.
     * @param shards
     */
    async insertShardchainBlocks(shards: BlockIdExt[]) {
        for (const { workchain, shard, seqno } of shards) {
            if (workchain === -1) {
                continue;
            }

            if (this.#shardchainBlocks[`${workchain}_${shard}_${seqno}`] !== undefined) {
                continue;
            }

            this.#shardchainBlocks[`${workchain}_${shard}_${seqno}`] = false;
        }
    }

    /**
     * Insert a new masterchain block into the masterchain hashtable.
     * @param seqno
     */
    async insertMasterchainBlock(seqno: number) {
        if (this.#masterchainBlocks[seqno] !== undefined) {
            throw Error(`masterchain block already exists! seqno: ${seqno}`);
        }
        this.#masterchainBlocks[seqno] = true;
    }

    /**
     * Get the last inserted masterchain block from the masterchain hashtable.
     */
    async getLastMasterchainBlock() {
        const data = Object.keys(this.#masterchainBlocks)
            .map(x => Number(x))
            .sort((a, b) => b - a);
        return data.length > 0 ? data[0] : null;
    }

    /**
     * Get the last unprocessed shardchain block from the shardchains hashtable.
     */
    async getUnprocessedShardchainBlock() {
        // Get all unprocessed blocks and sort them by seqno for deterministic order
        const unprocessedBlocks: { workchain: number, shard: string, seqno: number }[] = [];
        
        for (const key in this.#shardchainBlocks) {
            if (!this.#shardchainBlocks[key]) {
                const data = key.split("_");
                
                // Validate that we have exactly 3 parts and they are valid
                if (data.length !== 3 || isNaN(Number(data[0])) || isNaN(Number(data[2]))) {
                    continue; // Skip invalid keys
                }
                
                unprocessedBlocks.push({
                    workchain: Number(data[0]),
                    shard: data[1],
                    seqno: Number(data[2])
                });
            }
        }

        // Sort by seqno to ensure deterministic processing order (oldest first)
        if (unprocessedBlocks.length > 0) {
            unprocessedBlocks.sort((a, b) => a.seqno - b.seqno);
            return unprocessedBlocks[0];
        }

        return null;
    }

    /**
     * Process a shardchain block in the sharchains hashtable.
     * @param workchain
     * @param shard
     * @param seqno
     * @param prevShardBlocks
     */
    async setShardchainBlockProcessed(workchain: number, shard: string, seqno: number, prevShardBlocks: BlockIdExt[]) {
        if (this.#shardchainBlocks[`${workchain}_${shard}_${seqno}`] === undefined) {
            throw Error(
                `shardchain not found! workchain: ${workchain} / shard: ${shard} / seqno: ${seqno}`
            );
        }

        this.#shardchainBlocks[`${workchain}_${shard}_${seqno}`] = true;
        await this.insertShardchainBlocks(prevShardBlocks);
    }

    /**
     * Clean up the hashtables.
     */
    async clean() {
        this.#masterchainBlocks = {};
        this.#shardchainBlocks = {};
    }
}
