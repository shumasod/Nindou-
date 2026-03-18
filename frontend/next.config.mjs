

const nextConfig = {
  experimental: {},
  async rewrites() {
    return [
      {
        source: "/api/server/:path*",
        destination: "http://localhost:3001/:path*",
      },
    ];
  },
};

export default nextConfig;
