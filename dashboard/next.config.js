/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: "export",  // Re-enable for static deployment (requires generateStaticParams)
  images: { unoptimized: true },
  // Transpile R3F packages for SSR/SSG compatibility
  transpilePackages: [
    "@react-three/fiber",
    "@react-three/drei",
    "three",
  ],
};

module.exports = nextConfig;
