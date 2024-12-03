/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',  // Alle Anfragen an `/api/` abfangen
        destination: 'https://localhost:3000/:path*',  // Weiterleiten an den Backend-Server
      },
    ];
  },
};

module.exports = nextConfig;
