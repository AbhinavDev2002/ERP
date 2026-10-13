import { describe, expect, it } from "vitest";

import {
  assertMemberRoleChange,
  MemberRoleChangeError,
} from "./member-role-policy.js";

describe("assertMemberRoleChange", () => {
  it("rejects an admin granting the owner role", () => {
    expect(() =>
      assertMemberRoleChange({
        actorRoles: ["admin"],
        currentRole: "employee",
        nextRole: "owner",
        ownerCount: 1,
      }),
    ).toThrow(MemberRoleChangeError);
  });

  it("allows an owner to grant the owner role", () => {
    expect(() =>
      assertMemberRoleChange({
        actorRoles: ["owner"],
        currentRole: "admin",
        nextRole: "owner",
        ownerCount: 1,
      }),
    ).not.toThrow();
  });

  it("rejects removing the last owner", () => {
    expect(() =>
      assertMemberRoleChange({
        actorRoles: ["owner"],
        currentRole: "owner",
        nextRole: "admin",
        ownerCount: 1,
      }),
    ).toThrow(/keep an owner/);
  });

  it("allows an owner to step down when another owner remains", () => {
    expect(() =>
      assertMemberRoleChange({
        actorRoles: ["owner"],
        currentRole: "owner",
        nextRole: "admin",
        ownerCount: 2,
      }),
    ).not.toThrow();
  });
});
