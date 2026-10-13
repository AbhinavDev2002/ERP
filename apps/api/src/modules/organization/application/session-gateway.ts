export interface SessionCredentials {
  readonly cookieHeader: string;
}

export interface AuthenticatedSession {
  readonly userId: string;
  readonly activeOrganizationId: string | null;
  readonly memberOrganizationIds: readonly string[];
}

export interface SessionGateway {
  resolve(
    credentials: SessionCredentials,
  ): Promise<AuthenticatedSession | null>;
}
