import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import type { AppProps } from 'next/app'

const colors = {
  brand: {
    900: '#214080'
    // 900: '#1a365d',
    // 800: '#153e75',
    // 700: '#2a69ac'
  }
}

const styles = {
  global: {
    body: {
      bg: '#214080',
      color: 'white'
    }
  }
}

const theme = extendTheme({ colors, styles })

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}

export default MyApp
