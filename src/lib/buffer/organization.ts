import { bufferGraphql } from "@/lib/buffer/client";
import { getBufferOrganizationId } from "@/lib/buffer/env";

type AccountOrgsResponse = {
  account: {
    organizations: Array<{ id: string; name: string }>;
  };
};

const ACCOUNT_ORGS_QUERY = `
  query AccountOrganizations {
    account {
      organizations {
        id
        name
      }
    }
  }
`;

export async function resolveBufferOrganizationId(): Promise<string> {
  const fromEnv = getBufferOrganizationId();
  if (fromEnv) return fromEnv;

  const data = await bufferGraphql<AccountOrgsResponse>(ACCOUNT_ORGS_QUERY);
  const orgs = data.account?.organizations ?? [];

  if (orgs.length === 0) {
    throw new Error("No Buffer organizations found for this API token.");
  }
  if (orgs.length === 1) {
    return orgs[0].id;
  }

  throw new Error(
    `Multiple Buffer organizations found (${orgs.map((o) => o.name).join(", ")}). Set BUFFER_ORGANIZATION_ID.`,
  );
}
