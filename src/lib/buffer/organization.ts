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

let cachedOrganizationId: string | null = null;

export async function resolveBufferOrganizationId(): Promise<string> {
  if (cachedOrganizationId) return cachedOrganizationId;

  const fromEnv = getBufferOrganizationId();
  if (fromEnv) {
    cachedOrganizationId = fromEnv;
    return cachedOrganizationId;
  }

  const data = await bufferGraphql<AccountOrgsResponse>(ACCOUNT_ORGS_QUERY);
  const orgs = data.account?.organizations ?? [];

  if (orgs.length === 0) {
    throw new Error("No Buffer organizations found for this API token.");
  }
  if (orgs.length === 1) {
    cachedOrganizationId = orgs[0].id;
    return cachedOrganizationId;
  }

  throw new Error(
    `Multiple Buffer organizations found (${orgs.map((o) => o.name).join(", ")}). Set BUFFER_ORGANIZATION_ID.`,
  );
}
