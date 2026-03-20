<template>
  <div class="module-balance">
    <!--
    =====================================================================================
      display if the user has an eth balance > 0
    =====================================================================================
    -->
    <loader v-if="loadingWalletInfo || loadingPriceData" />

    <mew-module
      v-if="hasBalance && !loadingWalletInfo && !loadingPriceData"
      :subtitle="subtitle"
      :title="title"
      :has-body-padding="false"
      :icon="networkIcon"
      :caption="convertedBalance"
      :has-elevation="true"
      :has-full-height="true"
      icon-align="left"
      class="bgWalletBlock"
    >
      <template v-if="false" #rightHeaderContainer>
        <div class="d-flex align-center ml-8 mt-3 mt-sm-0">
          <mew-toggle
            :button-group="chartButtons"
            :on-toggle-btn-idx="activeButton"
            @onBtnClick="onToggle"
          />
        </div>
      </template>
      <template #moduleBody>
        <balance-chart
          v-if="false"
          :data="chartData"
          class="full-width mt-5 pa-md-3"
        />
        <div
          class="pa-3 pa-sm-7 d-block d-md-flex align-center justify-space-between"
        >
          <div
            class="d-flex flex-column flex-sm-row align-center justify-center"
          >
            <div class="d-flex align-center">
              <div class="font-weight-bold">
                {{ network.type.currencyName }} PRICE
              </div>
              <div
                :class="[
                  'ml-2 font-weight-regular',
                  priceChange ? 'greenPrimary--text' : 'redPrimary--text'
                ]"
              >
                {{ formatChange }}
              </div>
              <v-icon
                :class="[
                  priceChange ? 'greenPrimary--text' : 'redPrimary--text',
                  'body-2'
                ]"
                >{{ priceChangeArrow }}</v-icon
              >
            </div>
            <div class="ml-sm-5">
              {{ formatFiatPrice }} / 1 {{ network.type.currencyName }}
            </div>
          </div>
          <div class="text-center text-md-right mt-4 mt-md-0">
            <mew-button
              :has-full-width="false"
              :title="sendText"
              btn-size="large"
              btn-style="transparent"
              class="mr-3"
              @click.native="navigateToSend"
            />
            <!-- <mew-button
              v-if="hasSwap"
              :has-full-width="false"
              :title="swapText"
              btn-size="large"
              btn-style="outline"
              @click.native="navigateToSwap"
            /> -->
          </div>
        </div>
      </template>
    </mew-module>
    <!--
    =====================================================================================
      display if the user has no eth balance
    =====================================================================================
    -->
    <balance-empty-block
      v-if="!hasBalance && !loadingWalletInfo && !loadingPriceData"
      :network-type="network.type.currencyName"
      :is-eth="isEthNetwork"
    />
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import BigNumber from 'bignumber.js';

import {
  formatPercentageValue,
  formatFloatingPointValue
} from '@/core/helpers/numberFormatHelper';
import { ROUTES_WALLET } from '@/core/configs/configRoutes';

