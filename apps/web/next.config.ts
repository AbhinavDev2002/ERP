import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(
    fileURLToPath(new URL(".", import.meta.url)),
    "../..",
  ),
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
