const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");
const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  webpack: (config, options) => {
    config.experiments.asyncWebAssembly = true;
    config.plugins.push(
      new WasmPackPlugin({
        crateDirectory: path.join(__dirname, '../wasm'),
        extraArgs: "--target web",
      })
    );
    return config;
  }
};

module.exports = nextConfig;
