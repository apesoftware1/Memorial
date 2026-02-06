import { gql } from '@apollo/client';

export const GET_BANNER = gql`
  query BannerAd {
    companies {
      documentId
      name
      bannerAd {
        url
      }
      bannerAdUrl
    }
  }
`;
