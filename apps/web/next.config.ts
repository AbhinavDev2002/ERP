import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@erp/contracts", "@erp/ui"],
  turbopack: {
    resolveAlias: {
      "@erp/contracts": "../../packages/contracts/src/index.browser.ts",
      "@erp/ui": "../../packages/ui/src/index.browser.ts",
    },
  },
  output: "standalone",
  outputFileTracingRoot: path.join(
    fileURLToPath(new URL(".", import.meta.url)),
    "../..",
  ),
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
