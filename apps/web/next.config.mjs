/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@aritech/shared", "@aritech/validation"],
  // "standalone" produz um servidor Node self-contained em .next/standalone,
  // usado pelo Dockerfile para uma imagem de runtime mínima.
  output: "standalone",
};

export default nextConfig;
