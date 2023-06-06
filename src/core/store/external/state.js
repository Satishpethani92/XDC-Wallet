const state = {
  localStore: false,
  path: '',
  currencyRate: {},
  coinGeckoTokens: new Map(), //map of {coingeckoId: coingeckotokeninfo}
  networkTokens: new Map(), //map of {contract: token}
  eip6963Providers: []
};

export default state;
