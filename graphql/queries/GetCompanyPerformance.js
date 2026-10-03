// graphql/queries/companyPerformance.js
import { gql } from "@apollo/client";

export const GET_COMPANY_WITH_ANALYTICS = gql`
  query CompanyWithAnalytics(
    $documentId: ID!
    $page: Int = 1
    $pageSize: Int = 50
    $eventsStart: Date
    $eventsEnd: Date
    $eventsPage: Int = 1
    $eventsPageSize: Int = 50
  ) {
    companies(filters: { documentId: { eq: $documentId } }) {
      documentId
      name
      logoUrl
    }
    listings(
      pagination: { page: $page, pageSize: $pageSize }
      filters: { company: { documentId: { eq: $documentId } } }
    ) {
      documentId
      title
      price
      mainImageUrl
    }
    listingsMeta: listings_connection(
      filters: { company: { documentId: { eq: $documentId } } }
    ) {
      pageInfo {
        total
        pageCount
      }
    }

    analyticsEventsPage: analyticsEvents(
      pagination: { page: $eventsPage, pageSize: $eventsPageSize }
      filters: {
        and: [
          { listing: { company: { documentId: { eq: $documentId } } } },
          { timestamp: { gte: $eventsStart, lte: $eventsEnd } }
        ]
      }
    ) {
      documentId
      eventType
      timestamp
      listing { documentId }
    }

    listingViews: analyticsEvents_connection(
      filters: {
        and: [
          { listing: { company: { documentId: { eq: $documentId } } } },
          { eventType: { eq: "listing_view" } },
          { timestamp: { gte: $eventsStart, lte: $eventsEnd } }
        ]
      }
    ) {
      pageInfo { total }
    }
    mapViews: analyticsEvents_connection(
      filters: {
        and: [
          { listing: { company: { documentId: { eq: $documentId } } } },
          { eventType: { eq: "map_view" } },
          { timestamp: { gte: $eventsStart, lte: $eventsEnd } }
        ]
      }
    ) {
      pageInfo { total }
    }
    contactViews: analyticsEvents_connection(
      filters: {
        and: [
          { listing: { company: { documentId: { eq: $documentId } } } },
          { eventType: { eq: "contact_view" } },
          { timestamp: { gte: $eventsStart, lte: $eventsEnd } }
        ]
      }
    ) {
      pageInfo { total }
    }
    inquiryClicks: analyticsEvents_connection(
      filters: {
        and: [
          { listing: { company: { documentId: { eq: $documentId } } } },
          { eventType: { eq: "inquiry_click" } },
          { timestamp: { gte: $eventsStart, lte: $eventsEnd } }
        ]
      }
    ) {
      pageInfo { total }
    }
    phoneClicks: analyticsEvents_connection(
      filters: {
        and: [
          { listing: { company: { documentId: { eq: $documentId } } } },
          { eventType: { eq: "phone_click" } },
          { timestamp: { gte: $eventsStart, lte: $eventsEnd } }
        ]
      }
    ) {
      pageInfo { total }
    }
    whatsappClicks: analyticsEvents_connection(
      filters: {
        and: [
          { listing: { company: { documentId: { eq: $documentId } } } },
          { eventType: { eq: "whatsapp_tracker" } },
          { timestamp: { gte: $eventsStart, lte: $eventsEnd } }
        ]
      }
    ) {
      pageInfo { total }
    }
    repCallClicks: analyticsEvents_connection(
      filters: {
        and: [
          { listing: { company: { documentId: { eq: $documentId } } } },
          { eventType: { eq: "rep_call_tracker" } },
          { timestamp: { gte: $eventsStart, lte: $eventsEnd } }
        ]
      }
    ) {
      pageInfo { total }
    }
  }
`;

export const GET_COMPANY_WITH_ANALYTICS_EXTENDED = gql`
  query CompanyWithAnalyticsExtended(
    $documentId: ID!
    $page: Int = 1
    $pageSize: Int = 50
    $eventsStart: Date
    $eventsEnd: Date
    $eventsPage: Int = 1
    $eventsPageSize: Int = 50
  ) {
    companies(filters: { documentId: { eq: $documentId } }) {
      documentId
      name
      logoUrl
    }
    listings(
      pagination: { page: $page, pageSize: $pageSize }
      filters: { company: { documentId: { eq: $documentId } } }
    ) {
      documentId
      title
      price
      mainImageUrl
    }
    listingsMeta: listings_connection(
      filters: { company: { documentId: { eq: $documentId } } }
    ) {
      pageInfo {
        total
        pageCount
      }
    }

    analyticsEventsPage: analyticsEvents(
      pagination: { page: $eventsPage, pageSize: $eventsPageSize }
      filters: {
        and: [
          { listing: { company: { documentId: { eq: $documentId } } } },
          { timestamp: { gte: $eventsStart, lte: $eventsEnd } }
        ]
      }
    ) {
      documentId
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
      listing { documentId }
    }

    listingViews: analyticsEvents_connection(
      filters: {
        and: [
          { listing: { company: { documentId: { eq: $documentId } } } },
          { eventType: { eq: "listing_view" } },
          { timestamp: { gte: $eventsStart, lte: $eventsEnd } }
        ]
      }
    ) {
      pageInfo { total }
    }
    mapViews: analyticsEvents_connection(
      filters: {
        and: [
          { listing: { company: { documentId: { eq: $documentId } } } },
          { eventType: { eq: "map_view" } },
          { timestamp: { gte: $eventsStart, lte: $eventsEnd } }
        ]
      }
    ) {
      pageInfo { total }
    }
    contactViews: analyticsEvents_connection(
      filters: {
        and: [
          { listing: { company: { documentId: { eq: $documentId } } } },
          { eventType: { eq: "contact_view" } },
          { timestamp: { gte: $eventsStart, lte: $eventsEnd } }
        ]
      }
    ) {
      pageInfo { total }
    }
    inquiryClicks: analyticsEvents_connection(
      filters: {
        and: [
          { listing: { company: { documentId: { eq: $documentId } } } },
          { eventType: { eq: "inquiry_click" } },
          { timestamp: { gte: $eventsStart, lte: $eventsEnd } }
        ]
      }
    ) {
      pageInfo { total }
    }
    phoneClicks: analyticsEvents_connection(
      filters: {
        and: [
          { listing: { company: { documentId: { eq: $documentId } } } },
          { eventType: { eq: "phone_click" } },
          { timestamp: { gte: $eventsStart, lte: $eventsEnd } }
        ]
      }
    ) {
      pageInfo { total }
    }
    whatsappClicks: analyticsEvents_connection(
      filters: {
        and: [
          { listing: { company: { documentId: { eq: $documentId } } } },
          { eventType: { eq: "whatsapp_tracker" } },
          { timestamp: { gte: $eventsStart, lte: $eventsEnd } }
        ]
      }
    ) {
      pageInfo { total }
    }
    repCallClicks: analyticsEvents_connection(
      filters: {
        and: [
          { listing: { company: { documentId: { eq: $documentId } } } },
          { eventType: { eq: "rep_call_tracker" } },
          { timestamp: { gte: $eventsStart, lte: $eventsEnd } }
        ]
      }
    ) {
      pageInfo { total }
    }
  }
`;
