import xdc from '@/assets/images/networks/xdc.svg';

export default {
  name: 'TXDC',
  name_long: 'APOTHEM Network',
  homePage: 'https://xinfin.org/',
  blockExplorer: 'BlocksScan',
  blockExplorerTX: 'https://apothem.blocksscan.io/tx/[[txHash]]',
  blockExplorerAddr: 'https://apothem.blocksscan.io/addr/[[address]]',
  chainID: 51,
  tokens: import('@/_generated/tokens/tokens-etc.json').then(
    val => val.default
  ),
  contracts: import('@/_generated/contracts/contract-abi-etc.json').then(
    val => val.default
  ),
  icon: xdc,
  currencyName: 'TXDC',
  isTestNetwork: false,
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
