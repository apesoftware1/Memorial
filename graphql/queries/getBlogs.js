import { gql } from '@apollo/client';

// Query to fetch all blog posts (sorted by published date)
export const GET_BLOGS = gql`
  query {
    blogPosts(sort: "publishedAt:desc") {
      documentId
      slug
      title
      excerpt
      coverImageUrl
      coverImagePublicId
      publishedAt
    }
  }
`;

export const GET_BLOGS_ADMIN = gql`
  query GetBlogsAdmin {
    blogPosts(sort: "publishedAt:desc", pagination: { limit: 100 }) {
      documentId
      slug
      title
      excerpt
      coverImageUrl
      coverImagePublicId
      publishedAt
    }
  }
`;

// Query to fetch a single blog post by documentId
export const GET_BLOG_BY_ID = gql`
  query Blog($documentId: ID!) {
    blogPost(documentId: $documentId) {
      documentId
      slug
      title
      content
      excerpt
      coverImageUrl
      coverImagePublicId
      publishedAt
    }
  }
`;
