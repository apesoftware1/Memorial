import { gql } from '@apollo/client';

export const GET_MANUFACTURERS = gql`
  query Companies {
    companies {
      phone
      documentId
      name
      googleRating
      location
      latitude
      longitude
      description
      logoUrl
      logoUrlPublicId

      operatingHours {
        id
        monToFri
        saturday
        sunday
        publicHoliday
      }
      socialLinks {
        id
        facebook
        website
        instagram
        tiktok
        youtube
        x
        whatsapp
        messenger
      }
      packageType
      isFeatured
      listings(pagination: { limit: -1 }) {
        documentId
      }
    }
  }
`;