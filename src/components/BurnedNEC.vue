<template>
    <div class="burnednec">
        <div class="burnednec_left">
            <p class="burnednec_amount number">{{ cTotalBurned }} <span class="burnednec_nec">NEC</span></p>
        </div>

        <template v-if="blocks.length > 0">
            <ul class="no-markers">
                <li v-for="block in blocks" :key="block.blockNumber" class="burnednec_block" :class="{ 'burnednec_block-animate': block.__animate__ }">
                    <div class="burnednec_block_burned number">
                        <span class="fsvgicon">
                            <icon
                                data="@/assets/svg/fire.svg"
                                width="20"
                                height="20"
                                color="#ff711f"
                                aria-hidden="true"
                            />
                        </span>
                        <span>{{ block.necValue }}</span>
                    </div>
                    <div class="burnednec_block_info">
                        Block {{ formatHexToInt(block.blockNumber) }} <br />
                        <timeago :datetime="timestampToDate(block.timestamp)" :auto-update="1" :converter-options="{includeSeconds: true}"></timeago>
                    </div>
                </li>
            </ul>
        </template>
    </div>
</template>

<script>
import {pollingMixin} from "@/mixins/polling.js";
import gql from "graphql-tag";
import {cloneObject, defer} from "@/utils/index.js";
import {formatHexToInt, formatNumberByLocale, timestampToDate} from "@/filters.js";

export default {
    name: "BurnedNEC",

    mixins: [pollingMixin],

    props: {
        /** Maximum amount of displayed blocks */
        maxBlocks: {
            type: Number,
            default: 5,
        },
    },

    data() {
        return {
            totalBurned: 0,
            blocks: [],
        }
    },

    computed: {
        tokenPrice() {
            return this.$store.state.tokenPrice;
        },

        cTotalBurned() {
            return formatNumberByLocale(this.totalBurned, 0);
        },
    },

    mounted() {
        this.update();

        this._polling.start(
            'update-burned-nec',
            () => {
                this.update();
            },
            3300
        );
    },

    methods: {
        async update() {
            this.totalBurned = await this.getNecBurnedTotal();
            this.setBlocks(await this.getNecLatestBlockBurnList());
        },

        setBlocks(newBlocks) {
            let blocks;
            let newBlocksLen = newBlocks.length;

            if (newBlocksLen > 0) {
                blocks = [...newBlocks, ...this.blocks];

                if (blocks.length > this.maxBlocks) {
                    blocks = blocks.slice(0, this.maxBlocks);
                }

                this.blocks = blocks;

                this.animateBlocks(newBlocksLen, this.blocks);
            }
        },

        animateBlocks(numBlocks, blocks) {
            defer(() => {
                const blocksLen = blocks.length;

                if (numBlocks > blocksLen) {
                    numBlocks = blocksLen;
                }

                for (let i = 0; i < numBlocks; i++) {
                    // blocks[i].__animate__ = true;
                    // blocks[i] = { ...blocks[i], __animate__: true };
                    this.$set(blocks[i], '__animate__', true);
                }
            }, 30);
        },

        /**
         * @returns {Promise<Array>}
         */
        async getNecLatestBlockBurnList(count = this.maxBlocks) {
            const data = await this.$apollo.query({
                query: gql`
                    query GetNecLatestBlockBurnList($count: Int = 25) {
                        necLatestBlockBurnList(count: $count) {
                            blockNumber
                            timestamp
                            necValue
                        }
                    }
                `,
                variables: {
                    count,
                },
                fetchPolicy: 'network-only',
            });

            return cloneObject(data.data && data.data.necLatestBlockBurnList || []);
        },

        /**
         * @returns {Promise<Array>}
         */
        async getNecBurnedTotal() {
            const data = await this.$apollo.query({
                query: gql`
                    query GetNecBurnedTotalAmount {
                        necBurnedTotalAmount
                    }
                `,
                fetchPolicy: 'network-only',
            });

            return data.data && data.data.necBurnedTotalAmount || 0;
        },

        timestampToDate,
        formatHexToInt,
    }
}
</script>

<style lang="scss">
.burnednec {
    --burnednec-transition-length: 610ms;
    --burnednec-border-color: #e6e6e6;

    display: flex;
    align-items: center;

    &_left {
        text-align: center;
        flex: 0.8;
    }

    &_amount {
        font-size: 64px;
    }

    &_amount_usd {
        font-size: 32px;
    }

    &_nec {
        color: $light-gray-color;
        font-size: 1.125rem;
    }

    ul {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: var(--f-spacer-1);
        list-style-type: none;
        margin: 0;
        padding: 0;
    }

    &_block {
        display: flex;
        align-items: center;
        opacity: 0;
        padding: 10px 15px;
        transition: opacity var(--burnednec-transition-length) ease;

        &-animate {
            opacity: 1;
        }

        > * {
            flex: 1;
        }

        &_burned {
            display: flex;
            justify-items: center;
            font-size: 20px;

            .fsvgicon {
                margin-top: -2px;
                margin-right: 3px;
            }
        }

        &_info {
            font-size: 16px;
            text-align: end;
            line-height: 1.15;
        }

        + .burnednec_block {
            border-top: 1px solid var(--burnednec-border-color);
        }
    }
}

@include media-max($bp-medium) {
    .burnednec {
        flex-direction: column;

        &_left {
            flex: none;
            margin-bottom: 24px;
        }

        ul {
            width: 100%;
            flex: none;
        }

        &_amount {
            font-size: 50px;
            padding-bottom: 0;
        }

        &_amount_usd {
            font-size: 28px;
        }
    }
}
</style>
