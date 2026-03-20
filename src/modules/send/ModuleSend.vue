<template>
  <mew-module
    class="d-flex flex-grow-1 pt-6 bgWalletBlock module-send"
    title="Send"
    :has-elevation="true"
    :has-indicator="true"
  >
    <template #moduleBody>
      <!-- ===================================================================================== -->
      <!-- Tokens / Amount to Swap / Token Balance -->
      <!-- ===================================================================================== -->
      <v-row class="mt-5">
        <v-col cols="12" sm="6" class="pr-sm-1 pt-0 pb-0 pb-sm-4">
          <div class="position--relative">
            <app-button-balance
              :balance="selectedBalance"
              :loading="!showSelectedBalance"
              class="d-sm-none"
            />
            <mew-select
              ref="mewSelect"
              style="height: 62px"
              label="Token"
              :items="tokens"
              :is-custom="true"
              :value="selectedCurrency"
              @input="setCurrency"
            />
          </div>
        </v-col>
        <v-col cols="12" sm="6" class="pl-sm-1 pt-0 pb-2 pb-sm-4">
          <div class="position--relative">
            <app-button-balance
              :balance="selectedBalance"
              :loading="!showSelectedBalance"
              class="d-none d-sm-block"
            />
            <mew-input
              label="Amount"
              :value="amount"
              type="number"
              placeholder="0"
              :persistent-hint="true"
              :error-messages="amountErrorMessage"
              :max-btn-obj="maxBtn"
              :buy-more-str="buyMoreStr"
              class="AmountInput"
              @keydown.native="preventCharE($event)"
              @buyMore="
                () => {
                  openBuySell('ModuleSend');
                }
              "
              @input="val => setAmount(val, false)"
            />
          </div>
        </v-col>

        <!-- ===================================================================================== -->
        <!-- Low Balance Notice -->
        <!-- ===================================================================================== -->
        <v-col v-if="showBalanceNotice" cols="12" class="pt-0 pb-4">
          <send-low-balance-notice
            :address="address"
            :currency-name="currencyName"
            class="pa-3"
          />
        </v-col>

        <!-- ===================================================================================== -->
        <!-- Input Address -->
        <!-- ===================================================================================== -->
        <v-col cols="12" class="pt-4 pb-2">
          <module-address-book
            ref="addressInput"
            class="AddressInput"
            :currency="currencyName"
            @setAddress="setAddress"
          />
        </v-col>

        <!-- ===================================================================================== -->
        <!-- Network Fee (Note: comes with mt-5(20px) mb-8(32px))) -->
        <!-- ===================================================================================== -->
        <v-col cols="12" class="py-0 mb-8">
          <transaction-fee
            :show-fee="showSelectedBalance"
            :getting-fee="!txFeeIsReady"
            :error="feeError"
            :total-cost="totalCost"
            :tx-fee="txFee"
            :total-gas-limit="gasLimit"
            :message="feeError"
            :not-enough-eth="!hasEnoughEth"
            :from-eth="isFromNetworkCurrency"
            @onLocalGasPrice="handleLocalGasPrice"
          />
        </v-col>

        <!-- ===================================================================================== -->
        <!-- Advanced: -->
        <!-- ===================================================================================== -->
        <v-col cols="12" class="py-4">
          <mew-expand-panel
            ref="expandPanel"
            :panel-items="expandPanel"
            :idx-to-expand="openedPanels"
            @toggled="closeToggle"
          >
            <template #panelBody1>
              <div class="px-5">
                <!-- Warning Sheet -->
                <div
                  class="pa-5 warning greyPrimary--text border-radius--5px mb-8"
                >
                  <div class="d-flex font-weight-bold mb-2 textDark--text">
                    <v-icon class="textDark--text mew-body mr-1">
                      mdi-alert-outline</v-icon
                    >For advanced users only
                  </div>
                  <div class="textDark--text">
                    Please don't edit these fields unless you are an expert user
                    & know what you're doing. Entering the wrong information
                    could result in your transaction failing or getting stuck.
                  </div>
                </div>
                <div class="d-flex align-center justify-end pb-3">
                  <div
                    class="mew-body greenPrimary--text cursor--pointer"
                    @click="setGasLimit(defaultGasLimit)"
                  >
                    Reset to default: {{ formattedDefaultGasLimit }}
                  </div>
                </div>

                <mew-input
                  :value="gasLimit"
                  :label="$t('common.gas.limit')"
                  placeholder=""
                  :error-messages="gasLimitError"
                  type="number"
                  @input="setGasLimit"
                />

                <mew-input
                  v-show="!isToken"
                  ref="dataInput"
                  v-model="data"
                  :label="$t('sendTx.add-data')"
                  placeholder="0x..."
                  :rules="dataRules"
                  :error-messages="dataInvalidHexMessage"
                  :hide-clear-btn="data === '0x'"
                  class="mb-8"
                  @keyup.native="verifyHexFormat"
                  @focusout.native="verifyHexFormat"
                />
              </div>
            </template>
          </mew-expand-panel>
        </v-col>
      </v-row>

      <div class="d-flex flex-column mt-12">
        <div class="text-center">
          <mew-button
            title="Next"
            :has-full-width="false"
            btn-size="xlarge"
            :disabled="isDisabledNextBtn"
            class="SendButton"
            @click.native="send()"
          />
        </div>
        <div class="text-center mt-4">
          <mew-button
            :title="$t('common.clear-all')"
            :has-full-width="false"
            btn-size="small"
            btn-style="transparent"
            @click.native="clear()"
          />
        </div>
      </div>
    </template>
  </mew-module>
