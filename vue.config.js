const offlineConfig = require('./builds/offlineConfig');
const liveConfig = require('./builds/liveConfig');

let baseConfig = {};
if (process.env.BUILD === 'offline') {
  baseConfig = offlineConfig;
} else {
  baseConfig = liveConfig;
}

// Merge your base configuration with the transpileDependencies option
const finalConfig = {
  ...baseConfig, // This includes all settings from your live/offline config
  transpileDependencies: [
    'web-vitals',
    '@amplitude/plugin-web-vitals-browser',
    '@ensdomains/address-encoder',
    '@enkryptcom/name-resolution',
    '@ledgerhq/hw-app-eth',
    '@ledgerhq/hw-transport-web-ble',
    '@ledgerhq/hw-transport-webusb',
    '@ledgerhq/live-common'
  ]
};

module.exports = finalConfig;
