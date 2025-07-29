import { gql } from '@apollo/client';

export const GET_MANUFACTURERS = gql`
  query Companies {
    companies {
      documentId
      name
      googleRating
      location
      address
      latitude
      longitude
      description
      logo {
        url
      }
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
      listings {
        documentId
      }
    }
  }
`;