const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Disable unstable worker_threads which cause V8 NewSpace/Zone Allocation out-of-memory crashes on Windows
config.transformer.unstable_workerThreads = false;

// Limit worker processes to 2 to prevent high memory consumption
config.maxWorkers = 2;

module.exports = config;
