import type { NextPage } from 'next'
import Head from 'next/head'
import {
  Box,
  Button,
  CircularProgress,
  Heading,
  Icon,
  Image,
  Link,
  Text,
  useToast
} from '@chakra-ui/react'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import { FaTwitter } from 'react-icons/fa'
import NextLink from 'next/link'
import * as React from 'react'
import { useApp } from '../components/Context'
import { honoraryAbi } from '../artifacts/honorary'
import { ethers } from 'ethers'

interface ErrorMessage {
  message: string
}

const Queen: NextPage = () => {
  const toast = useToast()
  const { state } = useApp()
  const { provider, signer, address, isMainnet } = state

  const [txHash, setTxHash] = React.useState('')
  const [isMinting, setIsMinting] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState('')
  const [isQueen, setIsQueen] = React.useState(false)

  React.useEffect(() => {
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

  React.useEffect(() => {
    const isHolder = async () => {
      const honorary = new ethers.Contract(
        '0x7b903229b78ff51785b11bebaf297e562ca55bcc',
        honoraryAbi,
        provider
      )

      const balance = await honorary.balanceOf(address, 2)
      if (balance > 0) {
        setIsQueen(true)
      }
    }

    if (provider && isMainnet && address !== '') {
      isHolder()
    }
  }, [provider, isMainnet, address])

  const getErrorMessage = (error: ErrorMessage) => {
    return String(error.message)
  }

  const handleMint = async () => {
    setIsMinting(true)
    try {
      const honorary = new ethers.Contract(
        '0x7b903229b78ff51785b11bebaf297e562ca55bcc',
        honoraryAbi,
        signer
      )
      const tx = await honorary.queenMint(address)
      setTxHash(tx.hash)
      await tx.wait()
      setIsMinting(false)
      setIsQueen(true)
    } catch (e) {
      console.log(e)
      const msg = getErrorMessage(e as ErrorMessage)
      setErrorMessage(msg)
      setIsMinting(false)
    }
  }

  return (
    <>
      <Head>
        <title>Queen of Cool x Clones</title>
        <meta
          name='description'
          content='Cool x Clones presents the Queen of Cool x Clones Free Mint'
        />
        <link rel='icon' href='/favicon.ico' />
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:site' content='@coolxclones' />
        <meta name='twitter:creator' content='@coolxclones' />
        <meta
          name='twitter:title'
          content='I am the Queen of Cool x Clones 👑'
        />
        <meta
          name='twitter:description'
          content='Mint yours free for a little bit of luck and follow @coolXclones for the latest alpha! https://coolxclones.xyz'
        />
        <meta
          name='twitter:image'
          content='https://www.coolxclones.xyz/queenofcoolxclones.jpg'
        />
      </Head>
      <>
        <Image
          src='/queenofcoolxclones.jpg'
          alt=''
          width={256}
          height={256}
          borderRadius={'lg'}
          mx={'auto'}
          my={8}
        />
        <Heading as='h3'>👑 Queen of Cool x Clones 👑</Heading>
        <Text>
          If you do not own a{' '}
          <Link href={'https://twitter.com/coolXclones'} isExternal={true}>
            @coolxclones
          </Link>{' '}
          you can right click save the Queen of Cool x Clones... or if you are a
          hexagon maxi you can mint! QCXC will give a boost to your web3 luck 🍀
          and who knows what other surprises she may bring!
        </Text>
        <Box p={2}>
          <Text>1 per wallet</Text>
        </Box>

        <Box p={8}>
          {isMinting ? (
            <CircularProgress size={'32px'} isIndeterminate color='white' />
          ) : isQueen ? (
            <Link
              href={
                'https://twitter.com/intent/tweet?url=https://coolxclones.xyz/queen&hashtags=freemint,rightclicksave,nft,nftart,nfts,nftdrop,nftcommunity,nftcollector,art&via=coolXclones&text=I%20am%20the%20Queen%20of%20Cool%20x%20Clones%20%F0%9F%91%91%0A%0AMint%20yours%20free%20for%20a%20little%20bit%20of%20luck%20and%20follow%20%40coolXclones%20for%20the%20latest%20alpha%21%0A%0A'
              }
              isExternal={true}>
              <Icon as={FaTwitter} /> I am the Queen of Cool x Clones 👑
            </Link>
          ) : (
            <Button
              onClick={handleMint}
              size={'xl'}
              bg={'brand.100'}
              my={10}
              _hover={{ color: 'brand.100', bg: 'white' }}
              disabled={Boolean(address === '')}>
              Free Mint
            </Button>
          )}
        </Box>

        {txHash !== '' && (
          <Box p={4}>
            <Link href={`https://etherscan.io/tx/${txHash}`} isExternal={true}>
              View transaction <ExternalLinkIcon mx='2px' />
            </Link>
          </Box>
        )}
        <Box mt={8}>
          <NextLink href='/'>⬅️ Back</NextLink>
        </Box>
      </>
    </>
  )
}

export default Queen
