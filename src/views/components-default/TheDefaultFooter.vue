<template>
  <div class="footer pt-7">
    <div class="container">
      <div class="row">
        <div class="col-3">
          <div class="footer__links">
            <h2 class="mt-0">Community</h2>
            <a href="https://xinfin.org/developers-ecosystem-partners">
              Developers Ecosystem Partners
            </a>
            <a href="https://xinfin.org/join-community"> Join Community </a>
            <a href="https://xinfin.org/community-bounty"> Community Bounty </a>
            <a href="https://forum.xinfin.org/"> XDC Forum </a>
            <a href="https://docs.xdc.network/media/articles/"> Media </a>
            <a href="https://xinfin.org/events"> Events </a>
          </div>

          <div class="footer__links">
            <h2 class="mt-0">Learn</h2>
            <a href="https://xinfin.org/about"> About Us </a>
            <a href="https://xinfin.org/xdpos"> XDC 2.0 </a>
            <a href="https://xinfin.org/docs/whitepaper-tech.pdf">
              Technical White Paper
            </a>
            <a href="https://github.com/XinFinOrg/Open-Hackathon">
              Online Hackathon
            </a>
          </div>
        </div>
        <div class="col-3">
          <div class="footer__links">
            <h2 class="mt-0">Tools</h2>
            <a href="https://xdcscan.com/"> XDC Explorer </a>
            <a href="https://stats1.xinfin.network/"> XDC Network Status </a>
            <a href="https://faucet.apothem.network/"> XDC Faucet </a>
            <a href="https://remix.xinfin.network/"> XDC Network Remix </a>
            <a href="https://xinfin.org/quick-tools-guide">
              Quick Tools Guide
            </a>
            <a href="https://xinfin.org/blockchain-analytics-tools">
              Blockchain Analytics Tools
            </a>
          </div>

          <div class="footer__links">
            <h2 class="mt-0">Developers</h2>
            <a href="https://docs.xdc.network/">Documentation</a>
            <a href="https://xdc.dev/">XDC Developers Forum</a>
            <a href="https://coderun.ai/">XDC AI Developer Tools</a>
            <a href="https://github.com/XinFinorg">GitHub</a>
          </div>
        </div>
        <div class="col-3">
          <div class="footer__links">
            <h2 class="mt-0">Use XDC</h2>
            <a href="https://xinfin.org/ecosystem-dapps"> Ecosystem dApps </a>
            <a href="https://xinfin.org/setup-masternode"> Setup Masternode </a>
            <a href="https://xinfin.org/get-xdc"> Get XDC </a>
            <a href="https://xinfin.org/wallets"> XDC Wallets </a>
            <a href="https://xinfin.org/xdc-subnet"> XDC Subnet </a>
          </div>
        </div>
        <div class="col-3">
          <div class="footer__links">
            <h2 class="mt-0">Other Links</h2>
            <a href="https://xinfin.org/contact"> Contact Us </a>
            <a href="https://xinfin.org/xdc-accelerator-program">
              Join Accelerator
            </a>
            <a href="https://xinfin.org/exchange-listing-resource">
              Exchange Listing Resource
            </a>
            <a href="https://xinfin.org/custody-services-integration">
              Custody Services Integration
            </a>
            <a href="https://xinfin.org/brand-assets"> Brand Assets </a>
            <a href="https://xinfin.org/risk-warning-disclaimer">
              Risk Warning Disclaimer
            </a>
            <a href="https://docs.xdc.network/"> FAQs </a>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-6">
          <div class="footer__copyright">
            <p>© {{ year }} XDCWallet. All rights reserved.</p>
            <p>
              Pricing taken from
              <a
                href="https://www.coingecko.com/"
                target="_blank"
                @click="trackCoinGecko"
                >CoinGecko</a
              >.
            </p>
            <v-switch
              class="d-none d-md-block"
              :input-value="consentToTrack"
              inset
              :label="`Data Tracking ${consentToTrack ? 'On' : 'Off'}`"
              color="#05C0A5"
              off-icon="mdi-alert-circle"
              @change="setConsent"
            />
          </div>
        </div>
        <div class="col-6">
          <div class="footer__social">
            <h5>Join XDC Community</h5>
            <div class="footer__social-links flex-wrap">
              <a
                href="https://www.facebook.com/XDCNetworkBlockchain"
                target="_blank"
                class="footer__social-link"
                @click="trackJoinMewCommunity('facebook')"
              >
                <facebook />
              </a>
              <a
                href="https://x.com/XDC_Network_"
                target="_blank"
                class="footer__social-link"
                @click="trackJoinMewCommunity('twitter')"
              >
                <twitter />
              </a>
              <a
                href="https://www.instagram.com/xdc_network_/?hl=en"
                target="_blank"
                class="footer__social-link"
                @click="trackJoinMewCommunity('instagram')"
              >
                <instagram />
              </a>
              <a
                href="https://www.linkedin.com/company/xdcnetwork/"
                target="_blank"
                class="footer__social-link"
                @click="trackJoinMewCommunity('linkedin')"
              >
                <linkedin />
              </a>
              <a
                href="https://github.com/XinFinorg"
                target="_blank"
                class="footer__social-link"
                @click="trackJoinMewCommunity('github')"
              >
                <github />
              </a>
              <a
                href="https://www.reddit.com/r/xinfin/"
                target="_blank"
                class="footer__social-link"
                @click="trackJoinMewCommunity('reddit')"
              >
                <reddit />
              </a>
              <a
                href="https://medium.com/xdcnetwork"
                target="_blank"
                class="footer__social-link"
                @click="trackJoinMewCommunity('medium')"
              >
                <medium />
              </a>
              <a
                href="https://t.me/XDC_Network_Updates"
                target="_blank"
                class="footer__social-link"
                @click="trackJoinMewCommunity('telegram')"
              >
                <telegram />
              </a>
            </div>
          </div>
        </div>
        <!-- <div class="col-12 footer__copyright d-none d-md-block">
          <p>
            <a
              :href="`https://github.com/MyEtherWallet/MyEtherWallet/releases/tag/v${packageVersion}`"
              >Version: v{{ packageVersion }}</a
            >
          </p>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

