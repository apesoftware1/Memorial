import { gql } from "@apollo/client";

export const GET_BRANCHES_BY_NAME = gql`
  query GET_BRANCHES_BY_NAME($name: String!, $status: PublicationStatus = PUBLISHED, $page: Int = 1, $pageSize: Int = 10) { 
    branches_connection( 
      filters: { name: { containsi: $name } } 
      status: $status 
      pagination: { page: $page, pageSize: $pageSize } 
    ) { 
      nodes { 
        documentId
        name
        location { 
          address 
          latitude
          longitude
          mapUrl 
        } 
        sales_reps { 
          documentId 
          name 
          call 
          whatsapp 
          avatar {
            url
          }
        } 
      } 
      pageInfo { 
        page 
        pageSize 
        total 
      } 
    } 
  }
`;
