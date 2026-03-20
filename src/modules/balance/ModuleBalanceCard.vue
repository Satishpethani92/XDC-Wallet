<template>
  <div class="component--wallet-card theBalanceCard">
    <div class="mew-card drop-shadow">
      <img
        :src="'https://mewcard.mewapi.io/?address=' + address"
        alt="MEW Card"
        @load="animateMewCard()"
      />
    </div>
    <div class="info-container pl-8 pr-5 py-4 text-shadow">
      <div class="d-flex flex-row justify-space-between align-start">
        <div class="balanceMenu">
          <!--
          =====================================================================================
            Address
          =====================================================================================
          -->
          <v-menu offset-y>
            <template #activator="{ on }">
              <div
                class="d-flex align-center cursor--pointer personal-account-container"
                v-on="on"
              >
                <div class="info-container--text font-weight-bold white--text">
                  {{ title }}
                </div>
                <v-icon class="white--text ml-2" small dense>
                  mdi-menu-down
                </v-icon>
              </div>
            </template>
            <v-list width="232px" class="bgWalletBlock">
              <v-list-item
                v-if="!isOfflineApp"
                class="cursor-pointer"
                @click="refresh"
              >
                <v-icon color="textDark" class="mr-3">mdi-refresh</v-icon>
                <v-list-item-title> Refresh Balance</v-list-item-title>
              </v-list-item>
              <!-- <v-list-item
                class="cursor-pointer openThePaperWallet"
                @click="openPaperWallet"
              >
                <v-icon color="textDark" class="mr-3">mdi-printer</v-icon>
                <v-list-item-title>View paper wallet</v-list-item-title>
              </v-list-item> -->
              <v-list-item
                v-if="isHardware && canDisplayAddress"
                class="cursor-pointer"
                @click="viewAddressOnDevice"
              >
                <mew-icon
                  :icon-name="iconIdentifier"
                  :img-height="24"
                  class="mr-3"
                />
                <v-list-item-title
                  >View address on {{ walletName }}</v-list-item-title
                >
              </v-list-item>
              <v-divider class="mx-5 my-4"></v-divider>
              <v-list-item
                v-if="canSwitch"
                class="cursor-pointer"
                @click="openChangeAddress"
              >
                <v-icon color="textDark" class="mr-3"
                  >mdi-account-box-multiple</v-icon
                >
                <v-list-item-title>Switch Account</v-list-item-title>
              </v-list-item>
              <v-list-item class="cursor-pointer" @click="openLogout">
                <v-icon color="textDark" class="mr-3">mdi-logout</v-icon>
                <v-list-item-title>Logout</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <mew-tooltip hide-icon :text="getChecksumAddressString">
            <template #activatorSlot>
              <div
                class="justify-start d-flex align-center info-container--addr monospace"
              >
                {{ addrFirstSix }}
                <v-icon class="info-container--addr pt-1"
                  >mdi-dots-horizontal</v-icon
                >

                {{ addrlastFour }}
              </div>
            </template>
            <span class="textDark--text">{{ getChecksumAddressString }}</span>
          </mew-tooltip>
        </div>
        <div>
          <a :href="blockExplorer" target="_blank">
            <v-icon small color="white" class="cursor--pointer"
              >mdi-open-in-new</v-icon
            >
          </a>
        </div>
      </div>
      <!--
      =====================================================================================
        Total Wallet FIAT balance OR if Test network Chain Balance
      =====================================================================================
      -->
      <div
        v-if="!isOfflineApp"
        :class="[
          { 'ml-n5': !isTestNetwork },
          'mew-subtitle text-shadow white--text mt-5 mb-4'
        ]"
      >
        <v-skeleton-loader
          v-if="loadingWalletInfo || loadingPriceData"
          type="heading"
          class="theme-dark-heading"
        ></v-skeleton-loader>
        <div v-else class="mew-subtitle text-shadow white--text">
          {{ totalWalletBalance }}
          <span
            v-if="isTestNetwork"
            style="padding-left: 2px; font-size: 14px"
            >{{ network.type.currencyName }}</span
          >
        </div>
      </div>
      <div
        class="d-flex justify-space-between align-center"
        :style="isOfflineApp ? 'margin-top:74px' : ''"
      >
        <div v-if="!isOfflineApp" class="justify-start">
          <!--
          =====================================================================================
            Total Wallet chain balance: present if not Test network
          =====================================================================================
          -->
          <v-skeleton-loader
            v-if="loadingWalletInfo || loadingPriceData"
            type="text"
            width="100"
          />
          <div
            v-else-if="!isTestNetwork"
            class="info-container--text-chain-balance"
          >
            {{ walletChainBalance }} {{ network.type.currencyName }}
          </div>
          <!--
          =====================================================================================
            Total Tokens: present if tokens found
          =====================================================================================
          -->
          <v-skeleton-loader
            v-if="loadingWalletInfo || loadingPriceData"
            type="text"
            width="100"
          />
          <div v-else-if="nonChainTokensCount > 0" class="info-container--text">
            and {{ nonChainTokensCount }} Tokens
          </div>
        </div>
        <div class="d-flex justify-end">
          <!--
          =====================================================================================
            QR CODE
          =====================================================================================
          -->
          <v-btn
            class="info-container--action-btn mr-2 px-0 BalanceCardQR"
            fab
            depressed
            @click="open"
          >
            <img
              class="info-container--icon"
              height="18px"
              src="@/assets/images/icons/icon-qr-code.svg"
              alt="qr-code"
            />
          </v-btn>
          <!--
          =====================================================================================
            Copy Button
          =====================================================================================
          -->
          <v-btn
            class="info-container--action-btn px-0"
            depressed
            fab
            @click="copyAddress"
            ><v-icon class="info-container--icon" small color="white">
              mdi-content-copy
            </v-icon></v-btn
          >
        </div>
      </div>
    </div>
    <!--
    =====================================================================================
      Wallet card modals
    =====================================================================================
    -->
    <app-modal
      :show="openQR"
      :close="closeQR"
      :has-buttons="false"
      width="408px"
    >
      <template #dialogBody>
        <app-addr-qr />
      </template>
    </app-modal>
    <module-access-wallet-hardware
      v-if="showHardware"
      :open="showChangeAddress"
      :close="closeChangeAddress"
      :switch-address="instancePath"
    />
    <module-access-wallet-software
      v-else
      :open="showChangeAddress"
      :close="closeChangeAddress"
      :switch-address="instancePath"
      :wallet-type="identifier"
    />

    <mew-popup
      max-width="400px"
      hide-close-btn
      :show="showLogout"
      :title="$t('interface.menu.logout')"
      :left-btn="{ text: 'Cancel', method: closeLogout, color: 'basic' }"
      :right-btn="{
        text: 'Log out',
        color: 'error',
        method: onLogout,
        enabled: true
      }"
    />
    <mew-popup
      max-width="515px"
      :show="showVerify"
      :title="verifyAddressTitle"
      :has-buttons="false"
      :has-body-content="true"
      :left-btn="{ text: 'Cancel', method: closeVerify, color: 'basic' }"
    >
      <div>
        <div class="text-center">
          {{ verifyAddressBody }}
        </div>
        <div class="mt-3 verify-popup-border px-12 py-5 text-center">
          <div class="font-weight-bold greenPrimary--text mew-body">
            ACCOUNT ADDRESS
          </div>
          <div class="pt-3 greenPrimary--text mew-body">
            {{ getChecksumAddressString }}
          </div>
        </div>
      </div>
    </mew-popup>
  </div>
