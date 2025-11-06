import { gql } from '@apollo/client';

export const GET_BANNER = gql`
  query BannerAd {bannerAd{
        url
      }
        documentId}`