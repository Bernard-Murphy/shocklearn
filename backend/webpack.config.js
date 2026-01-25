const nodeExternals = require('webpack-node-externals');
const { exec } = require('child_process');

const optionalExternals = [
  '@mapbox/node-pre-gyp',
  'mock-aws-s3',
  'aws-sdk',
  'nock',
  '@mswjs/interceptors',
  'bcrypt',
];

class CopyPackageJsonPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tap('CopyPackageJsonPlugin', () => {
      exec('node scripts/copy-package-json.js', (error) => {
        if (error) {
          console.error('⚠️  Failed to copy package.json:', error.message);
        }
      });
    });
  }
}

module.exports = (config) => {
  config.externals = [
    ...(config.externals || []),
    nodeExternals({
      allowlist: [/@nestjs\/common/, /@nestjs\/core/, /@nestjs\/graphql/],
    }),
    ...optionalExternals.map((pkg) => ({ [pkg]: `commonjs ${pkg}` })),
  ];

  config.module.rules.push({
    test: /\.html$/,
    type: 'asset/source',
  });

  config.plugins = config.plugins || [];
  config.plugins.push(new CopyPackageJsonPlugin());

  return config;
};