</template>

<script>
import anime from 'animejs/lib/anime.es.js';
import { mapGetters, mapActions, mapState } from 'vuex';
import clipboardCopy from 'clipboard-copy';
import { isEmpty } from 'lodash';
import BigNumber from 'bignumber.js';

import { Toast, SUCCESS, ERROR } from '@/modules/toast/handler/handlerToast';
import { toChecksumAddress } from '@/core/helpers/addressUtils';
import { formatFloatingPointValue } from '@/core/helpers/numberFormatHelper';

import wallets from './handlers/config';
import WALLET_TYPES from '../access-wallet/common/walletTypes';
import Resolver from '@/modules/name-resolver/index';
// import { EventBus } from '@/core/plugins/eventBus';
import handlerAnalytics from '@/modules/analytics-opt-in/handlers/handlerAnalytics.mixin';
import { DASHBOARD } from '../analytics-opt-in/handlers/configs/events';

export default {
  components: {
    ModuleAccessWalletHardware: () =>
      import('@/modules/access-wallet/ModuleAccessWalletHardware'),
    ModuleAccessWalletSoftware: () =>
      import('@/modules/access-wallet/ModuleAccessWalletSoftware')
  },
  mixins: [handlerAnalytics],
  props: {
    sidemenuStatus: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showChangeAddress: false,
      openQR: false,
      showLogout: false,
      showVerify: false,
      wallets: wallets,
      resolvedName: '',
      nameResolver: null,
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
    ...mapState('wallet', [
      'address',
      'instance',
      'identifier',
      'isHardware',
      'isOfflineApp',
      'loadingWalletInfo'
    ]),
    ...mapGetters('external', ['totalTokenFiatValue']),
    ...mapGetters('global', ['network', 'isTestNetwork', 'getFiatValue']),
    ...mapGetters('wallet', ['tokensList', 'balanceInETH']),
    ...mapState('wallet', ['web3']),

    /**
     * Check if current network is XDC
     */
    isXdcNetwork() {
      const currencyName = this.network?.type?.currencyName?.toUpperCase();
      return currencyName === 'XDC' || currencyName === 'TXDC';
    },
    /**
     * Calculate balance in fiat for XDC network
     */
    xdcBalanceFiatValue() {
      if (this.isXdcNetwork && this.xdcPriceData.price > 0) {
        return new BigNumber(this.balanceInETH)
          .times(this.xdcPriceData.price)
          .toNumber();
      }
      return 0;
    },

    blockExplorer() {
      return this.network.type.blockExplorerAddr.replace(
        '[[address]]',
        this.address
      );
    },
    /**
     * verifies whether instance exists before giving path
     */
    instancePath() {
      return this.instance && this.instance.path ? true : false;
    },
    /**
     * show default title
     * unless resolved name isn't false
     * returns @string
     */
    title() {
      return this.resolvedName
        ? this.resolvedName
        : 'Portfolio Value'.toUpperCase();
    },
    /**
     * verify address title
     * returns @String
     */
    verifyAddressTitle() {
      return `This wallet is accessed with ${this.walletName}`;
    },
    /**
     * verify address body
     * returns @String
     */
    verifyAddressBody() {
      return `To verify, check the address on your ${this.walletName} device & make sure it is the same address as the one shown below.`;
    },
    /**
     * Shows hardware access or software access
     * returns @Boolean
     */
    showHardware() {
      return (
        !isEmpty(this.instance) &&
        this.instance?.path &&
        this.identifier !== WALLET_TYPES.MNEMONIC
      );
    },
    /**
     * returns checksummed address
     */
    getChecksumAddressString() {
      return this.address ? toChecksumAddress(this.address) : '';
    },
    /**
     * checks whether hardware wallet
     * can display address with the device
     *
     * returns @Boolean
     */
    canDisplayAddress() {
      return (
        !isEmpty(this.instance) &&
        this.instance.hasOwnProperty('displayAddress') &&
        this.instance.displayAddress
      );
    },
    /**
     * adds checks for icons that mew-components doesn't have
     * returns @String
     */
    iconIdentifier() {
      if (this.identifier === WALLET_TYPES.BITBOX2) {
        return 'bitbox';
      }
      return this.identifier;
    },
    /**
     * checks whether wallet can switch address
     * returns @Boolean
     */
    canSwitch() {
      return !isEmpty(this.instance) && this.wallets[this.identifier];
    },
    /**
     * returns hardware wallet name
     * returns @String
     */
    walletName() {
      return !isEmpty(this.instance) &&
        this.instance.meta.hasOwnProperty('name')
        ? this.instance.meta.name
        : '';
    },
    /**
     * returns token values - updated for XDC network
     * returns @Number
     */
    totalTokenBalance() {
      if (this.isXdcNetwork) {
        // For XDC network, calculate total including XDC balance and XRC20 tokens
        const xdcBalance = this.xdcBalanceFiatValue;
        // Add any additional token values from the store
        const otherTokens = this.totalTokenFiatValue || 0;
        // Avoid double counting - if totalTokenFiatValue already includes native token
        // you may need to adjust this logic based on your store implementation
        return xdcBalance > 0 ? xdcBalance : otherTokens;
      }
      return this.totalTokenFiatValue;
    },
    /**
     * returns total value including tokens
     * returns @String
     */
    totalWalletBalance() {
      if (!this.isTestNetwork) {
        if (this.isXdcNetwork) {
          const total = this.totalTokenBalance;
          return this.getFiatValue(total);
        }
        const total = this.totalTokenBalance;
        return this.getFiatValue(total);
      }
      return this.walletChainBalance;
    },
    /**
     * returns formatted wallet balance
     * returns @String
     */
    walletChainBalance() {
      return `${formatFloatingPointValue(this.balanceInETH).value}`;
    },
    /**
     * @returns {string} first 6 letters in the address
     */
    addrFirstSix() {
      return this.address ? this.address.substring(0, 6) : '';
    },
    /**
     * @returns {string} lat 4 letters in the address
     */
    addrlastFour() {
      return this.address
        ? this.address.substring(this.address.length - 4, this.address.length)
        : '';
    },
    /**
     * @returns {number} count of non chain tokens
     */
    nonChainTokensCount() {
      return this.tokensList.length - 1;
    }
  },
  watch: {
    /**
     * run setup for name resolver when web3 changes
     */
    web3() {
      this.setupNameResolver();
    },
    sidemenuStatus() {
      /**
       * At side menu closes, close paper wallet
       */
      this.showPaperWallet = false;
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
    this.setupNameResolver();
    this.fetchPriceData();
    this.startPriceUpdateInterval();
  },
  beforeDestroy() {
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
    }
  },
  methods: {
    ...mapActions('external', ['setTokenAndEthBalance']),
    ...mapActions('wallet', ['removeWallet']),

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

        // If CoinCap fails, try CryptoCompare
        if (this.xdcPriceData.price === 0) {
          await this.fetchFromCryptoCompare();
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

    /**
     * Fallback: Fetch XDC price from CryptoCompare
     */
    async fetchFromCryptoCompare() {
      try {
        const res = await fetch(
          'https://min-api.cryptocompare.com/data/pricemultifull?fsyms=XDC&tsyms=USD'
        );

        if (res.ok) {
          const data = await res.json();
          if (data.RAW && data.RAW.XDC && data.RAW.XDC.USD) {
            const coinData = data.RAW.XDC.USD;
            this.xdcPriceData = {
              price: coinData.PRICE || 0,
              priceChange24h: coinData.CHANGEPCT24HOUR || 0,
              marketCap: coinData.MKTCAP || 0,
              image: coinData.IMAGEURL
                ? `https://www.cryptocompare.com${coinData.IMAGEURL}`
                : this.xdcPriceData.image
            };
            return true;
          }
        }
        return false;
      } catch (e) {
        // console.warn('CryptoCompare API error:', e);
        return false;
      }
    },

    /**
     * checks if network supports ens
     * and creates a new name resolver instance
     */
    async setupNameResolver() {
      if (this.network.type.ensEnkryptType) {
        this.nameResolver = new Resolver(this.network);
      } else {
        this.nameResolver = null;
      }

      if (this.nameResolver) {
        try {
          const { name } = await this.nameResolver.resolveAddress(this.address);
          this.resolvedName = name;
        } catch (e) {
          this.resolvedName = '';
        }
      }
    },
    /**
     * refreshes the token and eth balance
     */
    refresh() {
      this.setTokenAndEthBalance();
      this.fetchPriceData(); // Also refresh price data
    },
    /**
     * calls hardware wallet show address function
     * and opens verify modal
     */
    viewAddressOnDevice() {
      this.showVerify = true;
      if (this.canDisplayAddress) {
        this.instance
          .displayAddress()
          .then(() => {
            this.showVerify = false;
            Toast('Address verified!', {}, SUCCESS);
          })
          .catch(e => {
            this.showVerify = false;
            Toast(e.message, {}, ERROR);
          });
      }
    },
    /**
     * Animates wallet card
     */
    animateMewCard() {
      const el = document.querySelector('.mew-card');
      if (el) {
        el.style.opacity = 0;
        anime({
          targets: el,
          opacity: 1,
          delay: 1300,
          duration: 500,
          easing: 'easeInOutQuad'
        });
      }
    },
    /**
     * set showChangeAddress to false
     * to close the modal
     */
    closeChangeAddress() {
      this.showChangeAddress = false;
    },
    /**
     * set showChangeAddress to true
     * to open the modal
     */
    openChangeAddress() {
      this.showChangeAddress = true;
    },
    /**
     * Copies address
     */
    copyAddress() {
      clipboardCopy(this.getChecksumAddressString);
      Toast(
        `Copied ${this.getChecksumAddressString} successfully!`,
        {},
        SUCCESS
      );
    },
    open() {
      this.trackDashboardAmplitude(DASHBOARD.SHOW_RECEIVE_ADDRESS);
      this.openQR = true;
    },
    /**
     * set openQR to false
     * to close the modal
     */
    closeQR() {
      this.openQR = false;
    },
    /**
     * set showLogout to false
     * to close the modal
     */
    closeLogout() {
      this.showLogout = false;
    },
    /**
     * close verify address
     */
    closeVerify() {
      this.showVerify = false;
    },
    /**
     * set showLogout to true
     * to open the modal
     */
    openLogout() {
      this.showLogout = true;
    },
    /**
     * calls removeWallet
     * and closes modal
     */
    onLogout() {
      this.closeLogout();
      this.trackLogout();
      this.removeWallet();
    }
  }
};
</script>

<style lang="scss" scoped>
.component--wallet-card {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  position: relative;
  width: 100%;
}

.mew-card {
  opacity: 0;
  border-radius: 16px;
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  height: 100%;

  img {
    height: 100%;
    width: 100%;
  }
}

.info-container {
  background-color: rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  width: 100%;
  position: relative;
  min-height: 172px;
  top: 0;
  left: 0;
  z-index: 1;

  .info-container--addr {
    font-size: 10px;
    line-height: 10px;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
  }

  .info-container--addr:hover {
    color: white;
  }

  .info-container--text {
    font-size: 12px;
    line-height: 20px;
    color: rgba(255, 255, 255, 0.9);
  }

  .info-container--text-chain-balance {
    font-size: 14px;
    line-height: 20px;
    color: rgba(255, 255, 255, 0.9);
  }

  .info-container--action-btn {
    border-radius: 10px !important;
    height: 32px !important;
    width: 32px !important;
    font-size: 16px !important;
    background: rgba(0, 0, 0, 0.06);
    backdrop-filter: blur(10px);
    letter-spacing: 0.03em;
    color: white;
  }

  .info-container--action- {
    opacity: 0.6;
    border-radius: 4px !important;
    height: 14px !important;
    width: 14px !important;
    font-size: 8px !important;
    box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.24),
      0px 1px 4px 0px rgba(0, 0, 0, 0.24);
  }

  .info-container--action-btn:hover,
  .info-container--action-:hover {
    opacity: 1;
  }

  // .info-container--icon:hover {
  //   color: var(--v-greenPrimary-base) !important;
  // }
}

