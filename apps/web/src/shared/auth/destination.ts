export function workspaceDestination(input: {
  readonly organizations: readonly { readonly id: string }[];
  readonly invitationId: string | null;
  readonly returnTo: string | null;
}): string {
  if (input.invitationId && /^[A-Za-z0-9_-]+$/.test(input.invitationId)) {
    return `/invitations/${input.invitationId}`;
  }

  const returnTo = safeReturnTo(input.returnTo);
  if (returnTo) {
    return returnTo;
  }

  if (input.organizations.length === 0) {
    return "/onboarding/organization";
  }

  const only = input.organizations[0];
  if (input.organizations.length === 1 && only) {
    return `/${only.id}`;
  }

  return "/organizations";
}

export function organizationIdFromPath(path: string): string | null {
  const match = /^\/([A-Za-z0-9_-]+)(?:\/|$)/.exec(path);
  const id = match?.[1];
  if (!id || reservedPathSegments.has(id)) {
    return null;
  }

  return id;
}

const reservedPathSegments = new Set([
  "login",
  "onboarding",
  "invitations",
  "organizations",
  "no-organization",
  "unauthorized",
  "session-expired",
]);

function safeReturnTo(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  if (value.startsWith("/login")) {
    return null;
  }

  return value;
}
