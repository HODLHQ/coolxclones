import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { Box, useBreakpointValue } from '@chakra-ui/react'

const Home: NextPage = () => {
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
          <Box textAlign={'center'} maxWidth={'30%'} my={2} mx={'auto'}>
            <a onClick={handleMint}>
              <Image src='/mint.png' alt='Mint' width={540} height={300} />
            </a>
          </Box>
        </Box>
        <Box textAlign={'center'} mt={20}>
          <Image src='/footer.png' alt='' width={1380} height={500} />
        </Box>
      </Box>
    </>
  )
}

export default Home
