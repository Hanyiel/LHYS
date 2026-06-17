import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,    // 静态导出必须关闭图片优化
  },
  devIndicators: false,
};

export default nextConfig;
