import { gql } from '@apollo/client';

// Test query to verify dashboard data fetching
export const TEST_DASHBOARD_QUERY = gql`
  query TestDashboardData {
    listings {
      documentId
      title
      isPremium
      isFeatured
      isStandard
      isOnSpecial
      company {
        name
        location
      }
      inquiries_c {
        documentId
      }
      inquiries {
        documentId
      }
    }
    companies {
      documentId
      name
      location
      listings {
        documentId
      }
    }
  }
`;

// Simple test function to verify data structure
export const testDashboardData = (data) => {
  console.log('Dashboard Test Results:');
  console.log('Total Listings:', data?.listings?.length || 0);
  console.log('Total Companies:', data?.companies?.length || 0);
  
  if (data?.listings) {
    const premium = data.listings.filter(l => l.isPremium).length;
    const featured = data.listings.filter(l => l.isFeatured).length;
    const standard = data.listings.filter(l => l.isStandard).length;
    const special = data.listings.filter(l => l.isOnSpecial).length;
    
    console.log('Premium Listings:', premium);
    console.log('Featured Listings:', featured);
    console.log('Standard Listings:', standard);
    console.log('Special Listings:', special);
  }
  
  return {
    success: true,
    listings: data?.listings?.length || 0,
    companies: data?.companies?.length || 0
  };
}; 