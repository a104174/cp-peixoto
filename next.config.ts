import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/backoffice/orcamentos/[id]/pdf": [
      "./public/brand/cp-peixoto-logo.png",
    ],
  },
};

export default nextConfig;
