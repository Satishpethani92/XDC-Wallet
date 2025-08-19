<template>
  <div class="module-tokens">
    <v-skeleton-loader
      v-if="loading && (tokensData || hiddenTokens)"
      class="mx-auto"
      type="table"
    />
    <mew-module
      v-if="hasTokens && !dense"
      has-elevation
      subtitle="My Tokens Value"
      :has-body-padding="false"
      :title="totalTokensValue"
      class="bgWalletBlock"
    >
      <template #rightHeaderContainer>
        <div>
          <v-menu
            bottom
            offset-y
            rounded="lg"
            content-class="module-tokens-edit-menu"
          >
            <template #activator="{ on, attrs }">
              <v-btn
                class="mr-n6"
                v-bind="attrs"
                rounded
                color="basic"
                icon
                v-on="on"
              >
                <v-icon medium color="textDark">mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                v-for="(item, i) in items"
                :key="i"
                @click="item.action"
              >
                <div class="pl-2 pr-4 d-flex align-center">
                  <v-icon dense color="basic" left>{{ item.icon }}</v-icon>
                  <v-list-item-title>{{ item.title }}</v-list-item-title>
                </div>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </template>
      <template #moduleBody>
        <balance-table class="mb-4" :table-data="tokensData" />
      </template>
    </mew-module>

    <mew-table
      v-if="hasTokens && dense"
      :has-color="false"
      :table-headers="tableHeaders"
      :table-data="tokensData"
    />

    <balance-empty-block
      v-if="emptyWallet"
      is-tokens
      :is-eth="isEthNetwork"
      @openAddCustomToken="() => toggleAddCustomToken(true)"
    />

    <token-add-custom
      :close="toggleAddCustomToken"
      :open="openAddCustomToken"
    />
    <token-remove-custom
      :close="toggleRemoveCustomToken"
      :open="openRemoveCustomToken"
      :selected-token="selectedToken"
    />
    <token-edit-custom
      :close="toggleEditCustomToken"
      :open="openEditCustomToken"
      @addToken="toggleAddCustomToken"
      @removeToken="openRemoveToken"
    />
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { uniqWith, isEqual } from 'lodash';
import BigNumber from 'bignumber.js';
// import { ROUTES_WALLET } from '@/core/configs/configRoutes';
import { currencyToNumber } from '@/core/helpers/localization';
import handlerAnalytics from '@/modules/analytics-opt-in/handlers/handlerAnalytics.mixin';
// import { DASHBOARD } from '../analytics-opt-in/handlers/configs/events';
import xrc20Tokens from '../xrc20Tokens.js';

