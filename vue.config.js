const offlineConfig = require('./builds/offlineConfig');
const liveConfig = require('./builds/liveConfig');
const path = require('path');

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
    // Previous entries
    'web-vitals',
    '@amplitude/plugin-web-vitals-browser',

    // Add the new packages here
    '@ensdomains/address-encoder',
    '@enkryptcom/name-resolution',
    '@formatjs',
  ],

  configureWebpack: {
    resolve: {
      alias: {
        // This forces Webpack to use the standard JS file, bypassing the broken .mjs file
        'libsodium-wrappers': path.resolve(__dirname, 'node_modules/libsodium-wrappers/dist/modules/libsodium-wrappers.js')
      }
    }
  }
};

module.exports = finalConfig;
