import type { NextPage } from 'next'
// import NextImage from 'next/image'
import NextLink from 'next/link'
import { Box, Link, SimpleGrid, Text } from '@chakra-ui/react'
import { ChakraNextImage } from '../components/ChakraNextImage'

const Home: NextPage = () => {
  return (
    <Box mt={8} p={2}>
      <Text>
        If you do not own a{' '}
        <Link href={'https://twitter.com/coolXclones'} isExternal={true}>
          @coolxclones
        </Link>{' '}
        you can right click save the King of Cool x Clones... or if you are a
        hexagon maxi you can mint! KCXC will give a boost to your web3 luck 🍀
        and who knows what other surprises he may bring!
      </Text>
      <SimpleGrid columns={2} spacing={4}>
        <Box>
          <NextLink href='/king'>
            <Link>
              <Box borderRadius='lg' overflow={'hidden'}>
                <ChakraNextImage
                  src='/kingofcoolxclones.jpg'
                  alt='King'
                  width={256}
                  height={256}
                  layout='fill'
                  objectFit='cover'
                />
              </Box>
            </Link>
          </NextLink>

          <NextLink href='/king'>
            <Link fontSize={'small'}>👑 King of Cool x Clones 👑</Link>
          </NextLink>
        </Box>

        <Box>
          <NextLink href='/queen'>
            <Link>
              <Box borderRadius={'lg'} overflow={'hidden'}>
                <ChakraNextImage
                  src='/queenofcoolxclones.jpg'
                  alt='Queen'
                  width={256}
                  height={256}
                  layout='fill'
                  objectFit='cover'
                />
              </Box>
            </Link>
          </NextLink>
          <NextLink href='/queen'>
            <Link fontSize={'small'}>👑 Queen of Cool x Clones 👑</Link>
          </NextLink>
        </Box>
      </SimpleGrid>
    </Box>
  )
}

export default Home
