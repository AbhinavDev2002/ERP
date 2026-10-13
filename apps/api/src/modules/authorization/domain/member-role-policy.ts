const ownerRole = "owner";

export type MemberRoleChangeCode = "forbidden" | "last_owner";

export class MemberRoleChangeError extends Error {
  readonly code: MemberRoleChangeCode;

  constructor(code: MemberRoleChangeCode, message: string) {
    super(message);
    this.name = "MemberRoleChangeError";
    this.code = code;
  }
}

export function assertMemberRoleChange(input: {
  readonly actorRoles: readonly string[];
  readonly currentRole: string;
  readonly nextRole: string;
  readonly ownerCount: number;
}): void {
  const current = splitRoles(input.currentRole);
  const next = splitRoles(input.nextRole);
  const actorIsOwner = input.actorRoles.includes(ownerRole);

  if (next.includes(ownerRole) && !actorIsOwner) {
    throw new MemberRoleChangeError(
      "forbidden",
      "Only an owner can grant the owner role",
    );
  }

  if (
    current.includes(ownerRole) &&
    !next.includes(ownerRole) &&
    input.ownerCount <= 1
  ) {
    throw new MemberRoleChangeError(
      "last_owner",
      "The organization must keep an owner",
    );
  }
}

function splitRoles(value: string): string[] {
  return value
    .split(",")
    .map((role) => role.trim())
    .filter((role) => role.length > 0);
}
