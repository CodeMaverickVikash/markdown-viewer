import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: {
    compilationMode: "infer",
  },
  transpilePackages: [
    "@mypartner/common",
    "@mypartner/markdown-editor",
    "@mypartner/my-portfolio",
    "@mypartner/note-taking",
  ],
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
