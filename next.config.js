
/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  experimental: {
    /* Kept for other potential experimental features */
    serverComponentsExternalPackages: ["@opentelemetry/instrumentation"],
  },
  // The 'allowedDevOrigins' key must be at the top level, not inside 'experimental'.
  // This is required for the Cloud Workstations environment.
  allowedDevOrigins: ["*.cloudworkstations.dev"],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**', // Use a more permissive pathname
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        port: '',
        pathname: '/api/portraits/**',
      },
      {
        protocol: 'https',
        hostname: 'robohash.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer, dev }) => {
    // Fix for HMR in Gitpod and other similar environments
    if (dev && !isServer) {
      config.watchOptions.poll = 300;
    }

    // Fix for HMR websocket connection issue
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    });
    
    // Add rule to handle SVGs with @svgr/webpack
    config.module.rules.push({
        test: /\.svg$/,
        use: ['@svgr/webpack'],
    });

    return config;
  },
};

module.exports = nextConfig;
