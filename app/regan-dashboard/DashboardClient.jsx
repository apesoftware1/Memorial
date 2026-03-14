"use client";

import { useQuery } from '@apollo/client';
import { GET_MANUFACTURERS } from '@/graphql/queries/getManufacturers';
import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Search, LogOut, Moon, Sun, PanelLeft } from 'lucide-react';
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
import { Checkbox } from "@/components/ui/checkbox";
import ListingCategoryManager from "./ListingCategoryManager";
import { useProgressiveQuery } from "@/hooks/useProgressiveQuery"
import { cloudinaryOptimized } from "@/lib/cloudinary";
import {
  MANUFACTURERS_INITIAL_QUERY,
  MANUFACTURERS_FULL_QUERY,
  MANUFACTURERS_DELTA_QUERY,
} from '@/graphql/queries/getManufacturers';

const FILTER_OPTIONS = [
  { key: "minPrice", label: "Min Price" },
  { key: "maxPrice", label: "Max Price" },
  { key: "location", label: "Location" },
  { key: "style", label: "Head Style" },
  { key: "slabStyle", label: "Slab Style" },
  { key: "stoneType", label: "Stone Type" },
  { key: "colour", label: "Colour" },
  { key: "custom", label: "Customisation" },
];

const FILTER_OPTION_VALUES = {
  minPrice: [
    "R 1,000",
    ...Array.from(
      { length: 40 },
      (_, i) => `R ${(5000 + i * 5000).toLocaleString()}`
    ),
  ],
  maxPrice: [
    "R 1,000",
    ...Array.from(
      { length: 40 },
      (_, i) => `R ${(5000 + i * 5000).toLocaleString()}`
    ),
    "R 200,000+",
  ],
  location: [
    "Gauteng",
    "Western Cape",
    "KwaZulu-Natal",
    "Eastern Cape",
    "Free State",
    "Limpopo",
    "Northern Cape",
    "Mpumalanga",
    "North west",
  ],
  style: [
    "Christian Cross",
    "Heart",
    "Bible",
    "Pillars",
    "Traditional African",
    "Abstract",
    "Praying Hands",
    "Scroll",
    "Angel",
    "Mausoleum",
    "Obelisk",
    "Plain",
    "Teddy Bear",
    "Butterfly",
    "Car",
    "Bike",
    "Sports",
    "Wave",
    "Church",
    "House",
    "Square",
    "Organic",
    "Arch",
  ],
  slabStyle: [
    "Curved Slab",
    "Frame with Infill",
    "Full Slab",
    "Glass Slab",
    "Half Slab",
    "Stepped Slab",
    "Tiled Slab",
    "Double",
  ],
  stoneType: [
    "Biodegradable",
    "Brass",
    "Ceramic/Porcelain",
    "Composite",
    "Concrete",
    "Copper",
    "Glass",
    "Granite",
    "Limestone",
    "Marble",
    "Perspex",
    "Quartzite",
    "Sandstone",
    "Slate",
    "Steel",
    "Stone",
    "Tile",
    "Wood",
  ],
  custom: [
    "Bronze/Stainless Plaques",
    "Ceramic Photo Plaques",
    "Flower Vases",
    "Gold Lettering",
    "Inlaid Glass",
    "Photo Laser-Edging",
    "QR Code",
  ],
  colour: [
    "Black",
    "Blue",
    "Green",
    "Grey-Dark",
    "Grey-Light",
    "Maroon",
    "Pearl",
    "Red",
    "White",
    "Gold",
    "Yellow",
    "Pink",
  ],
};

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

