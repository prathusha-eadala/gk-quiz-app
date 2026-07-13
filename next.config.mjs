/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Crucial for Docker/GCP deployments
};

export default nextConfig;
