import xdc from '@/assets/images/networks/xdc.svg';

export default {
  name: 'TXDC',
  name_long: 'APOTHEM Network',
  homePage: 'https://xinfin.org/',
  blockExplorer: 'BlocksScan',
  blockExplorerTX: 'https://explorer.apothem.network/tx/[[txHash]]',
  blockExplorerAddr: 'https://explorer.apothem.network/address/[[address]]',
  chainID: 51,
  tokens: import('@/_generated/tokens/tokens-etc.json').then(
    val => val.default
  ),
  contracts: import('@/_generated/contracts/contract-abi-etc.json').then(
    val => val.default
  ),
  icon: xdc,
  currencyName: 'TXDC',
  isTestNetwork: true,
  isEthVMSupported: {
    supported: false,
    url: null,
    blockExplorerTX: '',
    blockExplorerAddr: '',
    websocket: null
  },
  coingeckoID: null,
  gasPriceMultiplier: 1,
  balanceApi: ''
};
