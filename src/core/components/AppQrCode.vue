<template>
  <canvas ref="qrCodeCanvas"></canvas>
</template>

<script>
import QrCodeWithLogo from 'qrcode-with-logos';
import xdcIcon from '../../../public/icons/icon192.png';
const mewIcon = xdcIcon;

export default {
  props: {
    width: {
      type: Number,
      default: 150
    },
    data: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      qrCode: null
    };
  },
  watch: {
    data(val) {
      if (val && val !== '') {
        this.generateQRCode();
      }
    }
  },
  mounted() {
    this.generateQRCode();
  },
  beforeDestroy() {
    this.qrCode = null;
  },
  methods: {
    generateQRCode() {
      this.qrCode = new QrCodeWithLogo({
        canvas: this.$refs.qrCodeCanvas,
        content: this.data,
        width: this.width,
        logo: {
          borderRadius: 100,
          logoSize: 0.23,
          borderSize: 0,
          src: mewIcon
        }
      });
      this.qrCode.toCanvas();
    }
  }
};
</script>
