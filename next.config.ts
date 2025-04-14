import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "https://vocal-easy-foal.ngrok-free.app",
    "*https://vocal-easy-foal.ngrok-free.app",
  ],
};

export default nextConfig;
