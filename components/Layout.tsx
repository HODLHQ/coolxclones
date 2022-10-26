import Wallet from '../components/Wallet'
import { Box, Icon, Link, Text } from '@chakra-ui/react'
import { FaTwitter } from 'react-icons/fa'
import NextImage from 'next/image'
import Head from 'next/head'

interface Props {
  children: React.ReactNode
}

const Layout = ({ children }: Props) => {
  return (
    <>
      <Head>
        <title>Cool x Clones</title>
        <meta name='description' content='Cool x Clones' />
        <link rel='icon' href='/favicon.ico' />
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:site' content='@coolxclones' />
        <meta name='twitter:creator' content='@coolxclones' />
        <meta name='twitter:title' content='Cool x Clones' />
        <meta
          name='twitter:description'
          content='Follow @coolXclones for the latest alpha! https://coolxclones.xyz'
        />
        <meta
          name='twitter:image'
          content='https://www.coolxclones.xyz/vial.png'
        />
      </Head>
      <Box
        display={'flex'}
        minHeight={'100vh'}
        flexDirection={'column'}
        justifyContent={'space-between'}
        textAlign={'center'}
        mx={'auto'}>
        <Box position='relative'>
          <NextImage
            src='/header-lg.jpg'
            alt='Cool X Clones'
            width={3000}
            height={600}
          />
        </Box>
        <Box
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            margin: '20px'
          }}>
          <Link href={'https://hodlhq.xyz'} isExternal={true}>
            <NextImage src='/hodlhq.png' alt='Hodlhq' width={150} height={50} />
          </Link>
        </Box>

        <Box
          flex={1}
          textAlign={'center'}
          mx={'auto'}
          maxWidth={'container.md'}>
          <>
            <Wallet />
            <>{children}</>
          </>
        </Box>

        <Box textAlign={'center'} mt={10} maxWidth={'container.xl'} mx={'auto'}>
          <Text>
            <Icon as={FaTwitter} />{' '}
            <Link
              href={
                'https://twitter.com/intent/user?screen_name=coolXclones&original_referer=https://www.coolxclones.xyz'
              }
              isExternal={true}>
              Follow for Cool x Clones alpha!
            </Link>
          </Text>
          <Text>
            Contract:{' '}
            <Link
              href='https://etherscan.io/address/0x7b903229b78ff51785b11bebaf297e562ca55bcc#code'
              isExternal={true}>
              <a>0x7b903229b78ff51785b11bebaf297e562ca55bcc</a>
            </Link>
          </Text>
          <NextImage src='/footer.png' alt='' width={1920} height={696} />
        </Box>
      </Box>
    </>
  )
}
export default Layout
