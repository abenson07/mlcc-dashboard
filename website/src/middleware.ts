import { defineMiddleware } from "astro:middleware";
import { verifyEditToken } from "./lib/edit";

const PUBLIC_CACHE = "public, s-maxage=60, stale-while-revalidate=300";

export const onRequest = defineMiddleware(async (context, next) => {
  const edit = verifyEditToken(context.url.searchParams.get("edit"));
  context.locals.edit = edit;

  const response = await next();
  const headers = new Headers(response.headers);

  if (edit) {
    // Draft content, never cached, framed only by the admin that minted the token.
    headers.set("Cache-Control", "no-store");
    headers.set("Content-Security-Policy", `frame-ancestors ${edit.parent}`);
    headers.delete("X-Frame-Options");
  } else if (response.status === 200 && !headers.has("Cache-Control")) {
    headers.set("Cache-Control", PUBLIC_CACHE);
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
});
