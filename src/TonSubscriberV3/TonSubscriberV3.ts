import { EventEmitter } from "events";
import { TonHttpApiV3 } from "../TonHttpApiV3/TonHttpApiV3";
import { TonBlockStorageV3 } from "./TonBlockStorageV3";
import { sleep } from "../utils";

export interface TonSubscriberV3Parameters {

    api: TonHttpApiV3;

    storage: TonBlockStorageV3;

    masterchainTickSleepTime?: number;

    logger?: any;

    startSeqno?: number;
}

export class TonSubscriberV3 extends EventEmitter {

    readonly #api: TonHttpApiV3;

    readonly #storage: TonBlockStorageV3;

    readonly #masterchainTickSleepTime: number;

    readonly #logger: {
        info: any,
        error: any
    };

    #startSeqno: number;

    #stopped = false;

    constructor(params: TonSubscriberV3Parameters) {
        super();

        this.#api = params.api;
        this.#storage = params.storage;

        this.#masterchainTickSleepTime = params?.masterchainTickSleepTime || 5_000;
        this.#logger = params?.logger || {
            info: console.log,
            error: console.error
        };
        this.#startSeqno = params?.startSeqno || -1;
    }

    /**
     * Start monitoring blocks in the masterchain, initialize initial data.
     */
    async start() {
        this.#stopped = false;
        this.#logger.info("start subscriber");

        if (this.#startSeqno >= 0) {
            // If starting from a specific seqno, check if we need to reset storage
            const lastSavedSeqno = await this.#storage.getLastMasterchainBlock();
            
            if (lastSavedSeqno !== null && this.#startSeqno < lastSavedSeqno) {
                // Starting from earlier seqno than saved - clear all blocks to reprocess from startSeqno
                this.#logger.info(`Starting from earlier seqno (${this.#startSeqno}) than saved (${lastSavedSeqno}), clearing all blocks`);
                await this.#storage.clean();
            }
        } else {
            const masterchainInfo = await this.#api.getMasterchainInfo();
            await sleep(1000);

            this.#startSeqno = masterchainInfo.last.seqno;
        }

        this.masterchainTick();
    }

    /**
     * Stop monitoring blocks in the masterchain.
     */
    async stop() {
        this.#stopped = true;
        this.#logger.info("stop subscriber");
    }

    /**
     * Clean up the storage.
     */
    async clean() {
        await this.#storage.clean();
        this.#logger.info("clean storage");
    }

    /**
     * Monitoring blocks in the masterchain.
     * @private
     */
    private async masterchainTick() {

        while(!this.#stopped) {
            try {
                const lastSavedSeqno = await this.#storage.getLastMasterchainBlock();
                const startFromSeqno = lastSavedSeqno ?? this.#startSeqno;
                
                if (startFromSeqno < 0) {
                    throw Error("no init masterchain block in storage");
                }

                const lastMasterchainInfo = await this.#api.getMasterchainInfo();
                const lastSeqno = lastMasterchainInfo.last.seqno;
                if (!lastSeqno) {
                    throw Error("invalid last masterchain block from provider");
                }

                const fromSeqno = lastSavedSeqno !== null ? lastSavedSeqno + 1 : this.#startSeqno;
                for (let i = fromSeqno; i <= lastSeqno; i += 1) {
                    this.#logger.info(`masterchain tick - seqno: ${i}`);

                    const getBlock = await this.#api.getBlocks({
                        workchain: lastMasterchainInfo.last.workchain,
                        seqno: i,
                        shard: lastMasterchainInfo.last.shard
                    });
                    
                    if (!getBlock.blocks || getBlock.blocks.length === 0) {
                        throw Error(`no blocks returned for seqno: ${i}`);
                    }
                    
                    await this.#storage.insertMasterchainBlock(i);
                    this.emit("block", {
                        block: getBlock.blocks[0]
                    });
                }

                await sleep(this.#masterchainTickSleepTime);
            } catch (error) {
                this.#logger.error(`masterchain tick error: ${error}`);
                await sleep(this.#masterchainTickSleepTime);
            }
        }
    }
}