import Facebook from '@/assets/images/icons/social/facebook-logo.vue';
import Twitter from '@/assets/images/icons/social/twitter-logo.vue';
import Instagram from '@/assets/images/icons/social/instagram-logo.vue';
import Linkedin from '@/assets/images/icons/social/linkedin-logo.vue';
import Github from '@/assets/images/icons/social/github-logo.vue';
import Reddit from '@/assets/images/icons/social/reddit-logo.vue';
import Medium from '@/assets/images/icons/social/medium-logo.vue';
import Telegram from '@/assets/images/icons/social/telegram-logo.vue';
import DonateEth from '@/assets/images/icons/social/donate-eth.vue';
import DonateBtc from '@/assets/images/icons/social/donate-btc.vue';

import handlerAnalytics from '@/modules/analytics-opt-in/handlers/handlerAnalytics.mixin';

const FOOTER_EVENTS = {
  footerAboutUs: 'LP2FooterAboutUs',
  footerCareers: 'LP2Footercareers',
  footerHowItWorks: 'LP2FooterHowItWorks',
  footerTeam: 'LP2FooterTeam',
  footerAdvertiseWithUs: 'LP2FooterAdvertiseWithUs',
  footerPrivacy: 'LP2FooterPrivacy',
  footerTerms: 'LP2FooterTerms',
  footerBugBounty: 'LP2FooterBugBounty',
  footerMobile: 'LP2FooterMewMobileApp',
  footerEnkrypt: 'LP2FooterEnkrypt',
  footerPortfolio: 'LP2FooterPortfolio',
  footerEthvm: 'LP2FooterEthvm',
  footerMewtopia: 'LP2FooterMewtopia',
  footerPressKit: 'LP2FooterPressKit',
  footerHelpCenter: 'LP2FooterHelpCenter',
  footerCustomerSupport: 'LP2FooterCustomerSupport',
  footerSecurityPolicy: 'LP2FooterSecurityPolicy',
  footerVerifyMessage: 'LP2FooterVerifyMessage',
  footerConvertUnits: 'LP2FooterConvertUnits',
  footerSendOfflineHelper: 'LP2FooterSendOfflineHelper',
  footerEthDonation: 'LP2FooterEthDonation',
  footerBtcDonation: 'LP2FooterBtcDonation',
  footerCoinGecko: 'LP2FooterCoinGecko',
  footerJoinMewCommunity: 'LP2JoinCommunity',
  closeMobileMenu: 'LP2CloseMobileMenu',
  otherWaysToCreate: 'LP2OtherWaysToCreate'
};

