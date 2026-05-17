import { getBufferApiToken } from "@/lib/buffer/env";

const BUFFER_API_URL = "https://api.buffer.com";

export class BufferApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 502,
  ) {
    super(message);
    this.name = "BufferApiError";
  }
}

type GraphqlError = { message: string };

export async function bufferGraphql<TData>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<TData> {
  const token = getBufferApiToken();
  if (!token) {
    throw new BufferApiError(
      "Buffer is not configured. Set BUFFER_API_TOKEN in the environment.",
      503,
    );
  }

  const res = await fetch(BUFFER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const json = (await res.json()) as {
    data?: TData;
    errors?: GraphqlError[];
  };

  if (!res.ok) {
    throw new BufferApiError(
      json.errors?.[0]?.message ?? `Buffer API HTTP ${res.status}`,
      res.status >= 500 ? 502 : 400,
    );
  }

  if (json.errors?.length) {
    throw new BufferApiError(json.errors.map((e) => e.message).join("; "));
  }

  if (!json.data) {
    throw new BufferApiError("Buffer API returned no data.");
  }

  return json.data;
}
