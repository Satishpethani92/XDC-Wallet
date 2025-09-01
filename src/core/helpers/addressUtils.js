import web3 from 'web3';
import store from '@/core/store';
import { ROOTSTOCK } from '@/utils/networks/types';
import {
  toChecksumAddress as toChecksumAddr,
  isValidChecksumAddress
} from 'ethereumjs-util';

const normalizeXdcAddress = address => {
  if (typeof address === 'string' && address.toLowerCase().startsWith('xdc')) {
    return '0x' + address.slice(3);
  }
  return address;
};

const isAddress = address => {
  const chainId = store.getters['global/network'].type.chainID;
  address = normalizeXdcAddress(address);
  if (chainId === ROOTSTOCK.chainID) {
    // check if it has the basic requirements of an address
    if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
      return false;
      // If it's ALL lowercase or ALL upppercase
    } else if (
      /^(0x|0X)?[0-9a-f]{40}$/.test(address) ||
      /^(0x|0X)?[0-9A-F]{40}$/.test(address)
    ) {
      return true;
      // Otherwise check each case
    }
    return isValidChecksumAddress(address, chainId);
  }

  return (
    address && web3.utils.isHexStrict(address) && web3.utils.isAddress(address)
  );
};
const toChecksumAddress = address => {
  const chainId = store.getters['global/network'].type.chainID;
  const normalized = normalizeXdcAddress(address);

  // Use EIP-1191 Address Checksum if its Rootstock network
  if (chainId === ROOTSTOCK.chainID) {
    return toChecksumAddr(normalized, chainId);
  }

  const checksummed = web3.utils.toChecksumAddress(normalized);

  return address.toLowerCase().startsWith('xdc')
    ? 'xdc' + checksummed.slice(2)
    : checksummed;
};
export { isAddress, toChecksumAddress };
