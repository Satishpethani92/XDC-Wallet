import gamaImg from '../assets/images/networks/gama.jpg';
import lbtImg from '../assets/images/networks/lbt.jpg';
import dopuImg from '../assets/images/networks/dopu.webp';
import xswapImg from '../assets/images/networks/xswap.webp';
import zonImg from '../assets/images/networks/zon.webp';
import pliImg from '../assets/images/networks/pli.webp';
import cgoImg from '../assets/images/networks/cgo.webp';
import srxImg from '../assets/images/networks/srx.webp';

export default [
  {
    symbol: 'DOPU',
    contract: '0x8b20C72f1B138A41D2193dd056E117dce915ba8b',
    decimals: 18,
    name: 'Dog With Purpose',
    coingeckoId: 'dog-with-purpose',
    disableSwap: true,
    image: dopuImg
  },
  {
    symbol: 'GAMA',
    contract: '0x3a170c7c987f55c84f28733bfa27962d8cdd5d3b',
    decimals: 18,
    name: 'Gama Token',
    coingeckoId: 'gama-token',
    disableSwap: true,
    image: gamaImg
  },
  {
    symbol: 'LBT',
    contract: '0x05940B2dF33D6371201e7Ae099CeD4C363855dFE',
    decimals: 18,
    name: 'Law Blocks',
    coingeckoId: 'law-blocks',
    disableSwap: true,
    image: lbtImg
  },
  {
    symbol: 'SRX',
    contract: '0x5d5f074837f5d4618b3916ba74de1bf9662a3fed',
    decimals: 18,
    name: 'StorX',
    coingeckoId: 'storx',
    disableSwap: true,
    image: srxImg
  },
  {
    symbol: 'CGO',
    contract: '0x8f9920283470f52128bf11b0c14e798be704fd15',
    decimals: 18,
    name: 'Comtech Gold',
    coingeckoId: 'comtech-gold',
    disableSwap: true,
    image: cgoImg
  },
  {
    symbol: 'XSP',
    contract: '0x36726235dadbdb4658d33e62a249dca7c4b2bc68',
    decimals: 18,
    name: 'XSwap Protocol',
    coingeckoId: 'xswap-protocol',
    disableSwap: true,
    image: xswapImg
  },
  {
    symbol: 'ZON',
    contract: '0x25d29fa7cf5cd5a11102b793f1a0149546e026e4',
    decimals: 18,
    name: 'Zon Token',
    coingeckoId: 'zon-token',
    disableSwap: true,
    image: zonImg
  },
  {
    symbol: 'PLI',
    contract: '0xff7412ea7c8445c46a8254dfb557ac1e48094391',
    decimals: 18,
    name: 'Plugin',
    coingeckoId: 'plugin',
    disableSwap: true,
    image: pliImg
  }
];
