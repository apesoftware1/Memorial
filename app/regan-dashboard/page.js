"use client";

import { useQuery } from '@apollo/client';
import { GET_MANUFACTURERS } from '@/graphql/queries/getManufacturers';
import { useState, useEffect } from 'react';
import { Search, ChevronDown, LogOut } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Import shadcn UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { loading, error, data } = useQuery(GET_MANUFACTURERS);
  
  // State for search filters
  const [searchFilters, setSearchFilters] = useState({
    manufacturerName: "",
    stoneType: "",
    location: "",
  });

  // State for displayed manufacturers
  const [displayedManufacturers, setDisplayedManufacturers] = useState([]);
  const [filteredManufacturers, setFilteredManufacturers] = useState([]);
  const [displayCount, setDisplayCount] = useState(9); // Number of manufacturers to display initially

  // Handle logout
  const handleLogout = async () => {
    try {
      localStorage.removeItem("manufacturerSession");
      localStorage.removeItem("advertCreatorCompany");
      sessionStorage.removeItem("advertCreatorCompany");
      await signOut({ callbackUrl: '/', redirect: true });
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/');
    }
  };

  // Check authentication and admin status
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/manufacturers/login-page");
      return;
    }
    if (status === "authenticated" && session && !session.user.isAdmin) {
      router.push("/manufacturers/manufacturers-Profile-Page");
    }
  }, [status, session, router]);

  // Update filtered manufacturers when data changes or filters change
  useEffect(() => {
    if (data?.companies) {
      const filtered = data.companies.filter(manufacturer => {
        const nameMatch = manufacturer.name.toLowerCase().includes(searchFilters.manufacturerName.toLowerCase());
        const locationMatch = searchFilters.location === "" || 
          manufacturer.location.toLowerCase().includes(searchFilters.location.toLowerCase());
        return nameMatch && locationMatch;
      });
      
      setFilteredManufacturers(filtered);
      setDisplayedManufacturers(filtered.slice(0, displayCount));
    }
  }, [data, searchFilters, displayCount]);

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 9);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top-level conditional UI (single return keeps hook order stable) */}
      {loading ? (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-8 w-full max-w-md" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-lg" />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <h2 className="text-xl font-bold text-destructive">Error</h2>
            </CardHeader>
            <CardContent>
              <p>Failed to load dashboard data. Please try again later.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <>
          {/* Header with Manufacturer Name and Logout Button */}
          <div className="bg-black text-white py-6 shadow-md">
            <div className="container mx-auto px-4 flex justify-between items-center">
              <h1 className="text-3xl font-bold">Manufacturer Dashboard</h1>
              <Button onClick={handleLogout} variant="destructive" className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-gray-800 py-6 shadow-inner">
            <div className="container mx-auto px-4">
              <form onSubmit={handleSearchSubmit} className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      name="manufacturerName"
                      value={searchFilters.manufacturerName}
                      onChange={handleSearchChange}
                      placeholder="Search by manufacturer name"
                      className="pl-10"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      name="location"
                      value={searchFilters.location}
                      onChange={handleSearchChange}
                      placeholder="Filter by location"
                      className="pl-10"
                    />
                  </div>
                  <Button type="submit" className="md:w-auto">
                    Search
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Main Content */}
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {filteredManufacturers.length} Manufacturers Found
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedManufacturers.map((manufacturer) => (
                <ManufacturerCard key={manufacturer.documentId} manufacturer={manufacturer} />
              ))}
            </div>

            {displayedManufacturers.length < filteredManufacturers.length && (
              <div className="flex justify-center mt-8">
                <Button 
                  onClick={handleLoadMore}
                  variant="outline"
                  size="lg"
                  className="border-primary/20 hover:border-primary"
                >
                  Load More
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Manufacturer Card Component
function ManufacturerCard({ manufacturer }) {
  // Change the profile URL to point to the company performance page
  const profileUrl = `/regan-dashboard/${manufacturer.documentId}`;
  
  return (
    <Link href={profileUrl} className="block h-full">
      <Card className="h-full hover:shadow-md transition-shadow overflow-hidden flex flex-col">
        {/* Logo */}
        <div className="relative h-48 bg-white border-b">
          <Image
            src={manufacturer.logoUrl || '/placeholder-logo.png'}
            alt={manufacturer.name}
            fill
            className="object-contain p-4"
          />
        </div>
        
        {/* Content */}
        <CardContent className="p-5 flex-grow flex flex-col">
          <h3 className="font-bold text-lg mb-2">{manufacturer.name}</h3>
          
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">
            {manufacturer.description || 'No description available'}
          </p>
          
          <div className="mt-auto">
            <div className="text-primary font-semibold text-sm mb-2">
              {manufacturer.listings?.length || 0} Tombstones Listed
            </div>
            
            <div className="flex items-center text-muted-foreground text-xs">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{manufacturer.location || 'Location not specified'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}