export default {
  name: 'TheDefaultFooter',
  components: {
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Github,
    Reddit,
    Medium,
    Telegram,
    DonateEth,
    DonateBtc
  },
  mixins: [handlerAnalytics],
  data() {
    return {
      year: new Date().getFullYear()
    };
  },
  computed: {
    ...mapState('popups', ['consentToTrack']),
    ...mapGetters('global', ['network']),
    /* packageVersion() {
      return VERSION;
    } */
  },
  methods: {
    trackCoinGecko() {
      this.$amplitude.track(FOOTER_EVENTS.footerCoinGecko, {
        network: this.network.type.name
      });
    },
    trackJoinMewCommunity(item) {
      this.$amplitude.track(FOOTER_EVENTS.footerJoinMewCommunity, {
        item: item,
        network: this.network.type.name
      });
    }
  }
};
</script>

<style lang="less" scoped>
@import '@/assets/styles/headerStyles/theme.less';
.footer {
  font-family: @font !important;
  overflow: hidden;
  padding-bottom: 104px;
  position: relative;

  .screen-tablet-portaint({
    padding-bottom: 74px;
  });

  .col-3,
  .col-6 {
    .screen-tablet-portaint({
        -webkit-box-flex: 0;
        -ms-flex: 0 0 100%;
        flex: 0 0 100%;
        max-width: 100%;
    });
  }

  &__links {
    margin-bottom: 42px;

    a {
      .footer-text;
      display: block;
      margin-bottom: 10px;
      text-decoration: none;
      .transition(@property: opacity, @time: 0.3s);

      &:hover {
        opacity: 0.5;
      }

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  &__info {
    .screen-tablet-portaint({
      margin-bottom: 42px;
    });

    p {
      color: @black;
      opacity: 0.7;
      font-size: 16px;
      font-style: normal;
      font-weight: 500;
      line-height: 22px; /* 137.5% */
      margin: 0 0 30px 0;
    }

    &-donation {
      .footer-text;
      display: block;
      margin-bottom: 10px;
      text-decoration: none;
      .transition(@property: opacity, @time: 0.3s);
      position: relative;
      padding-left: 28px;

      &:hover {
        opacity: 0.5;
      }

      svg {
        position: absolute;
        left: 0;
        top: 1px;
        border-radius: 20px;
      }
    }
  }

  &__copyright {
    .screen-tablet-portaint({
      position: absolute;
      width: 100%;
      left: 0;
      bottom: -170px;
    });

    p {
      color: @black;
      font-size: 16px;
      font-style: normal;
      font-weight: 500;
      line-height: normal;
      margin: 0 0 10px 0;
      opacity: 0.65;

      a {
        color: @black;

        &:hover {
          text-decoration: none;
        }
      }

      &:last-child {
        margin: 0;
      }
    }
  }

  &__social {
    .screen-tablet-portaint({
      // margin-bottom: 94px;
    });

    h5 {
      color: @black;
      font-size: 16px;
      font-style: normal;
      font-weight: 700;
      line-height: normal;
      margin: 0 0 12px 0;
    }

    &-links {
      display: flex;

      .screen-tablet-portaint({
        flex-wrap: wrap;
      });
    }

    &-link {
      display: block;
      margin-right: 12px;
      text-decoration: none;
      .transition(@property: opacity, @time: 0.3s);

      &:last-child {
        margin-right: 0;
      }

      &:hover {
        opacity: 0.5;
      }

      .screen-tablet-portaint({
        margin-bottom: 12px;
      });
    }
  }
}
</style>