import handlerAnalytics from '@/modules/analytics-opt-in/handlers/handlerAnalytics.mixin';
// import { DASHBOARD } from '@/modules/analytics-opt-in/handlers/configs/events.js';
export default {
  components: {
    Loader: () => import('./ModuleBalanceLoader'),
    BalanceChart: () => import('@/modules/balance/components/BalanceChart'),
    BalanceEmptyBlock: () => import('./components/BalanceEmptyBlock')
  },
  mixins: [handlerAnalytics],
  data() {
    return {
      chartButtons: ['1D', '1W', '1M', '1Y'],
      chartData: [],
      timeString: '',
      scale: '',
      activeButton: 0,
      // XDC specific data
      xdcPriceData: {
        price: 0,
        priceChange24h: 0,
        marketCap: 0,
        image: null
      },
      loadingPriceData: false,
      priceUpdateInterval: null
    };
  },
  computed: {
    ...mapState('wallet', ['address', 'loadingWalletInfo']),
    ...mapGetters('global', ['network', 'hasSwap', 'getFiatValue']),
    ...mapGetters('wallet', ['balanceInETH', 'balanceInWei']),
    ...mapGetters('external', [
      'fiatValue',
      'balanceFiatValue',
      'networkTokenUSDMarket'
    ]),
    ...mapGetters('global', ['isEthNetwork', 'network']),

    /**
     * Check if current network is XDC
     */
    isXdcNetwork() {
      const currencyName = this.network?.type?.currencyName?.toUpperCase();
      return currencyName === 'XDC' || currencyName === 'TXDC';
    },

    /**
     * Get network icon with XDC fallback
     */
    networkIcon() {
      if (this.isXdcNetwork && this.xdcPriceData.image) {
        return this.xdcPriceData.image;
      }
      return this.network.type.icon;
    },

    /**
     * Get current token price (XDC or from store)
     */
    currentTokenPrice() {
      if (this.isXdcNetwork) {
        return this.xdcPriceData.price;
      }
      return this.fiatValue || 0;
    },

    /**
     * Get current price change 24h (XDC or from store)
     */
    currentPriceChange24h() {
      if (this.isXdcNetwork) {
        return this.xdcPriceData.priceChange24h;
      }
      return this.networkTokenUSDMarket?.price_change_percentage_24h || 0;
    },

    /**
     * Calculate balance in fiat
     */
    currentBalanceFiatValue() {
      if (this.isXdcNetwork) {
        return new BigNumber(this.balanceInETH)
          .times(this.xdcPriceData.price)
          .toNumber();
      }
      return this.balanceFiatValue;
    },

    priceChangeArrow() {
      return this.priceChange ? 'mdi-arrow-up-bold' : 'mdi-arrow-down-bold';
    },

    priceChange() {
      return this.currentPriceChange24h > 0;
    },

    /**
     * Computed property returns formated eth value of the wallet balance
     * ie: $12.45 per 1 ETH
     */
    title() {
      return `${formatFloatingPointValue(this.balanceInETH).value} ${
        this.network.type.currencyName
      }`;
    },
    sendText() {
      return `Send ${this.network.type.currencyName}`;
    },
    subtitle() {
      return `My ${this.network.type.currencyName} Balance`;
    },
    /**
     * Computed property returns formated eth wallet balance value in USD
     * ie: $12.45 per 1 ETH
     */
    convertedBalance() {
      if (this.fiatLoaded) {
        return this.getFiatValue(this.currentBalanceFiatValue);
      }
      return '';
    },

    /**
     * Computed property returns formated 24 hours percentage change
     * ie: $12.45 per 1 ETH
     */
    formatChange() {
      if (this.fiatLoaded) {
        return formatPercentageValue(this.currentPriceChange24h).value;
      }
      return '';
    },

    /**
     * Computed property returns formats Fiat Price
     * ie: $12.45 per 1 ETH
     */
    formatFiatPrice() {
      if (this.fiatLoaded) {
        return this.getFiatValue(this.currentTokenPrice);
      }
      return '';
    },

    /**
     * Computed property returns whether or not fiat info is loaded
     */
    fiatLoaded() {
      if (this.isXdcNetwork) {
        return this.xdcPriceData.price > 0;
      }
      return (
        !!this.networkTokenUSDMarket &&
        !!this.networkTokenUSDMarket.price_change_percentage_24h &&
        !!this.balanceFiatValue &&
        !!this.fiatValue
      );
    },
    /**
     * Determines whether or not to show empty block
     * @return {boolean}
     */
    hasBalance() {
      return BigNumber(this.balanceInWei).gt(0);
    }
  },
  watch: {
    chartData: {
      handler: function () {},
      deep: true
    },
    address: {
      handler: 'fetchPriceData',
      immediate: true
    },
    network: {
      handler: 'fetchPriceData',
      deep: true
    }
  },
  mounted() {
    this.initChart();
    this.fetchPriceData();
    this.startPriceUpdateInterval();
  },
  beforeDestroy() {
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
    }
  },
  methods: {
    /**
     * Start interval to update price data every 5 minutes
     */
    startPriceUpdateInterval() {
      this.priceUpdateInterval = setInterval(() => {
        this.fetchPriceData();
      }, 5 * 60 * 1000); // 5 minutes
    },

    /**
     * Fetch price data based on network
     */
    async fetchPriceData() {
      if (!this.isXdcNetwork) return;

      this.loadingPriceData = true;
      try {
        // Try CoinGecko first
        const success = await this.fetchFromCoinGecko();

        // If CoinGecko fails, try CoinCap
        if (!success) {
          await this.fetchFromCoinCap();
        }
      } catch (error) {
        // console.error('Error fetching price data:', error);
      }
      this.loadingPriceData = false;
    },

    /**
     * Fetch XDC price from CoinGecko
     */
    async fetchFromCoinGecko() {
      try {
        const coingeckoId = 'xdce-crowd-sale'; // Correct CoinGecko ID for XDC
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coingeckoId}&order=market_cap_desc&sparkline=false`
        );

        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const coin = data[0];
            this.xdcPriceData = {
              price: coin.current_price || 0,
              priceChange24h: coin.price_change_percentage_24h || 0,
              marketCap: coin.market_cap || 0,
              image: coin.image || null
            };
            return true;
          }
        }
        return false;
      } catch (e) {
        // console.warn('CoinGecko API error:', e);
        return false;
      }
    },

    /**
     * Fallback: Fetch XDC price from CoinCap
     */
    async fetchFromCoinCap() {
      try {
        const res = await fetch('https://api.coincap.io/v2/assets/xdc-network');

        if (res.ok) {
          const { data } = await res.json();
          if (data) {
            this.xdcPriceData = {
              price: parseFloat(data.priceUsd) || 0,
              priceChange24h: parseFloat(data.changePercent24Hr) || 0,
              marketCap: parseFloat(data.marketCapUsd) || 0,
              image: this.xdcPriceData.image // Keep existing image if any
            };
            return true;
          }
        }
        return false;
      } catch (e) {
        // console.warn('CoinCap API error:', e);
        return false;
      }
    },

    initChart() {
      let count = 0;
      const checker = () => {
        this.onToggle(this.chartButtons[count]);
        setTimeout(() => {
          if (count >= 3) {
            this.onToggle(this.chartButtons[count]);
            this.activeButton = count;
            // a single point basically looks the same as an empty chart
          } else if (this.chartData.length <= 1) {
            count++;
            checker();
          } else {
            this.activeButton = count;
          }
        }, 1000);
      };
      checker();
    },
    onToggle(e) {
      switch (e) {
        case this.chartButtons[0]:
          this.setDataYesterday();
          break;
        case this.chartButtons[1]:
          this.setDataWeek();
          break;
        case this.chartButtons[2]:
          this.setDataMonth();
          break;
        case this.chartButtons[3]:
          this.setDataYear();
          break;
        default:
          this.setDataMonth();
      }
    },
    setDataMonth() {
      const timeString = new Date();
      this.timeString = timeString.getTime() - 1000 * 60 * 60 * 24 * 31;
      this.scale = 'days';
    },
    setDataYear() {
      const timeString = new Date();
      this.timeString = timeString.getTime() - 1000 * 60 * 60 * 24 * 365;
      this.scale = 'days';
    },
    setDataWeek() {
      const timeString = new Date();
      this.timeString = timeString.getTime() - 1000 * 60 * 60 * 24 * 7;
      this.scale = 'days';
    },
    setDataYesterday() {
      const timeString = new Date();
      this.timeString = timeString.getTime() - 1000 * 60 * 60 * 24 * 1;
      this.scale = 'hours';
    },
    navigateToSend() {
      this.$router.push({ name: ROUTES_WALLET.SEND_TX.NAME });
    },
    /* navigateToSwap() {
      this.trackDashboardAmplitude(DASHBOARD.SWAP_BALANCE);
      this.$router.push({ name: ROUTES_WALLET.SWAP.NAME });
    } */
  }
};
</script>
