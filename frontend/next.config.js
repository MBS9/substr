const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");
const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  webpack: (config, options) => {
    if (!options.isServer) {
      config.plugins.push(
        new WasmPackPlugin({
          crateDirectory: path.join(__dirname, "../wasm"),
          extraArgs: "--target bundler",
        })
      );
      config.output.environment = { ...config.output.environment, asyncFunction: true };
    }
    config.experiments.asyncWebAssembly = true;
    return config;
  },
};

module.exports = nextConfig;
