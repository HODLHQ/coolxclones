import { theme } from '../app/theme'
import Layout from '../components/Layout'
import { AppProvider } from '../components/Context'
import { ChakraProvider } from '@chakra-ui/react'
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <AppProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AppProvider>
    </ChakraProvider>
  )
}

export default MyApp
