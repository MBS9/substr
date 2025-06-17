const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");
const path = require("path");
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')

const nextConfig = (phase, { defaultConfig }) => {
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    output: "export",
    compiler: {
      removeConsole: {
        exclude: ['error'],
      } ? phase !== PHASE_DEVELOPMENT_SERVER : {},
      ...defaultConfig.compiler,
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
    ...defaultConfig,
  }
  return nextConfig
}

module.exports = nextConfig;
