/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  redirects: async () => {
    return [
      {
        source: '/vial',
        destination: '/vial/1',
        permanent: false
      }
    ]
  }
}

module.exports = nextConfig
