// lib/meilisearch.js
import { MeiliSearch } from 'meilisearch'

const client = new MeiliSearch({
  host: process.env.NEXT_PUBLIC_MEILISEARCH_HOST,       // e.g. 'https://meili-docker.onrender.com'
  apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY,  // your Meilisearch master key or search-only API key
})

export { client }