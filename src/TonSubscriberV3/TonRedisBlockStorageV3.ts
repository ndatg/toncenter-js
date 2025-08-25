import Redis from "ioredis";
import { TonBlockStorageV3 } from "./TonBlockStorageV3";

export class TonRedisBlockStorageV3 implements TonBlockStorageV3 {

    readonly #redis: Redis;

    constructor(conn: string) {
        this.#redis = new Redis(conn);
    }

    /**
     * Insert a new masterchain block into the masterchain hashtable.
     * @param seqno
     */
    async insertMasterchainBlock(seqno: number) {
        const result = await this.#redis.hsetnx("ton:masterchain:blocks", `${seqno}`, 1);
        if (result === 0) {
            throw Error(`masterchain block already exists! seqno: ${seqno}`);
        }
    }

    /**
     * Get the last inserted masterchain block from the masterchain hashtable.
     */
    async getLastMasterchainBlock() {
        const masterchainBlocks = await this.#redis.hgetall("ton:masterchain:blocks");
        const data = Object.keys(masterchainBlocks)
            .map(x => Number(x))
            .sort((a, b) => b - a);
        return Object.keys(masterchainBlocks).length > 0 ? data[0] : null;
    }

    /**
     * Clean up the hashtable.
     */
    async clean() {
        await this.#redis.del("ton:masterchain:blocks");
    }
}
