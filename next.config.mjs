/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Build Cache Reset: 2024-04-24T17:30:00 */
  typescript: {
    ignoreBuildErrors: true,
  },
  devIndicators: false,
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com', 'i.pravatar.cc'],
  },
};

export default nextConfig;
