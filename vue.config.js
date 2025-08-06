const offlineConfig = require('./builds/offlineConfig');
const liveConfig = require('./builds/liveConfig');
const path = require('path');

let baseConfig = {};
if (process.env.BUILD === 'offline') {
  baseConfig = offlineConfig;
} else {
  baseConfig = liveConfig;
}

module.exports = {
  ...baseConfig,
  configureWebpack: {
    resolve: {
      alias: {
        '@ledgerhq/cryptoassets/data/eip712':
          '@ledgerhq/cryptoassets/lib/data/eip712',
        '@ledgerhq/cryptoassets/data/evm/index':
          '@ledgerhq/cryptoassets/lib/data/evm/index',
        '@ledgerhq/devices/ble/receiveAPDU':
          '@ledgerhq/devices/lib/ble/receiveAPDU',
        '@ledgerhq/devices/ble/sendAPDU': '@ledgerhq/devices/lib/ble/sendAPDU',
        '@ledgerhq/devices/hid-framing': '@ledgerhq/devices/lib/hid-framing',
        '@ledgerhq/domain-service/signers/index':
          '@ledgerhq/domain-service/lib/signers/index'
      }
    }
  },
  transpileDependencies: [
    'web-vitals',
    '@amplitude/plugin-web-vitals-browser',
    '@ensdomains/address-encoder',
    '@enkryptcom/name-resolution'
  ]
};
