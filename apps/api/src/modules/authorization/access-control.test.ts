import { describe, expect, it } from "vitest";

import { permissionMapForRoles } from "./access-control.js";

describe("permissionMapForRoles", () => {
  it("gives the owner organization deletion and keeps it from an admin", () => {
    expect(permissionMapForRoles(["owner"]).organization?.delete).toBe(true);
    expect(permissionMapForRoles(["admin"]).organization?.delete).toBe(false);
    expect(permissionMapForRoles(["admin"]).organization?.update).toBe(true);
  });

  it("lets a manager approve sales and keeps approval from an employee", () => {
    expect(permissionMapForRoles(["manager"]).sales?.approve).toBe(true);
    expect(permissionMapForRoles(["employee"]).sales?.approve).toBe(false);
    expect(permissionMapForRoles(["employee"]).sales?.create).toBe(true);
  });

  it("limits a viewer to read actions", () => {
    const viewer = permissionMapForRoles(["viewer"]);
    expect(viewer.analytics?.read).toBe(true);
    expect(viewer.analytics?.export).toBe(false);
    expect(viewer.invitation?.create).toBe(false);
    expect(viewer.procurement?.update).toBe(false);
  });

  it("does not grant permissions for an unknown role", () => {
    expect(permissionMapForRoles(["member"]).procurement?.read).toBe(false);
  });
});
