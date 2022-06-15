import type { NextPage } from 'next'
import Head from 'next/head'
import NextImage from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Link,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Spinner,
  Text,
  useBreakpointValue,
  useToast
} from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import WalletLink from 'walletlink'
import { ccAbi, cxAbi, erc721Abi, vialsAbi } from '../artifacts/abis'

interface ErrorMessage {
  message: string
}

const infuraId = process.env.NEXT_PUBLIC_INFURA_ID
const cacheProvider = true

const Mint: NextPage = () => {
  const toast = useToast()
  const [web3Modal, setWeb3Modal] = useState<Web3Modal>()
  const [instance, setInstance] = useState<ethers.providers.Web3Provider>()
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>()
  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner>()
  const [vialsContract, setVialsContract] = useState<ethers.Contract>()
  const [address, setAddress] = useState('')
  const [displayAddress, setDisplayAddress] = useState('')
  const [ens, setEns] = useState('')
  const [isMainnet, setIsMainnet] = useState(false)
  const [isTestnet, setIsTestnet] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [maxMint, setMaxMint] = useState(5)
  const [desiredQuantity, setDesiredQuantity] = useState(1)
  const [mintPrice, setMintPrice] = useState('0.0')
  const [totalPrice, setTotalPrice] = useState('0.1')
  const [totalItems, setTotalItems] = useState(0)
  const [towardsPrize, setTowardsPrize] = useState('0.05')
  const [amountMinted, setAmountMinted] = useState(0)
  const [blockExplorer, setBlockExplorer] = useState('')
  const [txHash, setTxHash] = useState('')
  const [isMinting, setIsMinting] = useState(false)
  const [errorDisplay, setErrorDisplay] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (errorMessage !== '') {
      toast({
        title: "Something's not right.",
        description: errorMessage,
        status: 'error',
        duration: 4000,
        isClosable: true
      })
      setErrorMessage('')
    }
  }, [errorMessage, toast])

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
    if (provider && (isTestnet || isMainnet)) {
      const vialsAddress = isMainnet
        ? ''
        : '0x7981cba35d6e0deeaecad4e5c0ad3685e4ecf33d'
      if (vialsAddress !== '') {
        const vials = new ethers.Contract(vialsAddress, vialsAbi, provider)
        setVialsContract(vials)
      }
    }
  }, [isTestnet, isMainnet, provider])

  const vialsMinted = useCallback(async () => {
    if (vialsContract) {
      const price = await vialsContract.price()
      setMintPrice(ethers.utils.formatUnits(price, 'ether'))
      const maxSupply = await vialsContract.maxSupply()
      setTotalItems(maxSupply)
      const paused = await vialsContract.paused()
      setIsPaused(paused)
    }
  }, [vialsContract])

  useEffect(() => {
    const getMinted = async () => {
      const supply = await vialsContract?.totalSupply()
      if (supply > 0 && supply !== amountMinted) {
        setAmountMinted(parseInt(supply))
      }
    }

    if (vialsContract && amountMinted) {
      const interval = setInterval(() => {
        getMinted()
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [vialsContract, amountMinted])

  useEffect(() => {
    if (vialsContract) {
      vialsMinted()
    }
  }, [vialsContract, vialsMinted])

  useEffect(() => {
    const total = parseFloat(mintPrice) * desiredQuantity
    const prize = total / 2
    setTotalPrice(total.toFixed(1))
    setTowardsPrize(prize.toFixed(2))
  }, [desiredQuantity, mintPrice])

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

  const checkCXCC = useCallback(() => {
    const cx = checkCX()
    const cc = checkCC()
    Promise.all([cx, cc]).then((response) => {
      if (response[0] || response[1]) {
        setMaxMint(10)
      }
    })
  }, [checkCX, checkCC])

  const checkTest = useCallback(async () => {
    const testnetContract = new ethers.Contract(
      '0xdc77e7bd3bfbc8e3b7f816717bc0af6515960b91',
      erc721Abi,
      provider
    )
    const balance = await testnetContract.balanceOf(`${address}`)
    if (balance > 0) {
      setMaxMint(10)
    }
  }, [address, provider])

  useEffect(() => {
    if (address !== '' && provider) {
      if (isMainnet) {
        checkCXCC()
        setBlockExplorer('https://etherscan.io/tx/')
      } else if (isTestnet) {
        checkTest()
        setBlockExplorer('https://rinkeby.etherscan.io/tx/')
      }
    }
  }, [address, provider, isMainnet, isTestnet, checkCXCC, checkTest])

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

  const getErrorMessage = (error: ErrorMessage) => {
    return String(error.message)
  }

  const handleMint = async () => {
    setIsMinting(true)
    try {
      const vialsAddress = isMainnet
        ? ''
        : '0x7981cba35d6e0deeaecad4e5c0ad3685e4ecf33d'
      const vials = new ethers.Contract(vialsAddress, vialsAbi, signer)
      // ethers.utils.formatUnits(gas, 'wei')
      const gas = await provider?.getGasPrice()
      if (gas) {
        const gasPrice = gas?.toNumber()
        console.log(gasPrice)

        const gasOverride = {
          gasLimit: gasPrice
        }
        const tx = await vials.mint(address, desiredQuantity, gasOverride)
        setTxHash(tx.hash)
        await tx.wait()
      }
      setIsMinting(false)
    } catch (e) {
      console.log(e)
      setErrorDisplay(JSON.stringify(e, null, 2))
      const msg = getErrorMessage(e as ErrorMessage)
      setErrorMessage(msg)
      setIsMinting(false)
    }
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
          <NextImage
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
          {isTestnet && (
            <Alert status='warning'>
              <AlertIcon />
              You are connected to the Rinkeby Testnet
            </Alert>
          )}
          <>
            <Box position='relative' textAlign={'center'} m={8}>
              <NextImage
                src='/silhouette.png'
                alt='?'
                width={2700}
                height={836}
              />
            </Box>
            {isConnecting && <Spinner size='xl' color='white' />}
            <Box flex={3}>
              <Text>
                {amountMinted} / {totalItems} minted
              </Text>
              <Text>{mintPrice} eth per mint</Text>
              <Text>{maxMint} per transaction</Text>
            </Box>
            {address === '' && !isConnecting && (
              <Button
                size='xl'
                bg={'brand.400'}
                onClick={() => setIsConnecting(true)}
                my={10}>
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

                <NextImage src='/vial.png' alt='' width={128} height={128} />

                <Box mb={8}>
                  <Text fontSize='lg'> Total: {totalPrice} eth </Text>
                  <Text color='gray.500'>({towardsPrize} to prize pool)</Text>
                </Box>

                <Button
                  onClick={handleMint}
                  size={'xl'}
                  bg={'brand.400'}
                  disabled={isPaused}
                  my={10}>
                  Mint
                </Button>

                {txHash !== '' && (
                  <Box p={4}>
                    <Link href={`${blockExplorer}${txHash}`} isExternal={true}>
                      View transaction <ExternalLinkIcon mx='2px' />
                    </Link>
                  </Box>
                )}
              </>
            )}
            <Box>
              <Text>Cool Cat & Clone X NFTs raffled every 1,000 minted.</Text>
              <Text>
                Vials hold derivative artwork with combined traits (🐱x🧬).
              </Text>
            </Box>
          </>
        </Box>
        <Box
          textAlign={'center'}
          mt={10}
          maxWidth={'container.xl'}
          mx={'auto'}
          lineHeight={0}>
          <NextImage src='/footer.png' alt='' width={1920} height={696} />
        </Box>
      </Box>
    </>
  )
}

export default Mint
