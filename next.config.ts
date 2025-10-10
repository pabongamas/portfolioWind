import type { NextConfig } from "next";
 
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // CDN principal de Instagram (varios puntos PoP)
      { protocol: "https", hostname: "*.cdninstagram.com" },        // p.ej. scontent-gru1-2.cdninstagram.com
      // Variante antigua/alternativa de Facebook CDN
      { protocol: "https", hostname: "*.fbcdn.net" },               // por si llega a salir fbcdn.net
      // Subdominios con 1 nivel antes de fna.fbcdn.net
      { protocol: "https", hostname: "*.fna.fbcdn.net" },           // p.ej. xx.fna.fbcdn.net
      // Subdominios con 2 niveles antes de fna.fbcdn.net (muy común en Instagram)
      { protocol: "https", hostname: "*.*.fna.fbcdn.net" },         // p.ej. instagram.fcpq17-1.fna.fbcdn.net
      // (opcional) hosts directos de instagram
      { protocol: "https", hostname: "*.instagram.com" },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",                 // 👈 sin wildcard
        pathname: `/${process.env.CLOUDINARY_CLOUD_NAME}/**`, // 👈 usa la no pública
      },
    ],
  },
  eslint:{
    ignoreDuringBuilds: true,
  }
  /* config options here */
};

export default nextConfig;
