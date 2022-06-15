import { ethers } from 'ethers'

export enum ActionType {
  StartConnecting,
  SetConnection,
  SetChain,
  SetAddress,
  SetENS,
  SetIsMainnet
}

export interface StartConnecting {
  type: ActionType.StartConnecting
}

export interface SetConnection {
  type: ActionType.SetConnection
  payload: {
    instance: ethers.providers.Web3Provider
    provider: ethers.providers.Web3Provider
    signer: ethers.providers.JsonRpcSigner
    isMainnet: boolean
    address: string
  }
}

export interface SetAddress {
  type: ActionType.SetAddress
  payload: string
}

export interface SetENS {
  type: ActionType.SetENS
  payload: string
}

export interface SetIsMainnet {
  type: ActionType.SetIsMainnet
  payload: boolean
}

export type AppActions =
  | StartConnecting
  | SetConnection
  | SetAddress
  | SetENS
  | SetIsMainnet
