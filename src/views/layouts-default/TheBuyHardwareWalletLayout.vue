<template>
  <div class="expandHeader pb-12 pt-16">
    <v-container>
      <the-layout-header title="Get a hardware wallet today!" />
      <v-sheet
        color="transparent"
        :max-width="!$vuetify.breakpoint.smAndDown ? '500px' : '470px'"
        class="mx-auto"
      >
        <v-row>
          <v-col v-for="(b, key) in buttons" :key="key" cols="12">
            <a :href="b.link" target="_blank" @click="trackBuy(b.name)">
              <mew-button
                color-theme="basic"
                btn-style="light"
                style="height: 200px"
                has-full-width
              >
                <div
                  class="px-5 text-left d-flex align-center justify-space-between"
                  style="width: 100%"
                >
                  <div>
                    <v-img
                      v-if="b.logoImg"
                      max-height="30px"
                      max-width="120px"
                      :src="b.logoImg"
                      alt="Hardware wallet"
                      class="mb-3"
                    />
                    <div
                      v-if="b.logoText"
                      class="d-flex align-center mb-3"
                      :class="
                        !$vuetify.breakpoint.smAndDown
                          ? 'mew-subtitle'
                          : 'mew-heading-2'
                      "
                    >
                      {{ b.logoText }}
                    </div>
                    <div
                      class="mew-caption text-uppercase font-weight-bold textDark--text text--lighten-1"
                    >
                      {{ b.priceNote }}
                    </div>

                    <div class="textDark--text d-flex">
                      <div class="mew-caption mr-1 font-weight-black">
                        {{ b.currency }}
                      </div>
                      <div
                        class="mew-heading-2 text-uppercase font-weight-bold"
                      >
                        {{ b.price }}
                      </div>
                    </div>
                    <div class="mt-3 greenPrimary--text font-weight-medium">
                      Learn more >
                    </div>
                  </div>

                  <div class="pl-4">
                    <v-img
                      :src="b.walletImg"
                      alt="Hardware Wallet"
                      max-width="90px"
                      max-height="100px"
                      contain
                    />
                  </div>
                </div>
              </mew-button>
            </a>
          </v-col>
          <v-col
            v-if="showBackToCreate"
            cols="12"
            class="d-flex align-center justify-center"
          >
            <mew-button
              title="Back to Create Wallet"
              btn-size="xlarge"
              btn-style="outline"
              color-theme="white"
              @click.native="backToCreate"
            />
          </v-col>
        </v-row>
      </v-sheet>
    </v-container>
  </div>
</template>

<script>
import handlerAnalytics from '@/modules/analytics-opt-in/handlers/handlerAnalytics.mixin';
import { COMMON } from '@/modules/analytics-opt-in/handlers/configs/events';
import { ROUTES_HOME } from '@/core/configs/configRoutes';
export default {
  name: 'TheBuyHardwareWalletLayout',
  components: {
    TheLayoutHeader: () => import('../components-default/TheLayoutHeader')
  },
  mixins: [handlerAnalytics],
  beforeRouteEnter(to, from, next) {
    next(vm => {
      if (from.name === ROUTES_HOME.CREATE_WALLET.NAME) {
        vm.showBackToCreate = true;
      }
    });
  },
  data: () => ({
    buttons: [
      {
        logoImg: require('@/assets/images/hardware-wallets/logo-ledger.svg'),
        walletImg: require('@/assets/images/hardware-wallets/ledger.png'),
        priceNote: 'Starting from',
        currency: '$',
        price: '59.00',
        note: 'Easy to carry everywhere thanks to its USB format.',
        link: 'https://shop.ledger.com/?r=fa4b',
        name: 'Ledger'
      },
      {
        logoImg: require('@/assets/images/hardware-wallets/logo-trezor.svg'),
        walletImg: require('@/assets/images/hardware-wallets/trezor.png'),
        priceNote: 'Starting from',
        currency: '$',
        price: '60.00',
        note: 'The most trusted hardware wallet in the world. Get yours today!',
        link: 'https://trezor.io/?offer_id=12&aff_id=2029',
        name: 'Trezor'
      }
    ],
    showBackToCreate: false
  }),
  mounted() {
    this.trackBuyHardwareAmplitude(COMMON.PAGE_SHOWN);
  },
  methods: {
    trackBuy(name) {
      this.trackBuyHardwareAmplitude(name);
    },
    backToCreate() {
      this.$router.push({ name: ROUTES_HOME.CREATE_WALLET.NAME });
    }
  }
};
</script>

<style lang="scss" scoped>
.btn-custom {
  position: relative;
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgb(11, 40, 64);
    opacity: 0;
    transition: opacity 0.2s cubic-bezier(0.4, 0, 0.6, 1);
  }

  &:hover::before {
    opacity: 0.08;
  }
}
</style>
