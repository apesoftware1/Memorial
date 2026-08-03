const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tombstonesfinder.co.za";
const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_STRAPI_GRAPHQL_URL ||
  `${process.env.STRAPI_API_URL || "https://api.tombstonesfinder.co.za"}/graphql`;

export function toAbsoluteUrl(pathname) {
  return `${SITE_URL}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

export async function fetchGraphQL(query, variables = {}, revalidate = 3600) {
  const revalidateValue =
    typeof revalidate === "number" && Number.isFinite(revalidate) ? revalidate : 3600;

  const fetchOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  };

  if (revalidateValue === 0) {
    fetchOptions.cache = "no-store";
  } else {
    fetchOptions.next = { revalidate: revalidateValue };
  }

  const res = await fetch(GRAPHQL_URL, {
    ...fetchOptions,
  });

  if (!res.ok) return null;
  const json = await res.json();
  if (json?.errors?.length) return null;
  return json?.data ?? null;
}
