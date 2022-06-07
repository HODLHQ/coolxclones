import type { NextPage } from 'next'
import Head from 'next/head'
import NextImage from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Heading,
  Icon,
  Link,
  Spinner,
  Text,
  useBreakpointValue,
  useToast,
  Image
} from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { FaTwitter } from 'react-icons/fa'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import WalletLink from 'walletlink'
import { honoraryAbi } from '../artifacts/honorary'

interface ErrorMessage {
  message: string
}

const infuraId = process.env.NEXT_PUBLIC_INFURA_ID
const cacheProvider = true

const Home: NextPage = () => {
  const toast = useToast()
  const [web3Modal, setWeb3Modal] = useState<Web3Modal>()
  const [instance, setInstance] = useState<ethers.providers.Web3Provider>()
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>()
  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner>()
  const [address, setAddress] = useState('')
  const [displayAddress, setDisplayAddress] = useState('')
  const [ens, setEns] = useState('')
  const [isMainnet, setIsMainnet] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [isMinting, setIsMinting] = useState(false)
  const [errorDisplay, setErrorDisplay] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isKing, setIsKing] = useState(false)

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
      setInstance(aInstance)
      setProvider(aProvider)
      setSigner(aSigner)
      setAddress(aAddress)
      setIsMainnet(mainnet)
    }
  }, [web3Modal])

  useEffect(() => {
    const isHolder = async () => {
      const honorary = new ethers.Contract(
        '0x9c56c03a64ec4d81f549c900fb235b31b1390fe2',
        honoraryAbi,
        provider
      )

      const balance = await honorary.balanceOf(address, 1)
      if (balance > 0) {
        setIsKing(true)
      }
    }

    if (provider && isMainnet && address !== '') {
      isHolder()
    }
  }, [provider, isMainnet, address])

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
    if (address !== '') {
      setDisplayAddress(`${address.substring(0, 6)}...${address.substring(38)}`)
    }
  }, [address])

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

  const handleSwitchMainnet = () => {
    const attemptSwitch = async () => {
      const wallet = window?.ethereum
      if (signer && wallet) {
        try {
          await wallet.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x1' }]
          })
          setIsMainnet(true)
        } catch (_e) {
          setIsMainnet(false)
        }
      }
      return false
    }
    attemptSwitch()
  }

  const handleMint = async () => {
    setIsMinting(true)
    try {
      const honorary = new ethers.Contract(
        '0x9c56c03a64ec4d81f549c900fb235b31b1390fe2',
        honoraryAbi,
        signer
      )
      const tx = await honorary.freeMint(address)
      setTxHash(tx.hash)
      await tx.wait()
      setIsMinting(false)
      setIsKing(true)
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
        <title>King of Cool x Clones</title>
        <meta
          name='description'
          content='Cool x Clones presents the King of Cool x Clone Free Mint'
        />
        <link rel='icon' href='/favicon.ico' />
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:site' content='@coolxclones' />
        <meta name='twitter:creator' content='@coolxclones' />
        <meta
          name='twitter:title'
          content='I am the King of Cool x Clones 👑'
        />
        <meta
          name='twitter:description'
          content='Mint yours free for a little bit of luck and follow @coolXclones for the latest alpha! https://coolxclones.xyz'
        />
        <meta
          name='twitter:image'
          content='https://www.coolxclones.xyz/kingofcoolxclones.jpg'
        />
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
          <>
            <Box mt={8} p={2}>
              <Text>
                If you do not own a{' '}
                <Link
                  href={'https://twitter.com/coolXclones'}
                  isExternal={true}>
                  @coolxclones
                </Link>{' '}
                you can right click save the King of Cool x Clones... or if you
                are a hexagon maxi you can mint! KCXC will give a boost to your
                web3 luck 🍀 and who knows what other surprises he may bring!
              </Text>
              <Image
                src='/kingofcoolxclones.jpg'
                alt=''
                width={256}
                height={256}
                borderRadius={'lg'}
                mx={'auto'}
                my={8}
              />
              <Heading as='h3'>👑 King of Cool x Clones 👑</Heading>
            </Box>
            {address !== '' && !isConnecting && !isMainnet && (
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
            {isConnecting && <Spinner size='xl' color='white' />}
            {address === '' && !isConnecting && (
              <Box my={8}>
                <Button
                  size='xl'
                  bg={'brand.100'}
                  onClick={() => setIsConnecting(true)}
                  _hover={{ color: 'brand.100', bg: 'white' }}>
                  Connect
                </Button>
              </Box>
            )}
            {displayAddress !== '' && (
              <>
                <Box p={8}>
                  <Heading as='h3'>{ens !== '' ? ens : displayAddress}</Heading>
                  <Link onClick={disconnect} color={'gray.500'}>
                    (Disconnect)
                  </Link>
                </Box>

                <Box p={2}>
                  <Text>1 per wallet</Text>
                </Box>

                <Box p={8}>
                  {!isMinting &&
                    (!isKing ? (
                      <Button
                        onClick={handleMint}
                        size={'xl'}
                        bg={'brand.100'}
                        my={10}
                        _hover={{ color: 'brand.100', bg: 'white' }}>
                        Mint
                      </Button>
                    ) : (
                      <Link
                        href={
                          'https://twitter.com/intent/tweet?url=https://coolxclones.xyz&text=I%20am%20the%20King%20of%20Cool%20x%20Clones%20%F0%9F%91%91%0A%0AMint%20yours%20free%20for%20a%20little%20bit%20of%20luck%20and%20follow%20%40coolXclones%20for%20the%20latest%20alpha%21%0A%0A'
                        }>
                        <Icon as={FaTwitter} /> I am the King of Cool x Clones
                        👑
                      </Link>
                    ))}
                </Box>

                {txHash !== '' && (
                  <Box p={4}>
                    <Link
                      href={`https://etherscan.io/tx/${txHash}`}
                      isExternal={true}>
                      View transaction <ExternalLinkIcon mx='2px' />
                    </Link>
                  </Box>
                )}
              </>
            )}
            <Text>
              Follow us on twitter (
              <Link href={'https://twitter.com/coolXclones'} isExternal={true}>
                @coolXclones
              </Link>
              ) to keep up with the Cool x Clone alpha.
            </Text>
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

export default Home
