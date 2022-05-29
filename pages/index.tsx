import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import {
  Box,
  Button,
  Heading,
  Link,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Spinner,
  Text,
  useBreakpointValue
} from '@chakra-ui/react'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import WalletLink from 'walletlink'

const infuraId = process.env.NEXT_PUBLIC_INFURA_ID
const cacheProvider = true
const mintPriceEther = 0.1

const Home: NextPage = () => {
  const [web3Modal, setWeb3Modal] = useState<Web3Modal>()
  const [instance, setInstance] = useState<ethers.providers.Web3Provider>()
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>()
  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner>()
  const [address, setAddress] = useState('')
  const [ens, setEns] = useState('')
  const [isMainnet, setIsMainnet] = useState(false)
  const [isTestnet, setIsTestnet] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [maxMint, setMaxMint] = useState(5)
  const [desiredQuantity, setDesiredQuantity] = useState(1)
  const [totalPrice, setTotalPrice] = useState('0.1')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const modal = new Web3Modal({
          cacheProvider: true,
          theme: 'dark',
          providerOptions: {
            walletconnect: {
              package: WalletConnectProvider,
              options: {
                infuraId,
                rpc: {
                  1: `https://mainnet.infura.io/v3/${infuraId}`,
                  4: `https://rinkeby.infura.io/v3/${infuraId}`
                }
              }
            },
            walletlink: {
              package: WalletLink,
              options: {
                appName: 'Cool X Clones',
                infuraId
              }
            }
          }
        })
        setWeb3Modal(modal)
      } catch (e) {
        console.log(e)
      }
    } else {
      console.log('Must access via browser')
    }
  }, [])

  const connect = useCallback(async () => {
    if (web3Modal) {
      const aInstance = await web3Modal.connect()
      const aProvider = new ethers.providers.Web3Provider(aInstance)
      const aSigner = aProvider.getSigner()
      const aAddress = await aSigner.getAddress()
      const network = await aProvider.getNetwork()
      const mainnet = Boolean(network.chainId === 1)
      const testnet = Boolean(network.chainId === 4)
      setInstance(aInstance)
      setProvider(aProvider)
      setSigner(aSigner)
      setAddress(aAddress)
      setIsMainnet(mainnet)
      setIsTestnet(testnet)
    }
  }, [web3Modal])

  useEffect(() => {
    const load = async () => {
      await connect()
      setIsConnecting(false)
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

  useEffect(() => {
    if (instance) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length) {
          setAddress(accounts[0])
        }
      }
      const handleChainChanged = (_hexChainId: string) => {
        window.location.reload()
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

  useEffect(() => {
    const checkEns = async () => {
      const ensName = await provider?.lookupAddress(address)
      if (ensName && ensName !== '') {
        setEns(ensName)
      }
    }
    if (isMainnet && provider && address !== '' && ens === '') {
      checkEns()
    }
  }, [isMainnet, address, ens, provider])

  useEffect(() => {
    const total = mintPriceEther * desiredQuantity
    setTotalPrice(total.toFixed(1))
  }, [desiredQuantity])

  const disconnect = () => {
    window.localStorage.removeItem('WEB3_CONNECT_CACHED_PROVIDER')
    window.location.reload()
  }

  const headerSrc = useBreakpointValue({
    base: '/header.png',
    md: '/header-lg.png'
  })
  const handleMint = () => {
    console.log('Mint')
  }

  return (
    <>
      <Head>
        <title>Cool X Clones</title>
        <meta name='description' content='Cool X Clones' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Box display={'flex'} minHeight={'100vh'} flexDirection={'column'}>
        <Box position='relative'>
          <Image
            src={headerSrc as string}
            alt='Cool X Clones'
            width={3000}
            height={headerSrc === '/header.png' ? 1000 : 500}
          />
        </Box>
        <Box
          flex={1}
          textAlign={'center'}
          mx={'auto'}
          maxWidth={'container.md'}>
          <Box position='relative' textAlign={'center'} m={8}>
            <Image src='/silhouette.png' alt='?' width={2700} height={836} />
          </Box>
          {isConnecting && <Spinner size='xl' color='white' />}
          {address === '' && !isConnecting && (
            <Button
              size='xl'
              bg={'brand.400'}
              onClick={() => setIsConnecting(true)}>
              Connect
            </Button>
          )}
          {address !== '' && (
            <>
              <Box p={8}>
                <Heading as='h3'>{ens !== '' ? ens : address}</Heading>
                <Link onClick={disconnect} color={'gray.500'}>
                  (Disconnect)
                </Link>
              </Box>
              <Box maxWidth='100px' mx={'auto'} textAlign={'center'} py={8}>
                <NumberInput
                  step={1}
                  value={desiredQuantity}
                  min={1}
                  max={maxMint}
                  onChange={(_, num) => setDesiredQuantity(num)}>
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </Box>
              <Box mb={8}>
                <Text>Total: {totalPrice} ether</Text>
              </Box>

              <Button onClick={handleMint} size={'xl'} bg={'brand.400'}>
                Mint
              </Button>
            </>
          )}
        </Box>
        <Box textAlign={'center'} mt={20}>
          <Image src='/footer.png' alt='' width={1380} height={500} />
        </Box>
      </Box>
    </>
  )
}

export default Home
