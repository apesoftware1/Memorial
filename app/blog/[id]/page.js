import { redirect } from "next/navigation";

const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_STRAPI_GRAPHQL_URL ||
  `${process.env.STRAPI_API_URL || "https://api.tombstonesfinder.co.za"}/graphql`;

async function fetchGraphQL(query, variables) {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  const json = await res.json();
  if (json?.errors?.length) return null;
  return json?.data ?? null;
}

async function resolveSlugByDocumentId(documentId) {
  if (!documentId) return null;
  const data = await fetchGraphQL(
    `
      query BlogLegacyResolve($documentId: ID!) {
        blogPost(documentId: $documentId) {
          slug
        }
      }
    `,
    { documentId }
  );
  const slug = data?.blogPost?.slug;
  return typeof slug === "string" && slug.trim() ? slug.trim() : null;
}

export default async function BlogLegacyDetailRedirect({ params }) {
  const id = (await params)?.id;
  const documentId = typeof id === "string" ? id.trim() : "";
  if (!documentId) redirect("/blogs");

  const slug = await resolveSlugByDocumentId(documentId);
  if (slug) redirect(`/blogs/${slug}`);
  redirect("/blogs");
}
