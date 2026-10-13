const maximumLegalNameLength = 200;

export class OrganizationProfileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrganizationProfileError";
  }
}

export class OrganizationProfile {
  readonly organizationId: string;
  readonly legalName: string;
  readonly timezone: string;

  private constructor(
    organizationId: string,
    legalName: string,
    timezone: string,
  ) {
    this.organizationId = organizationId;
    this.legalName = legalName;
    this.timezone = timezone;
  }

  static create(input: {
    readonly organizationId: string;
    readonly legalName: string;
    readonly timezone: string;
  }): OrganizationProfile {
    const legalName = input.legalName.trim();
    if (legalName.length === 0 || legalName.length > maximumLegalNameLength) {
      throw new OrganizationProfileError(
        "Legal name must be between 1 and 200 characters",
      );
    }

    if (!isTimeZone(input.timezone)) {
      throw new OrganizationProfileError("Timezone is not recognized");
    }

    return new OrganizationProfile(
      input.organizationId,
      legalName,
      input.timezone,
    );
  }
}

function isTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}
