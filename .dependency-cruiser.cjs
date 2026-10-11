/** @type {import("dependency-cruiser").IConfiguration} */
const config = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment:
        "Circular dependencies are not allowed anywhere in the workspace.",
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: "api-domain-not-infrastructure",
      severity: "error",
      comment: "Domain code must not import infrastructure.",
      from: { path: "(^|/)apps/api/src/.*/domain/" },
      to: { path: "(^|/)apps/api/src/.*/infrastructure/" },
    },
    {
      name: "api-domain-not-presentation",
      severity: "error",
      comment: "Domain code must not import presentation.",
      from: { path: "(^|/)apps/api/src/.*/domain/" },
      to: { path: "(^|/)apps/api/src/.*/presentation/" },
    },
    {
      name: "api-domain-not-fastify",
      severity: "error",
      comment: "Domain code must not import Fastify.",
      from: { path: "(^|/)apps/api/src/.*/domain/" },
      to: { path: "fastify" },
    },
    {
      name: "api-domain-not-prisma",
      severity: "error",
      comment: "Domain code must not import Prisma.",
      from: { path: "(^|/)apps/api/src/.*/domain/" },
      to: { path: "@prisma/client|^prisma$|node_modules/prisma/" },
    },
    {
      name: "ui-not-apps-web",
      severity: "error",
      comment: "@erp/ui must stay application-independent.",
      from: { path: "(^|/)packages/ui/" },
      to: { path: "(^|/)apps/web/" },
    },
    {
      name: "ui-not-apps-api",
      severity: "error",
      comment: "@erp/ui must not depend on the backend.",
      from: { path: "(^|/)packages/ui/" },
      to: { path: "(^|/)apps/api/" },
    },
    {
      name: "contracts-not-apps-web",
      severity: "error",
      comment: "Shared contracts must not import the web app.",
      from: { path: "(^|/)packages/contracts/" },
      to: { path: "(^|/)apps/web/" },
    },
    {
      name: "contracts-not-apps-api",
      severity: "error",
      comment: "Shared contracts must not import the API.",
      from: { path: "(^|/)packages/contracts/" },
      to: { path: "(^|/)apps/api/" },
    },
    {
      name: "api-not-ui",
      severity: "error",
      comment: "The backend must not depend on the UI package.",
      from: { path: "(^|/)apps/api/" },
      to: { path: "(^|/)packages/ui/" },
    },
    {
      name: "api-application-not-fastify",
      severity: "error",
      comment: "Application code must not import Fastify.",
      from: { path: "(^|/)apps/api/src/.*/application/" },
      to: { path: "fastify" },
    },
    {
      name: "api-application-not-prisma",
      severity: "error",
      comment: "Application code must not import Prisma.",
      from: { path: "(^|/)apps/api/src/.*/application/" },
      to: { path: "@prisma/client|^prisma$|node_modules/prisma/" },
    },
    {
      name: "api-application-not-presentation",
      severity: "error",
      comment: "Application code must not import presentation.",
      from: { path: "(^|/)apps/api/src/.*/application/" },
      to: { path: "(^|/)apps/api/src/.*/presentation/" },
    },
    {
      name: "api-domain-not-platform",
      severity: "error",
      comment: "Domain code must not import platform adapters.",
      from: { path: "(^|/)apps/api/src/.*/domain/" },
      to: { path: "(^|/)apps/api/src/platform/" },
    },
    {
      name: "web-not-mui",
      severity: "error",
      comment:
        "apps/web must not import Material UI or Emotion. Those belong in @erp/ui.",
      from: { path: "(^|/)apps/web/" },
      to: { path: "@mui/|@emotion/" },
    },
    {
      name: "web-not-api",
      severity: "error",
      comment: "The web app must not import backend implementation code.",
      from: { path: "(^|/)apps/web/" },
      to: { path: "(^|/)apps/api/" },
    },
    {
      name: "no-feature-deep-imports",
      severity: "error",
      comment:
        "Another feature may import only that feature's public index. Imports inside the same feature stay local.",
      from: { path: "(^|/)apps/web/src/features/([^/]+)/" },
      to: {
        path: "(^|/)apps/web/src/features/([^/]+)/",
        pathNot:
          "(^|/)apps/web/src/features/$2/|(^|/)apps/web/src/features/[^/]+/index\\.tsx?$",
      },
    },
  ],
  options: {
    doNotFollow: {
      path: "node_modules",
    },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default"],
    },
  },
};

module.exports = config;
