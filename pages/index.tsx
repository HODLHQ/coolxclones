import type { NextPage } from 'next'
import NextImage from 'next/image'
import NextLink from 'next/link'
import { Box, Heading, Image, Link, SimpleGrid, Text } from '@chakra-ui/react'

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
              <Image
                src='/kingofcoolxclones.jpg'
                alt=''
                width={256}
                height={256}
                borderRadius={'lg'}
                mx={'auto'}
                my={8}
              />
            </Link>
          </NextLink>

          <NextLink href='/king'>
            <Link>👑 King of Cool x Clones 👑</Link>
          </NextLink>
        </Box>

        <Box>
          <NextLink href='/queen'>
            <Link>
              <Image
                src='/queenofcoolxclones.jpg'
                alt=''
                width={256}
                height={256}
                borderRadius={'lg'}
                mx={'auto'}
                my={8}
              />
            </Link>
          </NextLink>
          <NextLink href='/queen'>
            <Link>👑 Queen of Cool x Clones 👑</Link>
          </NextLink>
        </Box>
      </SimpleGrid>
    </Box>
  )
}

export default Home
