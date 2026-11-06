const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts = [...new Set([...(config.resolver.assetExts || []), 'ttf', 'otf'])];
config.resolver.sourceExts = (config.resolver.sourceExts || []).filter(
  (ext) => ext !== 'ttf' && ext !== 'otf'
);

module.exports = config;
