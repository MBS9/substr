const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");
const path = require("path");
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');
const { env } = require('process');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: env.NEXT_PUBLIC_BASE_PATH || "",
  compiler: {
    removeConsole: {
      exclude: ['error'],
    },
  },
  webpack: (config, options) => {
    if (!options.isServer || options.dev === false) {
      config.plugins.push(
        new WasmPackPlugin({
          crateDirectory: path.join(__dirname, "../wasm"),
          extraArgs: "--target web",
        })
      );
      config.output.environment = { ...config.output.environment, asyncFunction: true };
    }
    config.experiments.asyncWebAssembly = true;
    return config;
  },
};

module.exports = (phase, { defaultConfig }) => {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    delete nextConfig.compiler.removeConsole;
  }
  return { ...defaultConfig, ...nextConfig };
};
