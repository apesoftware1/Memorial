import { manufacturerProfileSlugs, premiumListings } from '@/lib/data';
import ManufacturerProfileEditor from '../page';

export default function ManufacturerProfilePage({ params }) {
  const { slug } = params;
  const manufacturerName = Object.keys(manufacturerProfileSlugs).find(
    key => manufacturerProfileSlugs[key] === slug
  );

  if (!manufacturerName) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#888' }}>
        404 | This manufacturer profile could not be found.
      </div>
    );
  }

  // Filter listings for this manufacturer (strict equality)
  const listings = premiumListings.filter(l => l.manufacturer === manufacturerName);
  console.log('Filtered listings for', manufacturerName, listings);

  // Render the profile page as a guest (no edit buttons), passing manufacturerName and listings
  return <ManufacturerProfileEditor isOwner={false} manufacturerName={manufacturerName} listings={listings} />;
} 