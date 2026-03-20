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
      tokenPrices: {},
      xrc20TokenDetails: [],
      loadingTokens: false,
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
    ...mapGetters('wallet', ['web3']),
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
      return this.loadingWalletInfo || this.loadingTokens;
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
      if (!this.customTokens && !this.hiddenTokens) return [];

      const customTokens = this.customTokens.reduce((arr, item) => {
        const isHidden = this.hiddenTokens.find(
          token => item.contract == token.address
        );
        // Check if already exists in xrc20TokenDetails
        const existsInXrc20 = this.xrc20TokenDetails.find(
          t => t.contractAddress?.toLowerCase() === item.contract?.toLowerCase()
        );
        if (!isHidden && !existsInXrc20) arr.push(this.formatValues(item));
        return arr;
      }, []);

      // Merge xrc20TokenDetails and customTokens (removed tokenList)
      const allTokens = [...this.xrc20TokenDetails, ...customTokens];

      // Assign priority
      const getPriority = token => {
        if (token.token === 'XDC' || token.token === 'TXDC') return 1;
        if (token.usdBalance && Number(token.usdBalance) > 0) return 2;
        return 3;
      };

      allTokens.sort((a, b) => getPriority(a) - getPriority(b));

      return allTokens;
    },
    totalTokensValue() {
      const total = this.tokensData.reduce((acc, token) => {
        return new BigNumber(acc).plus(token.usdBalance || 0);
      }, new BigNumber(0));
      return this.getFiatValue(total.toNumber());
    }
  },
  watch: {
    address: {
      handler: 'fetchAllTokenData',
      immediate: true
    },
    customTokens: {
      handler: 'fetchAllTokenData',
      deep: true
    }
  },
  mounted() {
    this.startPriceUpdateInterval();
  },
  beforeDestroy() {
    if (this.priceUpdateInterval) clearInterval(this.priceUpdateInterval);
  },
  methods: {
    async fetchAllTokenData() {
      if (!this.address) return;
      this.loadingTokens = true;
      try {
        await this.fetchAllTokenPrices();
        await this.fetchAndFormatXrc20Balances();
      } catch (error) {
        // console.error('Error fetching token data:', error);
      }
      this.loadingTokens = false;
    },

    async fetchAllTokenPrices() {
      const allTokens = [...this.xrc20Tokens, ...this.customTokens];

      // Try CoinGecko first (using coingeckoId - more reliable)
      await this.fetchFromCoinGeckoById(allTokens);

      // Fallback to CoinCap for any missing prices
      await this.fetchFromCoinCap(allTokens);
    },

    // Primary API: CoinGecko using IDs (more reliable than symbols)
    async fetchFromCoinGeckoById(tokensToFetch) {
      try {
        const tokensWithIds = tokensToFetch.filter(t => t.coingeckoId);
        if (tokensWithIds.length === 0) return;

        const ids = [...new Set(tokensWithIds.map(t => t.coingeckoId))].join(
          ','
        );

        const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=false`;
        // console.log('CoinGecko API URL:', url);

        const res = await fetch(url);

        if (res.ok) {
          const data = await res.json();

          // console.log('CoinGecko Response:', data);

          data.forEach(coin => {
            const matchingTokens = tokensToFetch.filter(
              t => t.coingeckoId === coin.id
            );

            matchingTokens.forEach(token => {
              const key = token.contract || token.symbol;
              this.$set(this.tokenPrices, key, {
                price: coin.current_price || 0,
                change24h: coin.price_change_percentage_24h || 0,
                marketCap: coin.market_cap || 0,
                image: coin.image,
                source: 'coingecko'
              });
            });
          });
        } else {
          // console.error('CoinGecko API failed:', res.status, res.statusText);
        }
      } catch (e) {
        // console.error('CoinGecko API error:', e);
      }
    },

    // Fallback API 1: CoinCap (free, no CORS issues)
    async fetchFromCoinCap(tokensToFetch) {
      try {
        const missingTokens = tokensToFetch.filter(t => {
          const key = t.contract || t.symbol;
          return !this.tokenPrices[key];
        });

        if (missingTokens.length === 0) return;

        // CoinCap asset mapping (symbol to coincap id)
        const coinCapMapping = {
          XDC: 'xdc-network',
          PLI: 'plugin',
          SRX: 'storx',
          CGO: 'comtech-gold'
        };

        for (const token of missingTokens) {
          const coinCapId = coinCapMapping[token.symbol];
          if (!coinCapId) continue;

          try {
            const res = await fetch(
              `https://api.coincap.io/v2/assets/${coinCapId}`
            );
            if (res.ok) {
              const { data } = await res.json();
              if (data) {
                const key = token.contract || token.symbol;
                this.$set(this.tokenPrices, key, {
                  price: parseFloat(data.priceUsd) || 0,
                  change24h: parseFloat(data.changePercent24Hr) || 0,
                  marketCap: parseFloat(data.marketCapUsd) || 0,
                  image: null,
                  source: 'coincap'
                });
              }
            }
          } catch (e) {
            // Continue to next token
          }
        }
      } catch (e) {
        // console.warn('CoinCap API error:', e);
      }
    },

    // Get native XDC balance
    async getNativeBalance() {
      try {
        if (!this.web3 || !this.web3.eth || !this.address) return '0';
        const balanceWei = await this.web3.eth.getBalance(this.address);
        return this.web3.utils.fromWei(balanceWei, 'ether');
      } catch (e) {
        // console.error('Error getting native balance:', e);
        return '0';
      }
    },

    // Get XRC20 token balance
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
            let balance;

            // Handle native XDC token differently
            if (token.isNative || token.contract === 'native') {
              balance = await this.getNativeBalance();
            } else {
              balance = await this.getTokenBalance(token.contract);
            }

            const balanceBN = new BigNumber(balance);
            const priceKey = token.contract || token.symbol;

            // Include token if it has price data OR has balance
            if (this.tokenPrices[priceKey] || balanceBN.gt(0)) {
              return this.formatXrc20Token(token, balance);
            }
            return null;
          } catch (error) {
            // console.error(`Error fetching balance for ${token.symbol}:`, error);
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
      const priceKey = token.contract || token.symbol;
      const priceData = this.tokenPrices[priceKey] || {
        price: 0,
        change24h: 0,
        marketCap: 0
      };

      const balanceBN = new BigNumber(balance);
      const usdBalance = balanceBN.times(priceData.price).toNumber();

      // Get token image with XDC fallback
      let tokenImg = priceData.image;
      if (!tokenImg) {
        if (token.isNative || token.symbol === 'XDC') {
          // Use XDC icon from CoinGecko or local asset
          tokenImg =
            'https://coin-images.coingecko.com/coins/images/2912/large/xdc-icon.png?1696503661';
          // Or use local: tokenImg = require('@/assets/images/networks/xdc.svg');
        } else {
          tokenImg = this.network?.type?.icon || null;
        }
      }

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
        price:
          priceData.price > 0 ? this.getFiatValue(priceData.price) : '$0.00',
        tokenImg: tokenImg,
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
        contractAddress: token.contract,
        isNative: token.isNative || false,
        callToAction: []
      };
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
        this.fetchAllTokenData();
      }, 5 * 60 * 1000);
    },

    formatValues(item) {
      const priceData = this.tokenPrices[item.contract || item.symbol];
      const newObj = {};

      if (priceData) {
        const balance = new BigNumber(item.balancef || item.balance || 0);
        const usdBalance = balance.times(priceData.price).toNumber();
        newObj.usdBalance = usdBalance;
        newObj.balance = [
          item.balancef
            ? item.balancef + ' ' + item.symbol
            : '0 ' + item.symbol,
          usdBalance > 0 ? this.getFiatValue(usdBalance) : '$0.00'
        ];
        newObj.cap =
          priceData.marketCap > 0
            ? this.formatMarketCap(priceData.marketCap)
            : 'N/A';
        newObj.change = priceData.change24h
          ? priceData.change24h.toFixed(2)
          : '0.00';
        newObj.status = priceData.change24h >= 0 ? '+' : '-';
        newObj.price =
          priceData.price > 0 ? this.getFiatValue(priceData.price) : '$0.00';
      } else {
        newObj.balance = [
          item.balancef
            ? item.balancef + ' ' + item.symbol
            : '0 ' + item.symbol,
          item.usdBalancef ? this.getFiatValue(item.usdBalancef) : '$0.00'
        ];
        newObj.usdBalance = item.usdBalance || 0;
        newObj.cap = item.market_capf !== '0' ? item.market_capf : 'N/A';
        newObj.change =
          item.price_change_percentage_24hf &&
          item.price_change_percentage_24hf !== '0'
            ? item.price_change_percentage_24hf.replaceAll('%', '')
            : '0.00';
        newObj.status = item.price_change_percentage_24h > 0 ? '+' : '-';
        const priceUF = currencyToNumber(item.pricef);
        newObj.price =
          item.pricef && priceUF.toString() !== '0'
            ? this.getFiatValue(item.pricef)
            : '$0.00';
      }

      newObj.token = item.symbol;
      newObj.tokenImg =
        (priceData && priceData.image) || item.img || this.network.type.icon;
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
      newObj.contractAddress = item.contract;
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