export default function DashboardClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
 
    const { loading, error, data } = useProgressiveQuery({
      initialQuery: MANUFACTURERS_INITIAL_QUERY,
      fullQuery: MANUFACTURERS_FULL_QUERY,
      deltaQuery: MANUFACTURERS_DELTA_QUERY,
      variables: {},
      storageKey: 'manufacturers:lastUpdated',
      refreshInterval: 60000,
    });
  // Local dark-mode state scoped to this page
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isDark, setIsDark] = useState(false);
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [currentView, setCurrentView] = useState('manufacturers');
  const [filterVisibility, setFilterVisibility] = useState({ hidden: [], hiddenOptions: {}, updatedAt: "" });
  const [filterVisibilityLoading, setFilterVisibilityLoading] = useState(false);
  const [filterVisibilitySaving, setFilterVisibilitySaving] = useState(false);
  const [filterVisibilityError, setFilterVisibilityError] = useState("");
  const [expandedFilters, setExpandedFilters] = useState([]);

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      setHeaderHeight(Math.round(rect.height));
    };

    measure();

    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => measure());
      ro.observe(el);
    }
    window.addEventListener("resize", measure);

    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

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
        const res = await fetch("/api/maintenance-mode", { next: { revalidate: 60 } });
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

  useEffect(() => {
    const loadFilterVisibility = async () => {
      if (!session?.user?.isAdmin) return;
      try {
        setFilterVisibilityError("");
        setFilterVisibilityLoading(true);
        const res = await fetch("/api/filter-visibility", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        setFilterVisibility({
          hidden: Array.isArray(json?.hidden) ? json.hidden : [],
          hiddenOptions:
            json?.hiddenOptions && typeof json.hiddenOptions === "object"
              ? json.hiddenOptions
              : {},
          updatedAt: typeof json?.updatedAt === "string" ? json.updatedAt : "",
        });
      } catch {
      } finally {
        setFilterVisibilityLoading(false);
      }
    };
    loadFilterVisibility();
  }, [session?.user?.isAdmin]);

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

  const isHidden = (key) => filterVisibility.hidden.includes(key);

  const getHiddenOptionSet = (key) =>
    new Set(Array.isArray(filterVisibility?.hiddenOptions?.[key]) ? filterVisibility.hiddenOptions[key] : []);

  const toggleHidden = (key) => {
    setFilterVisibility((prev) => {
      const set = new Set(Array.isArray(prev.hidden) ? prev.hidden : []);
      if (set.has(key)) set.delete(key);
      else set.add(key);
      return { ...prev, hidden: Array.from(set.values()) };
    });
  };

  const toggleHiddenOption = (key, value) => {
    setFilterVisibility((prev) => {
      const currentObj = prev?.hiddenOptions && typeof prev.hiddenOptions === "object" ? prev.hiddenOptions : {};
      const currentArr = Array.isArray(currentObj?.[key]) ? currentObj[key] : [];
      const set = new Set(currentArr);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      return {
        ...prev,
        hiddenOptions: { ...currentObj, [key]: Array.from(set.values()) },
      };
    });
  };

  const isOptionHidden = (key, value) => getHiddenOptionSet(key).has(value);

  const toggleExpanded = (key) => {
    setExpandedFilters((prev) => {
      const set = new Set(Array.isArray(prev) ? prev : []);
      if (set.has(key)) set.delete(key);
      else set.add(key);
      return Array.from(set.values());
    });
  };

  const saveFilterVisibility = async () => {
    try {
      setFilterVisibilityError("");
      setFilterVisibilitySaving(true);
      const res = await fetch("/api/filter-visibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hidden: filterVisibility.hidden,
          hiddenOptions: filterVisibility.hiddenOptions,
        }),
      });
      if (!res.ok) {
        setFilterVisibilityError("Failed to save settings");
        return;
      }
      const json = await res.json();
      setFilterVisibility({
        hidden: Array.isArray(json?.hidden) ? json.hidden : [],
        hiddenOptions:
          json?.hiddenOptions && typeof json.hiddenOptions === "object"
            ? json.hiddenOptions
            : {},
        updatedAt: typeof json?.updatedAt === "string" ? json.updatedAt : "",
      });
    } catch {
      setFilterVisibilityError("Failed to save settings");
    } finally {
      setFilterVisibilitySaving(false);
    }
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
            <div ref={headerRef} className="bg-black text-white py-6 shadow-md">
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

            {(() => {
              const sidebarNav = (
                <div className="p-4 space-y-2">
                  <button
                    className={`w-full text-left px-3 py-2 rounded-md font-medium ${
                      currentView === "manufacturers"
                        ? "bg-primary text-primary-foreground"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                    }`}
                    onClick={() => setCurrentView("manufacturers")}
                  >
                    Manufacturers
                  </button>
                  <button
                    className={`w-full text-left px-3 py-2 rounded-md font-medium ${
                      currentView === "categories"
                        ? "bg-primary text-primary-foreground"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                    }`}
                    onClick={() => setCurrentView("categories")}
                  >
                    Update Category
                  </button>
                  {session?.user?.isAdmin ? (
                    <button
                      className={`w-full text-left px-3 py-2 rounded-md font-medium ${
                        currentView === "admin"
                          ? "bg-primary text-primary-foreground"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                      }`}
                      onClick={() => setCurrentView("admin")}
                    >
                      Hide Filters
                    </button>
                  ) : null}
                </div>
              );

              return (
                <>
                  <aside className="md:hidden border-b bg-white dark:bg-gray-900 dark:border-gray-700">
                    {sidebarNav}
                  </aside>

                  <div className="relative">
                    <div
                      className="hidden md:block fixed left-0 z-40 group"
                      style={{
                        top: `${headerHeight}px`,
                        bottom: 0,
                      }}
                    >
                      <div className="h-full w-12 group-hover:w-64 transition-[width] duration-200 ease-out overflow-hidden">
                        <aside className="h-full w-64 border-r border-transparent bg-transparent group-hover:bg-white group-hover:border-gray-200 dark:border-transparent dark:bg-transparent dark:group-hover:bg-gray-900 dark:group-hover:border-gray-700">
                          <div className="h-12 flex items-center">
                            <div className="w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 border-l-0 rounded-r-md shadow-sm">
                              <PanelLeft className="h-5 w-5 text-gray-800 dark:text-gray-200" />
                            </div>
                          </div>
                          <div className="opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200">
                            {sidebarNav}
                          </div>
                        </aside>
                      </div>
                    </div>

                    <main className="w-full md:pl-12">
                {currentView === "manufacturers" ? (
                  <>
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
                ) : currentView === "categories" ? (
                  <div className="container mx-auto px-4 py-8">
                    <ListingCategoryManager />
                  </div>
                ) : (
                  <div className="container mx-auto px-4 py-8 max-w-3xl">
                    <Card>
                      <CardHeader>
                        <h2 className="text-xl font-bold">Hide Filters</h2>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {filterVisibilityLoading ? (
                          <div className="text-sm text-muted-foreground">Loading settings…</div>
                        ) : (
                          <div className="space-y-3">
                            {FILTER_OPTIONS.map((opt) => (
                              <div key={opt.key} className="rounded-md border p-3">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="text-sm font-medium">{opt.label}</div>
                                  <div className="flex items-center gap-3">
                                    <div className="text-xs text-muted-foreground">Hide filter</div>
                                    <Checkbox
                                      checked={isHidden(opt.key)}
                                      onCheckedChange={() => toggleHidden(opt.key)}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => toggleExpanded(opt.key)}
                                      className="text-xs font-medium underline"
                                    >
                                      {expandedFilters.includes(opt.key) ? "Hide options" : "Edit options"}
                                    </button>
                                  </div>
                                </div>

                                {expandedFilters.includes(opt.key) ? (
                                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-auto pr-2">
                                    {(FILTER_OPTION_VALUES?.[opt.key] || []).map((val) => (
                                      <div key={val} className="flex items-center justify-between gap-2">
                                        <div className="text-xs">{val}</div>
                                        <div className="flex items-center gap-2">
                                          <div className="text-[10px] text-muted-foreground">Hide</div>
                                          <Checkbox
                                            checked={isOptionHidden(opt.key, val)}
                                            onCheckedChange={() => toggleHiddenOption(opt.key, val)}
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        )}
                        {filterVisibilityError ? (
                          <div className="text-sm text-destructive">{filterVisibilityError}</div>
                        ) : null}
                      </CardContent>
                      <CardFooter className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          {filterVisibility.updatedAt ? `Updated: ${new Date(filterVisibility.updatedAt).toLocaleString()}` : ""}
                        </div>
                        <Button onClick={saveFilterVisibility} disabled={filterVisibilitySaving}>
                          {filterVisibilitySaving ? "Saving…" : "Save"}
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                )}
                    </main>
                  </div>
                </>
              );
            })()}
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