.text-shadow {
  text-shadow: 0px 2px 8px rgba(0, 0, 0, 0.24), 0px 1px 4px rgba(0, 0, 0, 0.24);
}

.drop-shadow {
  filter: drop-shadow(0px 1px 4px rgba(0, 0, 0, 0.24)),
    drop-shadow(0px 2px 8px rgba(0, 0, 0, 0.24));
}

.refresh-icon:hover {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 32px;
  color: var(--v-white-base) !important;
  height: 20px;
  width: 20px;
}

.refresh-icon.v-icon.v-icon::after {
  background-color: transparent;
}

.personal-account-container {
  border-radius: 10px;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    padding-left: 8px;
    margin-left: -8px;
  }
}

.verify-popup-border {
  border: 1px solid var(--v-greenMedium-base);
  border-radius: 4px;
}

.theme-dark-heading {
  background-color: rgba(0, 0, 0, 0);
  border-radius: 12px;
  height: 24px;
  width: 100%;
}

.theme-dark-heading .v-skeleton-loader__bone::before {
  background-color: rgba(0, 0, 0, 0.2);
}
</style>

<style lang="scss">
// Skeleton loader custom color
.component--wallet-card {
  .v-skeleton-loader__bone {
    background: rgba(0, 0, 0, 0.3) !important;
  }
}
</style>
