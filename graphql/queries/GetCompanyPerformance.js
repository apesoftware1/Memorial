// graphql/queries/companyPerformance.js
import { gql } from "@apollo/client";

export const GET_COMPANY_WITH_ANALYTICS = gql`
  query CompanyWithAnalytics($documentId: ID!, $eventsStart: Date, $eventsEnd: Date) {
    companies(filters: { documentId: { eq: $documentId } }) {
      documentId
      name
      logoUrl
      listings(pagination: { limit: -1 }) {
        documentId
        title
        price
        mainImageUrl
        analyticsEvents(
          pagination: { limit: -1 }
          filters: { 
            timestamp: { gte: $eventsStart, lte: $eventsEnd }
          }
        ) {
          eventType
          timestamp
        }
      }
    }
  }
`;

export const GET_COMPANY_WITH_ANALYTICS_EXTENDED = gql`
  query CompanyWithAnalyticsExtended($documentId: ID!, $eventsStart: Date, $eventsEnd: Date) {
    companies(filters: { documentId: { eq: $documentId } }) {
      documentId
      name
      logoUrl
      listings(pagination: { limit: -1 }) {
        documentId
        title
        price
        mainImageUrl
        analyticsEvents(
          pagination: { limit: -1 }
          filters: { 
            timestamp: { gte: $eventsStart, lte: $eventsEnd }
          }
        ) {
          eventType
          timestamp
          pagePath
          pageUrl
          referrer
          utmSource
          utmMedium
          utmCampaign
          utmTerm
          deviceType
          userAgent
          sessionId
          ipHash
          searchQuery
          metadata
        }
      }
    }
  }
`;
