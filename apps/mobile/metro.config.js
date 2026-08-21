const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

// The mobile app consumes the sibling shared package in this repository.
config.watchFolders = [path.resolve(__dirname, '../../packages/shared')]

module.exports = config