</template>

<script>
import { fromWei, isHexStrict } from 'web3-utils';
import { debounce, isEmpty, isNumber } from 'lodash';
import { mapGetters, mapState } from 'vuex';
import BigNumber from 'bignumber.js';

import { ETH } from '@/utils/networks/types';
import { Toast, ERROR, WARNING } from '@/modules/toast/handler/handlerToast';

import {
  formatIntegerToString,
  toBNSafe
} from '@/core/helpers/numberFormatHelper';
import { MAIN_TOKEN_ADDRESS } from '@/core/helpers/common';
import buyMore from '@/core/mixins/buyMore.mixin.js';
import { fromBase, toBase } from '@/core/helpers/unit';
import SendTransaction from '@/modules/send/handlers/handlerSend';
import xrc20TokensOriginal from '../xrc20Tokens.js';
import xrc20Abi from '../../modules/swap/handlers/abi/xrc20';

export default {
  components: {
    ModuleAddressBook: () => import('@/modules/address-book/ModuleAddressBook'),
    TransactionFee: () => import('@/modules/transaction-fee/TransactionFee'),
    SendLowBalanceNotice: () => import('./components/SendLowBalanceNotice.vue')
  },
  mixins: [buyMore],
  props: {
    prefilledAmount: {
      type: String,
      default: '0'
    },
    prefilledData: {
      type: String,
      default: '0x'
    },
    prefilledAddress: {
      type: String,
      default: ''
    },
    prefilledGasLimit: {
      type: String,
      default: '21000'
    }
  },
  data() {
    return {
      gasLimit: '21000',
      toAddress: '',
      sendTx: null,
      isValidAddress: false,
      amount: '0',
      selectedCurrency: {},
      data: '0x',
      userInputType: '',
      expandPanel: [
        {
          name: this.$t('common.advanced'),
          toggleTitle: 'Gas Limit & Data'
        }
      ],
      openedPanels: [],
      defaultGasLimit: '21000',
      gasLimitError: '',
      amountError: '',
      gasEstimationError: '',
      gasEstimationIsReady: false,
      localGasPrice: '0',
      selectedMax: false,
      xrc20Tokens: [...xrc20TokensOriginal], // Create a copy to avoid mutation
      tokenPrices: {}, // To store prices for all tokens
      loadingPrices: false
    };
  },
  computed: {
    ...mapState('wallet', ['address', 'instance', 'identifier', 'web3']),
    ...mapState('global', ['preferredCurrency']),
    ...mapGetters('global', [
      'network',
      'gasPrice',
      'isEthNetwork',
      'swapLink',
      'getFiatValue'
    ]),
    ...mapGetters('wallet', [
      'balanceInETH',
      'tokensList',
      'hasGasPriceOption'
    ]),
    ...mapGetters('custom', ['hasCustom', 'customTokens', 'hiddenTokens']),
    maxBtn() {
      return this.hasGasPriceOption
        ? {}
        : {
            title: 'Max',
            disabled: this.disableSwapBtn,
            method: this.setEntireBal
          };
    },
    isFromNetworkCurrency() {
      return (
        this.selectedCurrency?.contract === MAIN_TOKEN_ADDRESS ||
        this.selectedCurrency?.contract === 'native' ||
        this.selectedCurrency?.isNative
      );
    },
    isDisabledNextBtn() {
      return (
        this.feeError !== '' ||
        !this.isValidGasLimit ||
        !this.allValidInputs ||
        !this.gasEstimationIsReady ||
        !isHexStrict(this.data)
      );
    },
    buyMoreStr() {
      return this.isEthNetwork &&
        this.isFromNetworkCurrency &&
        this.amountError === 'Not enough balance to send!'
        ? this.network.type.canBuy
          ? 'Buy more.'
          : ''
        : '';
    },
    hasEnoughEth() {
      // Check whether user has enough eth to cover tx fee + amount to send
      if (this.isFromNetworkCurrency) {
        return BigNumber(this.amount)
          .plus(this.txFeeETH)
          .lte(this.balanceInETH);
      }
      // Check whether user has enough eth to cover tx fee + user has enough token balance for the amount to send
      return BigNumber(this.balanceInETH).gte(this.txFeeETH);
    },
    feeError() {
      return !this.hasEnoughEth
        ? `Not enough ${this.currencyName} to cover network fee.`
        : '';
    },
    showSelectedBalance() {
      return (
        !isEmpty(this.selectedCurrency) &&
        this.selectedCurrency.text !== 'Select Token'
      );
    },
    currencyName() {
      return this.network.type.currencyName;
    },
    showBalanceNotice() {
      const isZero = BigNumber(this.balanceInETH).lte(0);
      const isLessThanTxFee =
        BigNumber(this.balanceInETH).gt(0) &&
        BigNumber(this.txFeeETH).gt(this.balanceInETH);

      if (isZero || isLessThanTxFee) {
        return true;
      }

      return false;
    },
    selectedBalance() {
      if (this.selectedCurrency?.balance) {
        const balance = this.convertToDisplay(
          this.selectedCurrency.balance,
          this.selectedCurrency.decimals
        );
        return BigNumber(balance).toString();
      }
      return '0';
    },
    /**
     * Gets tokens from token list
     * Formats each token to be used in mew-select
     */
    tokens() {
      // Filter out XDC/native token from tokensList since we'll add it from xrc20Tokens
      const tokensList = this.tokensList
        .slice()
        .filter(t => !t.isHidden && t.symbol !== 'XDC' && t.symbol !== 'TXDC');

      // handle imgs for top section
      const imgs = tokensList.map(item => {
        item.totalBalance = this.getFiatValue(item.usdBalancef);
        item.tokenBalance = item.balancef;
        item.price = this.getFiatValue(item.pricef);
        item.subtext = item.name;
        item.value = item.contract;
        item.name = item.symbol;
        return item.img;
      });

      // Get XRC20 tokens with balances (includes native XDC)
      const xrc20WithBalances = this.getXrc20TokensForSelect();

      // Add XDC images to the top section imgs
      const xdcToken = xrc20WithBalances.find(
        t => t.isNative || t.symbol === 'XDC'
      );
      if (xdcToken && xdcToken.img) {
        imgs.unshift(xdcToken.img);
      }

      // if wallet has no ETH/XDC
      BigNumber(this.balanceInETH).lte(0)
        ? tokensList.unshift({
            hasNoEth: true,
            disabled: true,
            text: 'Your wallet is empty.',
            linkText: this.isEthNetwork ? 'Buy ETH' : '',
            link: this.isEthNetwork ? this.swapLink : ''
          })
        : null;

      // base returned list
      const returnedArray = [
        {
          text: 'Select Token',
          imgs: imgs.splice(0, 5),
          total: `${this.tokensList.length + this.xrc20Tokens.length}`,
          divider: true,
          selectLabel: true
        },
        {
          header: 'My Wallet'
        }
      ];

      // Add native XDC first if available
      const nativeXdc = xrc20WithBalances.find(
        t => t.isNative || t.contract === 'native'
      );
      if (nativeXdc) {
        returnedArray.push(nativeXdc);
      }

      // Add other tokens from tokensList
      returnedArray.push(...tokensList);

      // add custom tokens section
      const customTokens = this.customTokens.reduce((arr, item) => {
        const isHidden = this.hiddenTokens.find(
          token => item.contract == token.address
        );
        if (isHidden) return arr;

        const priceData = this.tokenPrices[item.contract || item.symbol];
        const enrichedToken = { ...item };
        enrichedToken.decimals = BigNumber(item.decimals).toNumber();

        if (priceData) {
          const balance = fromBase(
            enrichedToken.balance || '0',
            enrichedToken.decimals
          );
          const usdBalance = new BigNumber(balance)
            .times(priceData.price)
            .toFixed(2);
          enrichedToken.totalBalance = this.getFiatValue(usdBalance);
          enrichedToken.tokenBalance = balance;
          enrichedToken.price = this.getFiatValue(priceData.price);
          enrichedToken.img = priceData.image || enrichedToken.img;
        } else {
          enrichedToken.totalBalance = '$0.00';
          enrichedToken.tokenBalance = fromBase(
            enrichedToken.balance || '0',
            enrichedToken.decimals
          );
          enrichedToken.price = '$0.00';
        }

        enrichedToken.subtext = enrichedToken.name;
        enrichedToken.value = enrichedToken.contract;
        enrichedToken.name = enrichedToken.symbol;

        arr.push(enrichedToken);
        return arr;
      }, []);

      // add custom tokens if available
      if (customTokens.length > 0) {
        returnedArray.push({
          header: 'Custom Tokens'
        });
        returnedArray.push(...customTokens);
      }

      // add XRC20 tokens section (excluding native XDC which is already added)
      const xrc20NonNative = xrc20WithBalances.filter(
        t => !t.isNative && t.contract !== 'native'
      );
      if (xrc20NonNative.length > 0) {
        returnedArray.push({
          header: 'XRC20 Tokens'
        });
        returnedArray.push(...xrc20NonNative);
      }

      return returnedArray;
    },

    /* Property returns either gas estimmation error or amount error*/
    amountErrorMessage() {
      return this.gasEstimationError !== '' && this.sendTx?.hasEnoughBalance()
        ? this.gasEstimationError
        : this.amountError;
    },
    /**
     * Property checks if user input valid amount
     * Results to false if amount is empty, amount is negative, has invalid decimal points
     * @returns {boolean} true or false based on above params
     */
    isValidAmount() {
      /** !amount */
      if (!this.amount) {
        return false;
      }
      if (!isNumber(this.selectedCurrency?.decimals)) {
        return false;
      }
      /** amount is negative */
      if (BigNumber(this.amount).lt(0)) {
        return false;
      }
      /** return amount has valid decimals */
      return SendTransaction.helpers.hasValidDecimals(
        this.amount,
        this.selectedCurrency.decimals
      );
    },
    isValidGasLimit() {
      if (this.gasLimit) {
        return (
          BigNumber(this.gasLimit).gt(0) &&
          BigNumber(this.gasLimit).dp() < 1 &&
          toBNSafe(this.gasLimit).gte(toBNSafe(this.defaultGasLimit))
        );
      }
      return false;
    },
    dataRules() {
      return [
        value => {
          return isHexStrict(value);
        }
      ];
    },
    dataInvalidHexMessage() {
      if (this.data === '') {
        return 'Data cannot be empty!';
      }
      if (isHexStrict(this.data)) {
        return '';
      }
      return 'Invalid hex data';
    },
    isEthNetwork() {
      return this.network.type.name === ETH.name;
    },
    isToken() {
      if (this.sendTx && this.selectedCurrency?.contract)
        return this.sendTx.isToken();
      return false;
    },
    multiwatch() {
      return (
        this.amount,
        this.isValidAddress,
        this.data,
        this.selectedCurrency,
        new Date().getTime() / 1000
      );
    },
    txFeeETH() {
      return fromWei(this.txFee);
    },
    currencyDecimals() {
      return this.selectedCurrency?.hasOwnProperty('decimals')
        ? this.selectedCurrency.decimals
        : 18;
    },
    totalCost() {
      if (
        !SendTransaction.helpers.hasValidDecimals(
          this.amount,
          this.selectedCurrency?.decimals
        )
      )
        return '0';
      const amountToWei = toBase(this.amount, this.currencyDecimals);
      return this.isFromNetworkCurrency
        ? BigNumber(this.txFee).plus(amountToWei).toString()
        : this.txFee;
    },
    txFee() {
      if (this.isValidGasLimit) {
        return this.actualGasPrice.mul(toBNSafe(this.gasLimit)).toString();
      }
      return '0';
    },
    /**
     * Computed property determines whether or not show the loading state of the fee
     * Fee is loaded when: invalid amount, invalid gas limit
     * @return {boolean} true of false based on the above params
     */
    txFeeIsReady() {
      return this.isValidAmount && this.isValidGasLimit;
    },
    getCalculatedAmount() {
      return toBase(this.amount ? this.amount : 0, this.currencyDecimals);
    },
    allValidInputs() {
      if (this.sendTx && this.sendTx.currency) {
        return (
          this.isValidAmount &&
          this.sendTx.hasEnoughBalance() &&
          this.isValidAddress
        );
      }
      return false;
    },
    actualGasPrice() {
      if (toBNSafe(this.localGasPrice).eqn(0)) {
        return toBNSafe(this.gasPrice);
      }
      return toBNSafe(this.localGasPrice);
    },
    formattedDefaultGasLimit() {
      return formatIntegerToString(this.defaultGasLimit);
    },
    disableSwapBtn() {
      if (!isEmpty(this.sendTx) && !isEmpty(this.selectedCurrency)) {
        return !this.sendTx.hasEnoughBalance();
      }
      return true;
    },
    isValidForGas() {
      return (
        this.sendTx &&
        this.sendTx.currency &&
        this.isValidAmount &&
        this.isValidAddress
      );
    }
  },
  watch: {
    multiwatch() {
      if (this.allValidInputs) {
        this.debounceEstimateGas();
      }
    },
    web3(newVal) {
      if (newVal) this.fetchAllTokenData();
    },
    isPrefilled() {
      this.prefillForm();
    },
    tokensList: {
      handler: function (val) {
        // Find native XDC token from xrc20Tokens instead
        const nativeXdc = this.xrc20Tokens.find(
          t => t.isNative || t.contract === 'native'
        );
        if (nativeXdc && nativeXdc.balance) {
          this.selectedCurrency = this.formatXrc20ForSelect(nativeXdc);
        } else if (val.length > 0) {
          this.selectedCurrency = val[0];
        } else {
          this.selectedCurrency = {};
        }

        if (this.sendTx) {
          this.sendTx.setCurrency(this.selectedCurrency);
        }
      },
      deep: true,
      immediate: true
    },
    toAddress() {
      if (this.isValidAddress) {
        this.sendTx.setTo(this.toAddress, this.userInputType);
      }
    },
    amount(newVal) {
      if (!newVal) this.amount = '0';
      if (this.isValidAmount) {
        this.sendTx.setValue(this.getCalculatedAmount);
      }
      this.amountError = '';
      this.gasEstimationError = '';
      if (this.isValidForGas) this.debounceEstimateGas();
      this.debounceAmountError(newVal);
    },
    selectedCurrency: {
      handler: function (newVal) {
        if (this.sendTx) {
          this.sendTx.setCurrency(newVal);
          this.gasEstimationIsReady = false;
          this.gasEstimationError = '';
          if (this.isValidForGas) this.debounceEstimateGas();
          this.debounceAmountError(this.amount);
          this.gasLimit = this.defaultGasLimit;
        }
        this.data = '0x';
      },
      immediate: true,
      deep: true
    },
    data() {
      if (!this.data) this.data = '0x';
      if (isHexStrict(this.data)) this.sendTx.setData(this.data);
    },
    gasLimit(newVal) {
      if (this.isValidGasLimit) {
        this.sendTx.setGasLimit(this.gasLimit);
      }
      this.gasLimitError = '';
      this.debouncedGasLimitError(newVal);
    },
    network() {
      this.clear();
      const currentGasPrice = this.gasPrice;
      const x = setInterval(() => {
        if (this.gasPrice !== currentGasPrice) {
          this.localGasPrice = this.gasPrice;
          this.sendTx.setLocalGasPrice(this.actualGasPrice);
          clearInterval(x);
        }
      }, 500);
    },
    address(newVal) {
      this.clear();
      this.debounceAmountError('0');
      if (newVal) {
        this.fetchAllTokenData();
      }
    },
    txFeeETH(newVal) {
      if (!isEmpty(this.selectedCurrency)) this.localGasPriceWatcher(newVal);
    },
    customTokens: {
      handler: 'fetchAllTokenPrices',
      deep: true
    }
  },
  async mounted() {
    await this.fetchAllTokenData();
    this.setSendTransaction();
    this.gasLimit = this.prefilledGasLimit;

    // Set native XDC as default selected currency
    const nativeXdc = this.xrc20Tokens.find(
      t => t.isNative || t.contract === 'native'
    );
    if (nativeXdc) {
      this.selectedCurrency = this.formatXrc20ForSelect(nativeXdc);
    } else if (this.tokensList.length > 0) {
      this.selectedCurrency = this.tokensList[0];
    }

    if (this.sendTx) {
      this.sendTx.setCurrency(this.selectedCurrency);
      this.sendTx.setLocalGasPrice(this.actualGasPrice);
    }
  },
  created() {
    this.debouncedGasLimitError = debounce(value => {
      this.setGasLimitError(value);
    }, 1000);
    this.debounceAmountError = debounce(value => {
      this.setAmountError(value);
    }, 1000);
    this.debounceEstimateGas = debounce(() => {
      if (this.isValidForGas) {
        this.estimateAndSetGas();
      }
    }, 500);
  },
  methods: {
    /**
     * Fetch all token data (prices + balances)
     */
    async fetchAllTokenData() {
      if (!this.address) return;
      this.loadingPrices = true;
      try {
        await this.fetchAllTokenPrices();
        await this.fetchXRC20Balances();
      } catch (error) {
        // console.error('Error fetching token data:', error);
      }
      this.loadingPrices = false;
    },

    /**
     * Fetch prices from multiple APIs with fallbacks
     */
    async fetchAllTokenPrices() {
      const allTokens = [...this.xrc20Tokens, ...this.customTokens];

      // Try CoinGecko first (using coingeckoId - more reliable)
      await this.fetchFromCoinGeckoById(allTokens);

      // Fallback to CoinCap for any missing prices
      await this.fetchFromCoinCap(allTokens);
    },

    /**
     * Primary API: CoinGecko using IDs (more reliable than symbols)
     */
    async fetchFromCoinGeckoById(tokensToFetch) {
      try {
        const tokensWithIds = tokensToFetch.filter(t => t.coingeckoId);
        if (tokensWithIds.length === 0) return;

        const ids = [...new Set(tokensWithIds.map(t => t.coingeckoId))].join(
          ','
        );

        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=false`
        );

        if (res.ok) {
          const data = await res.json();
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
        }
      } catch (e) {
        // console.warn('CoinGecko API error:', e);
      }
    },

    /**
     * Fallback API 1: CoinCap (free, no CORS issues)
     */
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

    /**
     * Get native XDC balance
     */
    async getNativeBalance() {
      try {
        if (!this.web3 || !this.web3.eth || !this.address) return '0';
        const balanceWei = await this.web3.eth.getBalance(this.address);
        return balanceWei.toString();
      } catch (e) {
        // console.error('Error getting native balance:', e);
        return '0';
      }
    },

    normalizeXdcAddress(address) {
      if (
        typeof address === 'string' &&
        address.toLowerCase().startsWith('xdc')
      ) {
        return '0x' + address.slice(3);
      }
      return address;
    },

    /**
     * Fetch XRC20 token balances including native XDC
     */
    async fetchXRC20Balances() {
      if (!this.address || !this.web3) return;

      const balances = await Promise.all(
        this.xrc20Tokens.map(async token => {
          try {
            // Handle native XDC token differently
            if (token.isNative || token.contract === 'native') {
              const balance = await this.getNativeBalance();
              const decimals = 18;
              return {
                ...token,
                balance: balance,
                balancef: fromBase(balance, decimals),
                decimals: decimals
              };
            }

            // Handle XRC20 tokens
            const contract = new this.web3.eth.Contract(
              xrc20Abi,
              token.contract
            );
            const balance = await contract.methods
              .balanceOf(this.address)
              .call();
            const decimals = await contract.methods.decimals().call();

            return {
              ...token,
              balance: balance.toString(),
              balancef: fromBase(balance, decimals), // Formatted balance
              decimals: parseInt(decimals)
            };
          } catch (e) {
            // console.error(`Error fetching balance for ${token.symbol}:`, e);
            return token; // Fallback to original token data
          }
        })
      );

      this.xrc20Tokens = balances;

      // Update selected currency if it's native XDC
      if (this.isFromNetworkCurrency) {
        const nativeXdc = this.xrc20Tokens.find(
          t => t.isNative || t.contract === 'native'
        );
        if (nativeXdc) {
          this.selectedCurrency = this.formatXrc20ForSelect(nativeXdc);
          if (this.sendTx) {
            this.sendTx.setCurrency(this.selectedCurrency);
          }
        }
      }
    },

    /**
     * Format XRC20 token for mew-select
     */
    formatXrc20ForSelect(token) {
      const priceData = this.tokenPrices[token.contract || token.symbol];

      const enrichedToken = { ...token };

      if (priceData) {
        const balance = token.balancef || '0';
        const usdBalance = new BigNumber(balance)
          .times(priceData.price)
          .toFixed(2);
        enrichedToken.totalBalance = this.getFiatValue(usdBalance);
        enrichedToken.price = this.getFiatValue(priceData.price);
        enrichedToken.img =
          priceData.image ||
          token.image ||
          'https://coin-images.coingecko.com/coins/images/2912/large/xdc-icon.png?1696503661';
      } else {
        enrichedToken.totalBalance = '$0.00';
        enrichedToken.price = '$0.00';
        // Default XDC image
        if (token.isNative || token.symbol === 'XDC') {
          enrichedToken.img =
            'https://coin-images.coingecko.com/coins/images/2912/large/xdc-icon.png?1696503661';
        }
      }

      enrichedToken.tokenBalance = token.balancef || '0';
      enrichedToken.subtext = token.name;
      enrichedToken.value = token.contract;
      enrichedToken.name = token.symbol;

      // Important: Set contract to MAIN_TOKEN_ADDRESS for native token
      // so isFromNetworkCurrency works correctly
      if (token.isNative || token.contract === 'native') {
        enrichedToken.contract = MAIN_TOKEN_ADDRESS;
      }

      return enrichedToken;
    },

    /**
     * Get XRC20 tokens formatted for mew-select
     */
    getXrc20TokensForSelect() {
      return this.xrc20Tokens.map(token => this.formatXrc20ForSelect(token));
    },

    localGasPriceWatcher(newVal) {
      const total = BigNumber(newVal).plus(this.amount);
      const amt = toBase(this.amount, this.selectedCurrency?.decimals);
      const balance = toBNSafe(this.selectedCurrency.balance);

      if (
        (this.selectedMax &&
          this.selectedCurrency &&
          this.isFromNetworkCurrency &&
          total.gt(this.balanceInETH)) ||
        (this.selectedCurrency &&
          !this.isFromNetworkCurrency &&
          balance.lt(amt))
      ) {
        this.setEntireBal();
      }
    },
    verifyHexFormat() {
      this.$refs.dataInput._data.inputValue = this.data;
      if (!this.data || isEmpty(this.data)) {
        this.data = '0x';
        this.$refs.dataInput._data.inputValue = '0x';
      }
    },
    /**
     * Resets values to default
     */
    clear() {
      if (this.$refs && this.$refs.addressInput)
        this.$refs.addressInput.clear();
      this.toAddress = '';

      // Set native XDC as default
      const nativeXdc = this.xrc20Tokens.find(
        t => t.isNative || t.contract === 'native'
      );
      if (nativeXdc) {
        this.selectedCurrency = this.formatXrc20ForSelect(nativeXdc);
      } else if (this.tokensList.length > 0) {
        this.selectedCurrency = this.tokensList[0];
      } else {
        this.selectedCurrency = {};
      }

      this.sendTx = null;
      this.isValidAddress = false;
      this.amount = '0';
      this.data = '0x';
      this.userInputType = '';
      this.defaultGasLimit = '21000';
      this.gasLimitError = '';
      this.amountError = '';
      this.gasEstimationError = '';
      this.gasEstimationIsReady = false;
      this.localGasPrice = '0';

      // resets the defaults on mount
      this.setSendTransaction();
      this.gasLimit = this.prefilledGasLimit;
      this.sendTx.setCurrency(this.selectedCurrency);
      this.handleLocalGasPrice(this.gasPrice);
    },
    /**
     * Method sets gas limit to default when Advanced closed , ONLY IF gasLimit was invalid
     */
    closeToggle() {
      if (!this.isValidGasLimit) {
        this.gasLimit = this.defaultGasLimit;
        this.setGasLimitError(this.gasLimit);
      }
    },
    /**
     * Method sets amountError based on the user input
     * Has to be set manualy and debouned otherwise error message is not displayed when tokens are switched and amount input component is out of focus
     * @param value {string}
     */
    setAmountError(value) {
      if (value) {
        if (BigNumber(value).lt(0)) {
          this.amountError = "Amount can't be negative!";
        } else if (
          this.selectedCurrency?.decimals &&
          !SendTransaction.helpers.hasValidDecimals(
            value,
            this.selectedCurrency.decimals
          )
        ) {
          this.amountError = 'Invalid decimal points';
        } else if (this.sendTx && this.sendTx.currency) {
          this.amountError = this.sendTx.hasEnoughBalance()
            ? ''
            : 'Not enough balance to send!';
        } else {
          this.amountError = '';
        }
      } else {
        this.amountError = 'Required';
      }
    },
    /**
     * Method sets gasLimitError based on the user input
     * Has to be set manualy and debouned otherwise error message is not displayed when tokens are switched and gas limit input component is out of focus
     * @param value {string}
     */
    setGasLimitError(value) {
      if (value) {
        if (BigNumber(value).lte(0))
          this.gasLimitError = 'Gas limit must be greater than 0';
        else if (BigNumber(value).dp() > 0)
          this.gasLimitError = 'Gas limit can not have decimal points';
        else if (toBNSafe(value).lt(toBNSafe(this.defaultGasLimit)))
          this.gasLimitError = 'Amount too low. Transaction will fail';
        else {
          this.gasLimitError = '';
        }
      } else {
        this.gasLimitError = 'Required';
      }
    },
    setAddress(addr, isValidAddress, userInputType) {
      const address = this.normalizeXdcAddress(addr);
      this.toAddress = address;
      this.isValidAddress = isValidAddress;
      this.userInputType = userInputType;
    },
    setSendTransaction() {
      this.localGasPrice = this.gasPrice;
      this.sendTx = new SendTransaction();
    },
    estimateAndSetGas() {
      this.gasEstimationIsReady = false;
      if (this.selectedCurrency.contract !== this.sendTx.currency.contract) {
        this.sendTx.setCurrency(this.selectedCurrency);
      }
      this.sendTx
        .estimateGas()
        .then(res => {
          this.gasLimit = toBNSafe(res).toString();
          this.defaultGasLimit = toBNSafe(res).toString();
          this.setGasLimitError(this.gasLimit);
          this.sendTx.setGasLimit(res);
          this.gasEstimationError = '';
          this.gasEstimationIsReady = true;
        })
        .catch(e => {
          this.gasEstimationError = e.message;
          this.gasEstimationIsReady = false;
        });
    },
    send() {
      window.scrollTo(0, 0);
      this.sendTx
        .submitTransaction()
        .then(() => {
          this.clear();
        })
        .catch(error => {
          if (!this.instance) {
            Toast(error, {}, ERROR);
          }
        });
    },
    prefillForm() {
      if (this.isPrefilled) {
        const foundToken = this.tokensymbol
          ? this.tokensList.find(item => {
              return item.name.toLowerCase() === this.tokenSymbol.toLowerCase();
            })
          : undefined;
        this.data = isHexStrict(this.prefilledData) ? this.prefilledData : '0x';
        this.amount = this.prefilledAmount;
        this.toAddress = this.prefilledAddress;
        this.gasLimit = this.prefilledGasLimit;
        this.selectedCurrency = foundToken ? foundToken : this.selectedCurrency;
        this.$refs.expandPanel.setToggle(true);
        Toast(this.$t('sendTx.prefilled-warning'), {}, WARNING, 1000);
        this.clearPrefilled();
      }
    },
    convertToDisplay(amount, decimals) {
      const amt = toBNSafe(amount).toString();
      return decimals ? fromBase(amt, decimals).toString() : amt;
    },
    setEntireBal() {
      if (isEmpty(this.selectedCurrency) || this.isFromNetworkCurrency) {
        const amt = BigNumber(this.balanceInETH).minus(this.txFeeETH);
        this.setAmount(amt.lt(0) ? '0' : amt.toFixed(), true);
      } else {
        this.setAmount(
          this.convertToDisplay(
            this.selectedCurrency.balance,
            this.selectedCurrency.decimals
          ),
          true
        );
      }
    },
    setAmount: debounce(function (val, max) {
      const value = val ? val : 0;
      this.amount = BigNumber(value).toFixed();
      this.selectedMax = max;
    }, 500),
    setGasLimit(value) {
      this.gasLimit = value;
    },
    setCurrency(value) {
      this.selectedCurrency = value;
      this.amount = '0';
    },
    handleLocalGasPrice(e) {
      this.localGasPrice = e;
      this.sendTx.setLocalGasPrice(e);
    },
    preventCharE(e) {
      if (e.key === 'e') e.preventDefault();
    }
  }
};
</script>

<style lang="scss" scoped>
.border-bottom {
  border-bottom: 2px dotted #f5f5f5;
}

.balance-container {
  top: -15px;
  position: absolute;
  right: 15px;
}
</style>

<style lang="scss">
.module-send .mew-input .v-input__slot {
  height: 56px !important;
}
</style>
