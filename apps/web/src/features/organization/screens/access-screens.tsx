import { LinkAction, PageFrame, StackColumn, StatusPanel } from "@erp/ui";

export function NoOrganizationScreen() {
  return (
    <PageFrame>
      <StatusPanel title="No organization yet">
        <StackColumn>
          <p>
            Access follows an invitation from your business, or you can create
            one if you are the owner.
          </p>
          <LinkAction href="/onboarding/organization">
            Create a business
          </LinkAction>
        </StackColumn>
      </StatusPanel>
    </PageFrame>
  );
}

export function UnauthorizedScreen() {
  return (
    <PageFrame>
      <StatusPanel title="Unauthorized">
        <StackColumn>
          <p>You do not have access to this page.</p>
          <LinkAction href="/organizations">Back to organizations</LinkAction>
        </StackColumn>
      </StatusPanel>
    </PageFrame>
  );
}
