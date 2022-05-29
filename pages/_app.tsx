import '@fontsource/pangolin/400.css'
import { background, ChakraProvider, extendTheme } from '@chakra-ui/react'
import type { AppProps } from 'next/app'

const theme = extendTheme({
  colors: {
    brand: {
      400: '#0097ff',
      900: '#214080'
    }
  },
  styles: {
    global: {
      body: {
        bg: '#214080',
        color: 'white'
      }
    }
  },
  fonts: {
    heading: `'Pangolin', cursive`,
    body: `'Pangolin', cursive`
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'normal',
        textTransform: 'uppercase',
        background: '#0097ff',
        color: 'white'
      },
      sizes: {
        xl: {
          fontSize: '6rem',
          lineHeight: '6rem',
          px: 1,
          py: 1
        }
      }
    }
  }
})

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}

export default MyApp
