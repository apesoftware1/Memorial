import { gql } from '@apollo/client';

export const GET_DASHBOARD_DATA = gql`
  query GetDashboardData {
    # Get all listings for analytics
    listings {
      documentId
      title
      price
      isPremium
      isFeatured
      isOnSpecial
      isStandard
      adFlasher
      company {
        documentId
        name
        location
        isFeatured
      }
      inquiries_c {
        documentId
      }
      inquiries {
        documentId
      }
    }
    
    # Get all companies/manufacturers
    companies {
      documentId
      name
      location
      isFeatured
      listings {
        documentId
      }
    }
    
    # Get all inquiries (if available)
    inquiries {
      documentId
      listing {
        documentId
        title
        company {
          name
        }
      }
    }
  }
`;

// Helper function to calculate dashboard metrics from raw data
export const calculateDashboardMetrics = (data) => {
  if (!data) return null;

  const { listings, companies, inquiries } = data;

  // Calculate total counts
  const totalListings = listings?.length || 0;
  const totalManufacturers = companies?.length || 0;
  const totalInquiries = inquiries?.length || 0;

  // Calculate listing types
  const premiumListings = listings?.filter(l => l.isPremium) || [];
  const featuredListings = listings?.filter(l => l.isFeatured) || [];
  const standardListings = listings?.filter(l => l.isStandard) || [];
  const specialListings = listings?.filter(l => l.isOnSpecial) || [];

  // Calculate top performing listings (by inquiries)
  const listingsWithInquiries = listings?.map(listing => ({
    ...listing,
    inquiryCount: (listing.inquiries_c?.length || 0) + (listing.inquiries?.length || 0)
  })).sort((a, b) => b.inquiryCount - a.inquiryCount).slice(0, 10) || [];

  // Calculate top manufacturers (by listings and inquiries)
  const manufacturersWithStats = companies?.map(company => {
    const companyListings = listings?.filter(l => l.company?.documentId === company.documentId) || [];
    const totalCompanyInquiries = companyListings.reduce((sum, listing) => {
      return sum + (listing.inquiries_c?.length || 0) + (listing.inquiries?.length || 0);
    }, 0);
    
    return {
      ...company,
      listingCount: companyListings.length,
      inquiryCount: totalCompanyInquiries,
      avgResponse: "2.5h", // Mock data for now
      rating: 4.5 // Mock data for now
    };
  }).sort((a, b) => b.inquiryCount - a.inquiryCount).slice(0, 10) || [];

  // Calculate geographic distribution
  const geographicData = {};
  listings?.forEach(listing => {
    const location = listing.company?.location || 'Unknown';
    if (!geographicData[location]) {
      geographicData[location] = { listings: 0, inquiries: 0, visits: 0 };
    }
    geographicData[location].listings += 1;
    geographicData[location].inquiries += (listing.inquiries_c?.length || 0) + (listing.inquiries?.length || 0);
    geographicData[location].visits += Math.floor(Math.random() * 100) + 50; // Mock visits data
  });

  // Convert to array format
  const geographicArray = Object.entries(geographicData).map(([province, data]) => ({
    province,
    ...data
  })).sort((a, b) => b.listings - a.listings);

  // Create recent activity based on available data
  const recentActivity = [
    ...listingsWithInquiries.slice(0, 3).map((listing, index) => ({
      id: `listing-${index}`,
      type: "listing",
      message: `Top performing listing: ${listing.title}`,
      time: "Recently",
      manufacturer: listing.company?.name || 'Unknown'
    })),
    ...manufacturersWithStats.slice(0, 2).map((manufacturer, index) => ({
      id: `manufacturer-${index}`,
      type: "manufacturer",
      message: `Active manufacturer: ${manufacturer.name}`,
      time: "Recently",
      manufacturer: manufacturer.name
    }))
  ];

  return {
    overview: {
      totalListings,
      totalManufacturers,
      totalInquiries,
      totalVisits: totalListings * 45, // Mock calculation
      totalFavorites: Math.floor(totalListings * 0.3), // Mock calculation
      activeUsers: Math.floor(totalListings * 0.2) // Mock calculation
    },
    trends: {
      listingsGrowth: 12.5, // Mock data
      inquiriesGrowth: 8.3, // Mock data
      visitsGrowth: 15.2, // Mock data
      manufacturersGrowth: 5.7 // Mock data
    },
    topListings: listingsWithInquiries.map((listing, index) => ({
      id: listing.documentId,
      title: listing.title,
      manufacturer: listing.company?.name || 'Unknown',
      visits: Math.floor(Math.random() * 1000) + 500, // Mock data
      inquiries: listing.inquiryCount,
      conversion: ((listing.inquiryCount / (Math.floor(Math.random() * 1000) + 500)) * 100).toFixed(1)
    })),
    topManufacturers: manufacturersWithStats.map((manufacturer, index) => ({
      id: manufacturer.documentId,
      name: manufacturer.name,
      listings: manufacturer.listingCount,
      inquiries: manufacturer.inquiryCount,
      avgResponse: manufacturer.avgResponse,
      rating: manufacturer.rating
    })),
    recentActivity,
    geographicData: geographicArray,
    listingTypes: {
      premium: premiumListings.length,
      featured: featuredListings.length,
      standard: standardListings.length,
      special: specialListings.length
    }
  };
}; 