export default {
  components: {
    BalanceTable: () => import('./components/BalanceTable'),
    BalanceEmptyBlock: () => import('./components/BalanceEmptyBlock'),
    TokenAddCustom: () => import('./components/TokenAddCustom'),
    TokenEditCustom: () => import('./components/TokenEditCustom'),
    TokenRemoveCustom: () => import('./components/TokenRemoveCustom')
  },
  mixins: [handlerAnalytics],
  props: {
    dense: { type: Boolean, default: false }
  },
  data() {
    return {
      openAddCustomToken: false,
      openEditCustomToken: false,
      openRemoveCustomToken: false,
      xrc20TokenPrices: {},
      xrc20TokenDetails: [],
      loadingXrc20: false,
      priceUpdateInterval: null,
      tableHeaders: [
        { text: 'Token', value: 'token', sortable: false, width: '20%' },
        { text: 'Price', value: 'price', sortable: false, width: '15%' },
        { text: 'Market Cap', value: 'cap', sortable: false, width: '20%' },
        { text: '24H', value: 'change', sortable: false, width: '20%' },
        { text: 'Balance', value: 'balance', sortable: false, width: '20%' },
        { text: '', value: 'callToAction', sortable: false, width: '10%' }
      ],
      items: [
        {
          icon: 'mdi-plus',
          title: 'Add Token',
          action: this.toggleAddCustomToken
        },
        {
          icon: 'mdi-pencil-outline',
          title: 'Edit Token',
          action: this.toggleEditCustomToken
        }
      ],
      selectedToken: {},
      xrc20Tokens
    };
  },
  computed: {
    ...mapState('wallet', ['address']),
    ...mapGetters('wallet', ['tokensList', 'web3']),
    ...mapState('wallet', ['web3', 'loadingWalletInfo']),
    ...mapGetters('custom', [
      'customTokens',
      'hasCustom',
      'hiddenTokens',
      'hasHidden'
    ]),
    ...mapGetters('global', [
      'isEthNetwork',
      'network',
      'hasSwap',
      'getFiatValue'
    ]),
    ...mapGetters('external', ['totalTokenFiatValue']),
    loading() {
      return this.loadingWalletInfo || this.loadingXrc20;
    },
    hasTokens() {
      return (
        !this.loading &&
        (this.tokensData.length > 0 || this.hiddenTokens.length > 0)
      );
    },
    emptyWallet() {
      return (
        !this.loading &&
        this.tokensData.length === 0 &&
        this.hiddenTokens.length === 0
      );
    },
    tokensData() {
      // console.log('this.tokensList', this.tokensList);
      // console.log('this.customTokens', this.customTokens);
      // console.log('this.hiddenTokens', this.hiddenTokens);

      if (!this.tokensList && !this.customTokens && !this.hiddenTokens)
        return [];

      const customTokens = this.customTokens.reduce((arr, item) => {
        const isHidden = this.hiddenTokens.find(
          token => item.contract == token.address
        );
        if (!isHidden) arr.push(this.formatValues(item));
        return arr;
      }, []);
      // console.log('customTokens', customTokens);

      const uniqueTokens = uniqWith(
        this.tokensList.filter(t => !t.isHidden),
        isEqual
      );

      const tokenList = uniqueTokens
        .filter(item => item && item.balance && BigNumber(item.balance).gt(0))
        // .filter(item => item)
        .map(item => this.formatValues(item));

      const allTokens = [
        ...customTokens,
        ...tokenList,
        ...this.xrc20TokenDetails
      ];

      allTokens.sort((a, b) => {
        if (a.token === 'XDC' || a.token === 'TXDC') return -1;
        if (b.token === 'XDC' || b.token === 'TXDC') return 1;

        const aCap =
          a.cap === 'N/A'
            ? -Infinity
            : parseFloat(a.cap.replace(/[^\d.-]/g, ''));
        const bCap =
          b.cap === 'N/A'
            ? -Infinity
            : parseFloat(b.cap.replace(/[^\d.-]/g, ''));

        return bCap - aCap;
      });

      // allTokens.sort((a, b) => b.cap - a.cap);
      return allTokens;
    },
    totalTokensValue() {
      // return this.getFiatValue(this.totalTokenFiatValue);
      const baseValue = new BigNumber(this.totalTokenFiatValue || 0);
      const xrc20Value = this.calculateXrc20TotalValue();
      const total = baseValue.plus(xrc20Value).toNumber();
      return this.getFiatValue(total);
    }
  },
  watch: {
    address: {
      handler: 'fetchAllXrc20Data',
      immediate: true
    }
  },
  mounted() {
    this.startPriceUpdateInterval();
  },
  beforeDestroy() {
    if (this.priceUpdateInterval) clearInterval(this.priceUpdateInterval);
  },
  methods: {
    async fetchAllXrc20Data() {
      if (!this.address) return;
      this.loadingXrc20 = true;
      await this.fetchXrc20TokenPrices();
      await this.fetchAndFormatXrc20Balances();
      this.loadingXrc20 = false;
    },

    async fetchXrc20TokenPrices() {
      this.loadingXrc20 = true;
      await this.fetchFromCoinGecko();
      await this.fillMissingPrices();
      // await this.setTokenAndEthBalance();
      this.loadingXrc20 = false;
    },

    async fetchFromCoinGecko() {
      try {
        const tokensWithPotentialIds = this.xrc20Tokens.filter(
          t => t.symbol && t.symbol.length > 0
        );

        const symbols = tokensWithPotentialIds
          .map(t => t.symbol.toLowerCase())
          .join(',');
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&symbols=${symbols}`
        );

        if (res.ok) {
          const data = await res.json();
          data.forEach(coin => {
            const symbolUpper = coin.symbol.toUpperCase();
            const token = this.xrc20Tokens.find(
              t => t.symbol.toUpperCase() === symbolUpper
            );

            if (token) {
              this.$set(this.xrc20TokenPrices, token.symbol, {
                price: coin.current_price || 0,
                change24h: coin.price_change_percentage_24h || 0,
                marketCap: coin.market_cap || 0,
                source: 'coingecko'
              });
            }
          });
        }
      } catch (e) {
        // console.error('CoinGecko API error:', e);
      }
    },

    async fillMissingPrices() {
      const missingTokens = this.xrc20Tokens.filter(
        t => !this.xrc20TokenPrices[t.symbol]
      );

      if (missingTokens.length === 0) return;

      await Promise.all(
        missingTokens.map(async token => {
          try {
            const res = await fetch(
              `https://api.1inch.io/v4.0/1/tokens/${token.contract}`
            );

            if (res.ok) {
              // const tokenData = await res.json();
              // Simple fallback pricing (could be improved)
              this.$set(this.xrc20TokenPrices, token.symbol, {
                price: 0.1, // Default fallback price
                change24h: 0,
                marketCap: 0,
                source: 'fallback-1inch'
              });
            }
          } catch (e) {
            // console.error(`1inch API error for ${token.symbol}:`, e);
            // Final fallback if all APIs fail
            this.$set(this.xrc20TokenPrices, token.symbol, {
              price: 0.1,
              change24h: 0,
              marketCap: 0,
              source: 'fallback-default'
            });
          }
        })
      );
    },

    async getTokenBalance(contractAddress) {
      try {
        if (!this.web3 || !this.web3.eth || !this.address) return '0';
        const balanceOfABI = [
          {
            constant: true,
            inputs: [{ name: '_owner', type: 'address' }],
            name: 'balanceOf',
            outputs: [{ name: 'balance', type: 'uint256' }],
            type: 'function'
          }
        ];
        const contract = new this.web3.eth.Contract(
          balanceOfABI,
          contractAddress
        );
        const balance = await contract.methods.balanceOf(this.address).call();
        return this.web3.utils.fromWei(balance, 'ether');
      } catch (e) {
        return '0';
      }
    },

    async fetchAndFormatXrc20Balances() {
      try {
        const balancePromises = this.xrc20Tokens.map(async token => {
          try {
            const balance = await this.getTokenBalance(token.contract);
            const balanceBN = new BigNumber(balance);

            if (this.xrc20TokenPrices[token.symbol] || balanceBN.gt(0)) {
              return this.formatXrc20Token(token, balance);
            }
            return null;
          } catch (error) {
            // console.error(`Error processing ${token.symbol}:`, error);
            return null;
          }
        });

        const resolvedTokens = await Promise.all(balancePromises);
        this.xrc20TokenDetails = resolvedTokens.filter(t => t !== null);
      } catch (error) {
        // console.error('Error in fetchAndFormatXrc20Balances:', error);
      }
    },

    formatXrc20Token(token, balance) {
      const priceData = this.xrc20TokenPrices[token.symbol] || {
        price: 0,
        change24h: 0,
        marketCap: 0
      };

      const balanceBN = new BigNumber(balance);
      const usdBalance = balanceBN.times(priceData.price).toNumber();

      return {
        balance: [
          `${balanceBN.gt(0) ? this.formatNumber(balance) : '0'} ${
            token.symbol
          }`,
          usdBalance > 0 ? this.getFiatValue(usdBalance) : '$0.00'
        ],
        usdBalance,
        token: token.symbol,
        cap:
          priceData.marketCap > 0
            ? this.formatMarketCap(priceData.marketCap)
            : 'N/A',
        change: priceData.change24h ? priceData.change24h.toFixed(2) : '0.00',
        status: priceData.change24h >= 0 ? '+' : '-',
        price: priceData.price > 0 ? this.getFiatValue(priceData.price) : 'N/A',
        tokenImg: token.image,
        /* callToAction:
          this.hasSwap && balanceBN.gt(0) && !token.disableSwap
            ? [
                {
                  title: 'Swap',
                  method: () => {
                    const obj = { fromToken: token.contract, amount: balance };
                    this.trackDashboardAmplitude(
                      DASHBOARD.SWAP_MY_TOKENS_VALUE
                    );
                    this.$router
                      .push({ name: ROUTES_WALLET.SWAP.NAME, query: obj })
                      .then(() => this.$emit('trade'));
                  },
                  btnStyle: 'outline',
                  colorTheme: 'greenPrimary'
                }
              ]
            : [] */
        callToAction: []
      };
    },

    calculateXrc20TotalValue() {
      return this.xrc20TokenDetails.reduce((total, token) => {
        return new BigNumber(total).plus(token.usdBalance).toNumber();
      }, 0);
    },

    formatNumber(num) {
      const bn = new BigNumber(num);
      if (bn.gte(1e6)) return bn.div(1e6).toFixed(2) + 'M';
      if (bn.gte(1e3)) return bn.div(1e3).toFixed(2) + 'K';
      return bn.toFormat(4);
    },

    formatMarketCap(mc) {
      if (mc >= 1e9) return '$' + (mc / 1e9).toFixed(2) + 'B';
      if (mc >= 1e6) return '$' + (mc / 1e6).toFixed(2) + 'M';
      if (mc >= 1e3) return '$' + (mc / 1e3).toFixed(2) + 'K';
      return '$' + mc.toLocaleString();
    },

    startPriceUpdateInterval() {
      this.priceUpdateInterval = setInterval(() => {
        this.fetchAllXrc20Data();
      }, 5 * 60 * 1000);
    },

    formatValues(item) {
      const newObj = {};
      newObj.balance = [
        item.balancef ? item.balancef + ' ' + item.symbol : '0 ' + item.symbol,
        item.usdBalancef ? this.getFiatValue(item.usdBalancef) : '0'
      ];
      newObj.usdBalance = item.usdBalance || 0;
      newObj.token = item.symbol;
      newObj.cap = item.market_capf !== '0' ? item.market_capf : '';
      newObj.change =
        item.price_change_percentage_24hf &&
        item.price_change_percentage_24hf !== '0'
          ? item.price_change_percentage_24hf.replaceAll('%', '')
          : '';
      newObj.status = item.price_change_percentage_24h > 0 ? '+' : '-';
      const priceUF = currencyToNumber(item.pricef);
      newObj.price =
        item.pricef && priceUF.toString() !== '0'
          ? this.getFiatValue(item.pricef)
          : '';
      newObj.tokenImg =
        item.symbol == 'ETH'
          ? require('@/assets/images/networks/eth.svg')
          : item.img || this.network.type.icon;
      /* if (this.hasSwap && !item.disableSwap) {
        newObj.callToAction = [
          {
            title: 'Swap',
            method: () => {
              const obj = { fromToken: item.contract, amount: item.balancef };
              this.trackDashboardAmplitude(DASHBOARD.SWAP_MY_TOKENS_VALUE);
              this.$router
                .push({ name: ROUTES_WALLET.SWAP.NAME, query: obj })
                .then(() => this.$emit('trade'));
            },
            btnStyle: 'outline',
            colorTheme: 'greenPrimary'
          }
        ];
      } */
      newObj.callToAction = [];
      return newObj;
    },

    toggleAddCustomToken(val) {
      this.openAddCustomToken = val ? val : !this.openAddCustomToken;
    },
    toggleRemoveCustomToken() {
      this.openRemoveCustomToken = !this.openRemoveCustomToken;
    },
    openRemoveToken(token) {
      this.selectedToken = token;
      this.toggleRemoveCustomToken();
    },
    toggleEditCustomToken() {
      this.openEditCustomToken = !this.openEditCustomToken;
    }
  }
};
</script>

<style lang="scss">
.module-tokens {
  .mew-table td.text-start:nth-last-of-type(2) div span:first-child {
    text-overflow: ellipsis;
    overflow: hidden;
  }
  overflow: hidden;
}
.module-tokens-edit-menu {
  border: none !important;
}
</style>
