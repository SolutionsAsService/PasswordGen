/** @type {import('next').NextConfig} */
const nextConfig = {
  // A password generator has no business running on a server: every draw is
  // made in the visitor's browser from their own CSPRNG, so the whole app is
  // exported to static files at build time.
  output: 'export',
  reactStrictMode: true,
};

export default nextConfig;
