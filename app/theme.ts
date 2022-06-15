import '@fontsource/pangolin/400.css'
import { extendTheme } from '@chakra-ui/react'
const theme = extendTheme({
  colors: {
    brand: {
      100: '#40aafe',
      400: '#0097ff',
      900: '#006bff'
    }
  },
  styles: {
    global: {
      body: {
        bg: '#006bff',
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
        color: 'white',
        _hover: {
          background: 'white',
          color: '#0097ff'
        }
      },
      sizes: {
        xl: {
          fontSize: '4rem',
          lineHeight: '4rem',
          px: 1,
          py: 1
        }
      }
    }
  }
})
export { theme }
