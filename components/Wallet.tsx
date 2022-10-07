import {
  setAddress,
  setIsMainnet,
  setENS,
  setConnection,
  startConnecting,
  useApp
} from './Context'
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Heading,
  Link,
  Spinner
} from '@chakra-ui/react'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import WalletLink from 'walletlink'
import * as React from 'react'

const infuraId = process.env.NEXT_PUBLIC_INFURA_ID
const cacheProvider = true

const Wallet = () => {
  const { state, dispatch } = useApp()
  const {
    instance,
    provider,
    signer,
    address,
    ens,
    isConnecting,
    isMainnet,
    isTestnet
  } = state

  const [web3Modal, setWeb3Modal] = React.useState<Web3Modal | null>(null)
  const [displayAddress, setDisplayAddress] = React.useState('')

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const web3Modal = new Web3Modal({
        cacheProvider: true,
        theme: 'dark',
        providerOptions: {
          walletconnect: {
            package: WalletConnectProvider,
            options: {
              infuraId,
              rpc: {
                1: `https://mainnet.infura.io/v3/${infuraId}`
              }
            }
          },
          walletlink: {
            package: WalletLink,
            options: {
              appName: 'Cool x Clones',
              infuraId
            }
          }
        }
      })
      setWeb3Modal(web3Modal)
    }
  }, [])

  const connect = React.useCallback(async () => {
    const instance = await web3Modal?.connect()
    const provider = new ethers.providers.Web3Provider(instance)
    const signer = provider.getSigner()
    const address = await signer.getAddress()
    const network = await provider.getNetwork()
    const isMainnet = Boolean(network.chainId === 1)
    const isTestnet = Boolean(network.chainId === 5)
    dispatch(
      setConnection({
        instance,
        provider,
        signer,
        isMainnet,
        isTestnet,
        address
      })
    )
  }, [web3Modal, dispatch])

  React.useEffect(() => {
    if (instance) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length) {
          setAddress(accounts[0])
        }
      }
      const handleChainChanged = (_hexChainId: string) => {
        console.log('handleChainChanged()')
        // window.location.reload()
      }
      const handleConenct = (info: { chainId: number }) => {
        console.log(info)
      }
      const handleDisconnect = (_error: { code: number; message: string }) => {
        window.localStorage.removeItem('WEB3_CONNECT_CACHED_PROVIDER')
      }
      instance.on('accountsChanged', handleAccountsChanged)
      instance.on('chainChanged', handleChainChanged)
      instance.on('connect', handleConenct)
      instance.on('disconnect', handleDisconnect)
      return () => {
        if (instance.removeListener) {
          instance.removeListener('accountsChanged', handleAccountsChanged)
          instance.removeListener('chainChanged', handleChainChanged)
          instance.removeListener('connect', handleConenct)
          instance.removeListener('disconnect', handleDisconnect)
        }
      }
    }
  }, [instance])

  React.useEffect(() => {
    const load = async () => {
      await connect()
    }
    if (web3Modal) {
      if (isConnecting) {
        load()
      } else if (address === '' && cacheProvider) {
        if (localStorage.getItem('WEB3_CONNECT_CACHED_PROVIDER')) {
          load()
        }
      }
    }
  }, [web3Modal, address, isConnecting, connect])

  React.useEffect(() => {
    const checkENS = async () => {
      const ensName = await provider?.lookupAddress(address)
      if (ensName && ensName !== '') {
        dispatch(setENS(ensName))
      }
    }
    if (isMainnet && provider && address !== '' && ens === '') {
      checkENS()
    }
  }, [isMainnet, address, ens, provider, dispatch])

  React.useEffect(() => {
    if (address !== '') {
      setDisplayAddress(`${address.substring(0, 6)}...${address.substring(38)}`)
    }
  }, [address])

  const handleSwitchMainnet = () => {
    const attemptSwitch = async () => {
      const wallet = window?.ethereum
      if (signer && wallet) {
        try {
          await wallet.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x1' }]
          })
          dispatch(setIsMainnet(true))
        } catch (_e) {
          dispatch(setIsMainnet(false))
        }
      }
      return false
    }
    attemptSwitch()
  }

  const disconnect = () => {
    window.localStorage.removeItem('WEB3_CONNECT_CACHED_PROVIDER')
    window.location.reload()
  }

  return (
    <Box my={8}>
      <>
        {isConnecting && <Spinner size='xl' color='white' />}

        {address !== '' && !isConnecting && !isMainnet && !isTestnet && (
          <Box my={8} color={'brand.400'}>
            <Alert status='error' backgroundColor={'white'}>
              <AlertIcon />
              Please connect to:
              <Link onClick={() => handleSwitchMainnet()} sx={{ pl: 2 }}>
                Ethereum Mainnet
              </Link>
              .
            </Alert>
          </Box>
        )}

        {address !== '' && !isConnecting && isTestnet && (
          <Box my={8} color={'brand.700'}>
            <Alert status='warning' backgroundColor={'white'}>
              <AlertIcon />
              You are connected to the Goerli Testnet
            </Alert>
          </Box>
        )}

        {address === '' && !isConnecting && (
          <Box my={8}>
            <Button
              size='xl'
              bg={'brand.100'}
              onClick={() => dispatch(startConnecting())}
              _hover={{ color: 'brand.100', bg: 'white' }}>
              Connect
            </Button>
          </Box>
        )}

        {displayAddress !== '' && (
          <Box p={8}>
            <Heading as='h3'>{ens !== '' ? ens : displayAddress}</Heading>
            <Link onClick={disconnect} color={'brand.700'}>
              (Disconnect)
            </Link>
          </Box>
        )}
      </>
    </Box>
  )
}

export default Wallet
