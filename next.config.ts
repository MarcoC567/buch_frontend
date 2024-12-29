/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/graphql',  
        destination: 'https://localhost:3000/graphql', 
      },
      {
        source: '/api/:path*',  
        destination: 'https://localhost:3000/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
