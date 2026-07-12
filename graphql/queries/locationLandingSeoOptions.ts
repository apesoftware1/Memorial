import { gql } from "@apollo/client";

export const LOCATION_LANDING_SEO_OPTIONS_QUERY = gql`
  query LocationLandingSeoOptions {
    locationLandingSeos {
      province
      locationType
      locationValue
      cityContext
    }
  }
`;
