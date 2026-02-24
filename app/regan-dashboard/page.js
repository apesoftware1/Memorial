"use client";

import { useQuery } from '@apollo/client';
import { GET_MANUFACTURERS } from '@/graphql/queries/getManufacturers';
import { useState, useEffect } from 'react';
import { Search, LogOut, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Import shadcn UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import ListingCategoryManager from "./ListingCategoryManager";
import { useProgressiveQuery } from "@/hooks/useProgressiveQuery"
import { cloudinaryOptimized } from "@/lib/cloudinary";
import {
  MANUFACTURERS_INITIAL_QUERY,
  MANUFACTURERS_FULL_QUERY,
  MANUFACTURERS_DELTA_QUERY,
} from '@/graphql/queries/getManufacturers';

// Floating Action Button to navigate to blogs page
function FloatingBlogsButton() {
  return (
    <Link
      href="/regan-dashboard/blogs"
      aria-label="Open Blogs Admin"
      className="fixed bottom-6 right-6 z-50"
    >
      <Button
        className="rounded-full w-14 h-14 p-0 shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
        title="Blogs"
      >
        {/* Book or document icon to represent articles */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h11a1 1 0 001-1v-1h-9a3 3 0 01-3-3V2z" />
          <path d="M9 4h8a1 1 0 011 1v12h-9a1 1 0 01-1-1V4z" />
        </svg>
      </Button>
    </Link>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
 
    const { loading, error, data } = useProgressiveQuery({
      initialQuery: MANUFACTURERS_INITIAL_QUERY,
      fullQuery: MANUFACTURERS_FULL_QUERY,
      deltaQuery: MANUFACTURERS_DELTA_QUERY,
      variables: {},
      storageKey: 'manufacturers:lastUpdated',
      refreshInterval: 3000,
    });
  // Local dark-mode state scoped to this page
  const [isDark, setIsDark] = useState(false);
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [currentView, setCurrentView] = useState('manufacturers');

  // Initialize theme from localStorage so it controls both pages
  useEffect(() => {
    try {
      const stored = localStorage.getItem('reganDashboardTheme');
      if (stored) setIsDark(stored === 'dark');
    } catch {}
  }, []);

  useEffect(() => {
    const loadMaintenance = async () => {
      try {
        setMaintenanceLoading(true);
        const res = await fetch("/api/maintenance-mode");
        if (!res.ok) return;
        const data = await res.json();
        setMaintenanceEnabled(!!data?.enabled);
      } catch {
      } finally {
        setMaintenanceLoading(false);
      }
    };
    loadMaintenance();
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('reganDashboardTheme', next ? 'dark' : 'light');
      } catch {}
      return next;
    });
  };

  const toggleMaintenance = async () => {
    try {
      const next = !maintenanceEnabled;
      setMaintenanceEnabled(next);
      await fetch("/api/maintenance-mode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled: next }),
      });
    } catch {
    }
  };

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
    <div className={isDark ? "dark" : ""}>
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
                <div className="flex flex-col gap-1">
                  <h1 className="text-3xl font-bold">Manufacturer Dashboard</h1>
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <span>Maintenance banner</span>
                    <Switch
                      checked={maintenanceEnabled}
                      onCheckedChange={toggleMaintenance}
                      disabled={maintenanceLoading}
                    />
                    <span className="ml-1">
                      {maintenanceEnabled ? "On" : "Off"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                    className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm bg-background text-foreground hover:bg-accent"
                    title="Toggle theme"
                  >
                    {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </button>
                  <Button onClick={handleLogout} variant="destructive" className="gap-2">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>

            {/* View Switcher */}
            <div className="bg-white border-b dark:bg-gray-900 dark:border-gray-700">
                <div className="container mx-auto px-4">
                    <div className="flex space-x-4">
                        <button
                            className={`py-4 px-2 border-b-2 font-medium ${currentView === 'manufacturers' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setCurrentView('manufacturers')}
                        >
                            Manufacturers
                        </button>
                        <button
                            className={`py-4 px-2 border-b-2 font-medium ${currentView === 'categories' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setCurrentView('categories')}
                        >
                            Listing Categories
                        </button>
                    </div>
                </div>
            </div>

            {currentView === 'manufacturers' ? (
              <>
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
            ) : (
              <div className="container mx-auto px-4 py-8">
                <ListingCategoryManager />
              </div>
            )}
            {/* FAB */}
            <FloatingBlogsButton />
          </>
        )}
      </div>
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
            src={cloudinaryOptimized(manufacturer.logoUrl, 300) || '/placeholder-logo.png'}
            alt={manufacturer.name}
            fill
            className="object-contain p-4"
            unoptimized
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
