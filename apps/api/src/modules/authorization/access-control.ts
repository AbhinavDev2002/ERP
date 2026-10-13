import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
  ownerAc,
} from "better-auth/plugins/organization/access";

const statement = {
  ...defaultStatements,
  organization: ["update", "delete", "read"],
  procurement: ["read", "create", "update", "approve"],
  sales: ["read", "create", "update", "approve"],
  inventory: ["read", "create", "adjust"],
  customers: ["read", "create", "update"],
  analytics: ["read", "export"],
} as const;

export const accessControl = createAccessControl(statement);

const operational = {
  procurement: ["read", "create", "update"],
  sales: ["read", "create", "update"],
  inventory: ["read", "create", "adjust"],
  customers: ["read", "create", "update"],
} as const;

const reads = {
  organization: ["read"],
  procurement: ["read"],
  sales: ["read"],
  inventory: ["read"],
  customers: ["read"],
  analytics: ["read"],
} as const;

export const ownerRole = accessControl.newRole({
  ...ownerAc.statements,
  organization: ["update", "delete", "read"],
  procurement: ["read", "create", "update", "approve"],
  sales: ["read", "create", "update", "approve"],
  inventory: ["read", "create", "adjust"],
  customers: ["read", "create", "update"],
  analytics: ["read", "export"],
});

export const adminRole = accessControl.newRole({
  ...adminAc.statements,
  organization: ["update", "read"],
  procurement: ["read", "create", "update", "approve"],
  sales: ["read", "create", "update", "approve"],
  inventory: ["read", "create", "adjust"],
  customers: ["read", "create", "update"],
  analytics: ["read", "export"],
});

export const managerRole = accessControl.newRole({
  ...operational,
  procurement: ["read", "create", "update", "approve"],
  sales: ["read", "create", "update", "approve"],
  analytics: ["read", "export"],
  organization: ["read"],
});

export const employeeRole = accessControl.newRole(operational);

export const viewerRole = accessControl.newRole(reads);

export const organizationRoles = {
  owner: ownerRole,
  admin: adminRole,
  manager: managerRole,
  employee: employeeRole,
  viewer: viewerRole,
};

export type OrganizationRoleKey = keyof typeof organizationRoles;

export function permissionMapForRoles(
  roleNames: readonly string[],
): Record<string, Record<string, boolean>> {
  const granted = new Map<string, Set<string>>();

  for (const roleName of roleNames) {
    const role = organizationRoles[roleName as OrganizationRoleKey];
    if (!role) {
      continue;
    }

    for (const [resource, actions] of Object.entries(role.statements)) {
      const current = granted.get(resource) ?? new Set<string>();
      for (const action of actions) {
        current.add(action);
      }
      granted.set(resource, current);
    }
  }

  const map: Record<string, Record<string, boolean>> = {};
  for (const [resource, actions] of Object.entries(statement)) {
    const resourceMap: Record<string, boolean> = {};
    const allowed = granted.get(resource);
    for (const action of actions) {
      resourceMap[action] = allowed?.has(action) ?? false;
    }
    map[resource] = resourceMap;
  }

  return map;
}
