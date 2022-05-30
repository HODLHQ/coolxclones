import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Spinner,
  Text,
  useBreakpointValue,
  Center
} from '@chakra-ui/react'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import WalletLink from 'walletlink'
import { ccAbi, cxAbi, erc721Abi } from '../artifacts/abis'

const infuraId = process.env.NEXT_PUBLIC_INFURA_ID
const cacheProvider = true
const mintPriceEther = 0.1

const Home: NextPage = () => {
  const [web3Modal, setWeb3Modal] = useState<Web3Modal>()
  const [instance, setInstance] = useState<ethers.providers.Web3Provider>()
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>()
  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner>()
  const [address, setAddress] = useState('')
  const [displayAddress, setDisplayAddress] = useState('')
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

  useEffect(() => {
    if (address !== '') {
      setDisplayAddress(`${address.substring(0, 6)}...${address.substring(38)}`)
    }
  }, [address])

  const checkCX = useCallback(async () => {
    try {
      const cx = new ethers.Contract(
        '0x49cf6f5d44e70224e2e23fdcdd2c053f30ada28b',
        cxAbi,
        provider
      )
      const balance = await cx.balanceOf(`${address}`)
      return Boolean(balance > 0)
    } catch (_e) {
      return false
    }
  }, [address, provider])

  const checkCC = useCallback(async () => {
    try {
      const cc = new ethers.Contract(
        '0x1a92f7381b9f03921564a437210bb9396471050c',
        ccAbi,
        provider
      )
      const balance = await cc.balanceOf(`${address}`)
      return Boolean(balance > 0)
    } catch (_e) {
      return false
    }
  }, [address, provider])

  useEffect(() => {
    const checkCXCC = () => {
      const cx = checkCX()
      const cc = checkCC()
      Promise.all([cx, cc]).then((response) => {
        if (response[0] || response[1]) {
          setMaxMint(10)
        }
      })
    }

    if (address !== '' && isMainnet && provider) {
      checkCXCC()
    }
  }, [address, provider, isMainnet, checkCX, checkCC])

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

      <Box
        display={'flex'}
        minHeight={'100vh'}
        flexDirection={'column'}
        justifyContent={'space-between'}>
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
          {displayAddress !== '' && (
            <>
              <Box p={8}>
                <Heading as='h3'>{ens !== '' ? ens : displayAddress}</Heading>
                <Link onClick={disconnect} color={'gray.500'}>
                  (Disconnect)
                </Link>
              </Box>
              {maxMint === 10 && <Text>🐱x🧬 (Bonus Max Mint)</Text>}
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
        <Flex
          maxWidth={'container.lg'}
          mx={'auto'}
          alignContent={'center'}
          py={10}>
          <Box flex={3}>
            <Text>Supply: 10,000</Text>
            <Text>Mint: 0.1 eth</Text>
          </Box>
          <Box flex={1}></Box>
          <Box flex={3}>
            <Text>Cool Cat & Clone X NFTs raffled every 1,000 vials sold.</Text>
            <Text>
              Vials hold derivative artwork with combined traits (🐱x🧬).
            </Text>
          </Box>
        </Flex>
        <Box
          textAlign={'center'}
          mt={10}
          maxWidth={'container.xl'}
          mx={'auto'}
          lineHeight={0}>
          <Image src='/footer.png' alt='' width={1920} height={696} />
        </Box>
      </Box>
    </>
  )
}

export default Home
