import { gql } from '@apollo/client';

// Query to fetch all blog posts (sorted by published date)
export const GET_BLOGS = gql`
  query {
    blogPosts(sort: "publishedAt:desc") {
      documentId
      title
      excerpt
      coverImage {
        url
      }
      publishedAt
    }
  }
`;

// Query to fetch a single blog post by documentId
export const GET_BLOG_BY_ID = gql`
  query Blog($documentId: ID!) {
    blogPost(documentId: $documentId) {
      documentId
      title
      content
      coverImage {
        url
      }
      publishedAt
    }
  }
`;