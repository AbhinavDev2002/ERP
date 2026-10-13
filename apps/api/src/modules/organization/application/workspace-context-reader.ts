export interface WorkspaceOrganization {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly role: string;
}

export interface WorkspaceContext {
  readonly user: {
    readonly id: string;
    readonly email: string;
    readonly name: string;
    readonly emailVerified: boolean;
  };
  readonly organizations: readonly WorkspaceOrganization[];
  readonly activeOrganizationId: string | null;
  readonly permissions: Readonly<
    Record<string, Readonly<Record<string, boolean>>>
  >;
}

export interface WorkspaceContextReader {
  read(cookieHeader: string): Promise<WorkspaceContext | null>;
}
