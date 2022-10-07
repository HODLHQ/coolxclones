import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'
import NextImage from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import {
  Box,
  Button,
  Link,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Spinner,
  Text,
  useToast
} from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import WalletLink from 'walletlink'
import { vialsAbi } from '../../artifacts/abis'

interface ErrorMessage {
  message: string
}

const infuraId = process.env.NEXT_PUBLIC_INFURA_ID
const cacheProvider = true

const goerliVialsContractAddress = '0xd8be55f2e3836c7ffab21f342a3bea7228d02de8'

const Mint: NextPage = () => {
  const router = useRouter()
  const { id } = router.query
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
  const [maxMint, setMaxMint] = useState(10)
  const [desiredQuantity, setDesiredQuantity] = useState(1)
  const [mintPrice, setMintPrice] = useState('0.03')
  const [totalPrice, setTotalPrice] = useState('0.03')
  const [totalItems, setTotalItems] = useState(0)
  const [towardsPrize, setTowardsPrize] = useState('0.015')
  const [amountMinted, setAmountMinted] = useState(0)
  const [blockExplorer, setBlockExplorer] = useState('')
  const [txHash, setTxHash] = useState('')
  const [isMinting, setIsMinting] = useState(false)
  const [errorDisplay, setErrorDisplay] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isPaused, setIsPaused] = useState(false)

  // display toast error for 4 secs is exists
  useEffect(() => {
    if (errorMessage !== '') {
      const msg = errorMessage.includes('Ledger device')
        ? 'Is Ledger Locked?'
        : errorMessage.includes(
            'Ledger device: Condition of use not satisfied (denied by the user?)'
          )
        ? 'Rejected on Ledger Device.'
        : errorMessage.includes('user rejected transaction')
        ? 'Transaction Rejected'
        : errorMessage
      toast({
        title: "Something's not right.",
        description: msg,
        status: 'error',
        duration: 4000,
        isClosable: true
      })
      setErrorMessage('')
    }
  }, [errorMessage, toast])

  // setWeb3Modal
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
                  5: `https://goerli.infura.io/v3/${infuraId}`
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

  // sets: Instance, Provider, Signer, Address, IsMainnet, IsTestnet
  const connect = useCallback(async () => {
    if (web3Modal) {
      const aInstance = await web3Modal.connect()
      const aProvider = new ethers.providers.Web3Provider(aInstance)
      const aSigner = aProvider.getSigner()
      const aAddress = await aSigner.getAddress()
      const network = await aProvider.getNetwork()
      const mainnet = Boolean(network.chainId === 1)
      const testnet = Boolean(network.chainId === 5)
      setInstance(aInstance)
      setProvider(aProvider)
      setSigner(aSigner)
      setAddress(aAddress)
      setIsMainnet(mainnet)
      setIsTestnet(testnet)
      if (testnet) {
        setBlockExplorer('https://goerli.etherscan.io/tx/')
      }
      if (mainnet) {
        setBlockExplorer('https://etherscan.io/tx/')
      }
    }
  }, [web3Modal])

  // call connect()
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

  // check ENS
  useEffect(() => {
    const checkEns = async () => {
      const ensName = await provider?.lookupAddress(address)
      if (ensName && ensName !== '') {
        setEns(ensName)
      }
    }
    if (isMainnet && provider && address !== '' && ens === '') {
      console.log('hi')
      checkEns()
    }
  }, [isMainnet, address, ens, provider])

  // setVialsContract
  useEffect(() => {
    if (provider && (isTestnet || isMainnet)) {
      const vialsAddress = isMainnet ? '' : goerliVialsContractAddress
      if (vialsAddress !== '') {
        const vials = new ethers.Contract(vialsAddress, vialsAbi, provider)
        setVialsContract(vials)
      }
    }
  }, [isTestnet, isMainnet, provider])

  // sets: Price, MaxSupply, AmountMinted, IsPaused
  useEffect(() => {
    const setup = async () => {
      const price = await vialsContract?.price()
      setMintPrice(ethers.utils.formatUnits(price, 'ether'))
      const maxSupply = await vialsContract?.getVialSupply(id)
      setTotalItems(maxSupply.toNumber())
      const minted = await vialsContract?.vialsMinted(id)
      setAmountMinted(minted.toNumber())
      const paused = await vialsContract?.paused()
      setIsPaused(paused)
    }
    if (vialsContract) {
      setup()
    }
  }, [vialsContract, id])

  const liveUpdate = useCallback(() => {
    ;(async () => {
      const minted = await vialsContract?.vialsMinted(id)
      setAmountMinted(minted.toNumber())
      const paused = await vialsContract?.paused()
      setIsPaused(paused)
    })()
  }, [vialsContract, id])

  // sets TotalPrice, TowardsPrize
  useEffect(() => {
    const total = parseFloat(mintPrice) * desiredQuantity
    const prize = total / 2
    setTotalPrice(total.toFixed(2))
    setTowardsPrize(prize.toFixed(3))
  }, [desiredQuantity, mintPrice])

  // setDisplayName
  useEffect(() => {
    if (address !== '') {
      setDisplayAddress(`${address.substring(0, 6)}...${address.substring(38)}`)
    }
  }, [address])

  // handle: AccountsChanged, ChainChanged, Connect, Disconnect
  useEffect(() => {
    if (instance) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length) {
          setAddress(accounts[0])
        }
      }
      const handleChainChanged = (_hexChainId: string) => {
        // window.location.reload()
      }
      const handleDisconnect = (_error: { code: number; message: string }) => {
        window.localStorage.removeItem('WEB3_CONNECT_CACHED_PROVIDER')
      }
      instance.on('accountsChanged', handleAccountsChanged)
      instance.on('chainChanged', handleChainChanged)
      instance.on('disconnect', handleDisconnect)
      return () => {
        if (instance.removeListener) {
          instance.removeListener('accountsChanged', handleAccountsChanged)
          instance.removeListener('chainChanged', handleChainChanged)
          instance.removeListener('disconnect', handleDisconnect)
        }
      }
    }
  }, [instance])

  const getErrorMessage = (error: ErrorMessage) => {
    return String(error.message)
  }

  const handleMint = async () => {
    setIsMinting(true)
    try {
      const vialsAddress = isMainnet ? '' : goerliVialsContractAddress
      const vials = new ethers.Contract(vialsAddress, vialsAbi, signer)
      const tx = await vials.mint(address, id, desiredQuantity)
      setTxHash(tx.hash)
      await tx.wait()
      setIsMinting(false)
      liveUpdate()
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
        <meta
          name='description'
          content='Cool x Clones presents the vials. Vials hold derivative artwork with combined traits (🐱x🧬)'
        />
      </Head>

      <Box
        display={'flex'}
        minHeight={'80vh'}
        flexDirection={'column'}
        justifyContent={'space-between'}>
        <Box
          flex={1}
          textAlign={'center'}
          mx={'auto'}
          maxWidth={'container.md'}>
          <>
            {isConnecting && <Spinner size='xl' color='white' />}
            {totalItems !== 0 && (
              <Box flex={3}>
                <Text>
                  {amountMinted} / {totalItems} minted
                </Text>
                <Text>{mintPrice} eth per mint</Text>
              </Box>
            )}
            {displayAddress !== '' && (
              <>
                <NextImage src='/vial.gif' alt='' width={128} height={128} />

                <Box mb={2}>
                  <Text fontSize='lg'> Total: {totalPrice} eth </Text>
                  <Text color='green.300'>
                    ({towardsPrize} towards prize pool)
                  </Text>
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
                <Text fontSize={'sm'}>{maxMint} max per transaction</Text>

                {isMinting ? (
                  <Text fontSize='lg'>Minting...</Text>
                ) : (
                  <Button
                    onClick={handleMint}
                    size={'xl'}
                    bg={'brand.400'}
                    disabled={isPaused}
                    my={10}>
                    Mint
                  </Button>
                )}

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
              <Text>
                Half of the mint price will go towards direct purchases from the
                economies of the projects we have derived from. These purchases
                will be given away as raffle prizes to vial holders.
              </Text>
              <Text pt='2'>
                Vials hold derivative artwork with combined traits (🐱x🧬).
              </Text>
            </Box>
          </>
        </Box>
      </Box>
    </>
  )
}

export default Mint
