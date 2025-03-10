const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");
const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/gello",
  webpack: (config, options) => {
    config.plugins.push(
      new WasmPackPlugin({
        crateDirectory: path.join(__dirname, "../wasm"),
        extraArgs: "--target web",
      })
    );
    return config;
  },
};

module.exports = nextConfig;
