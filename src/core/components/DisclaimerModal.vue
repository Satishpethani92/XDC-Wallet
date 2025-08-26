<template>
  <v-dialog v-model="showDisclaimer" max-width="500">
    <div class="bgWalletBlock pa-7">
      <div class="full-width">
        <div class="mew-heading-2 mb-5">⚠️ Disclaimer</div>
        <div class="textLight--text mew-body mb-5">
          The XDC Network Web Wallet is a client-side tool — we never store your
          keys, passwords, or recovery phrases. You are fully responsible for
          your wallet and funds. Please double-check addresses and keep your
          private keys safe. Using this wallet is at your own risk.
        </div>
        <div class="d-flex align-center mt-5">
          <mew-button
            class="flex-grow-1"
            style="flex-basis: 0"
            btn-size="large"
            title="I understand"
            @click.native="acceptDisclaimer"
          />
        </div>
      </div>
    </div>
  </v-dialog>
</template>

<script>
export default {
  data() {
    return {
      showDisclaimer: false
    };
  },
  mounted() {
    const accepted = localStorage.getItem('disclaimerAccepted');
    if (!accepted) {
      this.showDisclaimer = true;
    }
  },
  methods: {
    acceptDisclaimer() {
      localStorage.setItem('disclaimerAccepted', 'true');
      this.showDisclaimer = false;
    }
  }
};
</script>
