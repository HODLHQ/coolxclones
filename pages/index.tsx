import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { Box } from '@chakra-ui/react'

const Home: NextPage = () => {
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

      <Box>
        <Box position='relative'>
          <Image
            src='/header.png'
            alt='Cool X Clones'
            width={3000}
            height={1000}
          />
        </Box>
        <Box position='relative' textAlign={'center'} m={8}>
          <Image src='/silhouette.png' alt='?' width={2740} height={864} />
        </Box>
        <Box textAlign={'center'} maxWidth={'30%'} my={2} mx={'auto'}>
          <a onClick={handleMint}>
            <Image src='/mint.png' alt='Mint' width={540} height={300} />
          </a>
        </Box>
        <Box position='relative' mt={20}>
          <Image src='/footer.png' alt='' width={2760} height={1000} />
        </Box>
      </Box>
    </>
  )
}

export default Home
