const nextConfig = {
  output: "standalone",
  experimental: {},
  async rewrites() {
    const serverUrl = process.env.SERVER_URL ?? "http://localhost:3001";
    return [
      {
        source: "/api/server/:path*",
        destination: `${serverUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
