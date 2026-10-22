const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Limit worker threads to prevent V8 out-of-memory (Zone Allocation failed) crashes
config.maxWorkers = 2;

module.exports = config;
