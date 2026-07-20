/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
  output: 'standalone',
  outputFileTracingIncludes: {
    '/api/cms/upload': [
      './node_modules/sharp/**/*',
      './node_modules/@img/**/*',
      './node_modules/@emnapi/runtime/**/*',
      './node_modules/detect-libc/**/*',
      './node_modules/semver/**/*',
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  trailingSlash: true,
  async headers() {
    const cmsHeaders = [
      { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'same-origin' },
    ]
    return [
      { source: '/cms/:path*', headers: cmsHeaders },
      { source: '/api/cms/:path*', headers: cmsHeaders },
      { source: '/api/public/leads/:path*', headers: cmsHeaders },
      { source: '/api/internal/leads/:path*', headers: cmsHeaders },
    ]
  },
}

export default nextConfig
