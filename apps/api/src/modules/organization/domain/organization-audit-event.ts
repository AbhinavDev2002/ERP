export class OrganizationAuditEvent {
  readonly organizationId: string;
  readonly actorUserId: string;
  readonly action: string;

  constructor(organizationId: string, actorUserId: string, action: string) {
    this.organizationId = organizationId;
    this.actorUserId = actorUserId;
    this.action = action;
  }
}
