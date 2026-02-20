const { webpack } = require('next/dist/compiled/webpack/webpack');

const S3_BUCKET_URL = 's3버킷이름';

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // 클라이언트 사이드 Module Federation 설정
    if (!isServer) {
      config.plugins.push(
        new webpack.container.ModuleFederationPlugin({
          name: 'consumeApp',
          remotes: {
            exportApp: `exportApp@${S3_BUCKET_URL}/client/remoteEntry.js`,
          },
          shared: {
            react: {
              singleton: true,
              requiredVersion: '^18.2.0',
            },
            'react-dom': {
              singleton: true,
              requiredVersion: '^18.2.0',
            },
          },
        })
      );
    }

    // 서버 사이드 Module Federation 설정 (SSR 지원)
    if (isServer) {
      config.plugins.push(
        new webpack.container.ModuleFederationPlugin({
          name: 'consumeApp',
          remotes: {
            exportApp: `promise new Promise((resolve, reject) => {
              const remoteUrl = '${S3_BUCKET_URL}/server/remoteEntry.js';
              import(remoteUrl)
                .then((mod) => resolve(mod))
                .catch((err) => {
                  console.error('Failed to load remote:', err);
                  reject(err);
                });
            })`,
          },
          shared: {
            react: {
              singleton: true,
              requiredVersion: '^18.2.0',
            },
            'react-dom': {
              singleton: true,
              requiredVersion: '^18.2.0',
            },
          },
        })
      );
    }

    return config;
  },
};

module.exports = nextConfig;
