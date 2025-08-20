// graphql/queries/companyPerformance.js
import { gql } from "@apollo/client";

export const GET_COMPANY_WITH_ANALYTICS = gql`
  query CompanyWithAnalytics($documentId: ID!, $eventsStart: Date, $eventsEnd: Date) {
    companies(filters: { documentId: { eq: $documentId } }) {
      documentId
      name
      logoUrl
      listings {
        documentId
        title
        price
        mainImageUrl
        analyticsEvents(
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