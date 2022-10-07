import { ethers } from 'ethers'

export interface AppState {
  instance?: ethers.providers.Web3Provider
  provider?: ethers.providers.Web3Provider
  signer?: ethers.providers.JsonRpcSigner
  isMainnet: boolean
  isTestnet: boolean
  address: string
  ens: string
  isConnecting: boolean
}

export const initialAppState: AppState = {
  isMainnet: false,
  isTestnet: false,
  address: '',
  ens: '',
  isConnecting: false
}
