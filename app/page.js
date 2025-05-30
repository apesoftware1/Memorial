"use client"

import { useState, useRef, useEffect, useCallback, memo } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown, Check, Info, X, LandmarkIcon as Monument, Landmark, Layers, Square } from "lucide-react"
import { ClientOnly } from "@/components/client-only"
import { useFavorites } from "@/context/favorites-context"
import { ProductCard } from "@/components/product-card"
import { PremiumListingCard } from "@/components/premium-listing-card"
import { StandardListingCard } from "@/components/standard-listing-card"
import SearchBox from "@/components/SearchBox"
import CategoryTabs from "@/components/CategoryTabs.jsx"
import FaqSection from "@/components/FaqSection"
import LocationModal from "@/components/LocationModal"
import FilterDropdown from "@/components/FilterDropdown"
import FeaturedListings from '@/components/FeaturedListings'
import SearchForm from "@/components/SearchForm"
import SearchContainer from "@/components/SearchContainer.jsx"
import Pagination from "@/components/Pagination"

// Static data moved outside component
  const filterOptions = {
  minPrice: [
    "R 5,001",
    "R 10,001",
    "R 15,001",
    "R 20,001",
    "R 25,001",
    "R 30,001",
    "R 40,001",
    "R 50,001",
    "R 75,001",
    "R 100,001",
    "R 150,001",
    "R 200,001"
  ],
  maxPrice: [
    "R 10,000",
    "R 15,000",
    "R 20,000",
    "R 25,000",
    "R 30,000",
    "R 40,000",
    "R 50,000",
    "R 75,000",
    "R 100,000",
    "R 150,000",
    "R 200,000",
    "R 200,000+"
  ],
    colour: ["Black", "White", "Grey", "Brown", "Blue Pearl", "Red"],
    designTheme: ["Cross", "Angel", "Heart", "Book", "Traditional", "Modern", "Custom"],
    location: ["Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", "Free State"],
    stoneType: ["Granite", "Marble", "Sandstone", "Limestone", "Bronze"],
    culture: ["Christian", "Jewish", "Muslim", "Hindu", "Traditional African"],
    custom: ["Engraving", "Photo", "Gold Leaf", "Special Shape", "Lighting"],
    bodyType: ["Full Tombstone", "Headstone", "Double Headstone", "Cremation Memorial", "Family Monument", "Child Memorial", "Custom Design"],
};

  const locationsData = [
  { id: 'all', name: 'All locations', count: 11 },
  { id: 'gauteng', name: 'Gauteng', count: 2 },
  { id: 'western-cape', name: 'Western Cape', count: 1 },
  { id: 'kwazulu-natal', name: 'KwaZulu Natal', count: 1 },
  { id: 'north-west', name: 'North West', count: 0 },
  { id: 'mpumalanga', name: 'Mpumalanga', count: 0 },
  { id: 'eastern-cape', name: 'Eastern Cape', count: 0 },
  { id: 'free-state', name: 'Free State', count: 1 },
  { id: 'limpopo', name: 'Limpopo', count: 0 },
  { id: 'northern-cape', name: 'Northern Cape', count: 0 },
];

  const faqData = [
    {
      question: "How much does a Tombstone cost?",
    answer: "The cost of a tombstone in South Africa can range from R4,000 to R40,000 or more, depending on the size, material, and complexity of the design. Basic tombstones might fall within the R8,000 - R15,000 range, while premium or custom designs can cost significantly more. The final price will depend on various factors, with material and design being the most important factors that will impact the overall budget.",
    },
    {
      question: "How do I find a Tombstone Manufacturer?",
    answer: "You can find a tombstone manufacturer by using our search tool. Simply enter your location and preferences to see a list of manufacturers in your area.",
    },
    {
      question: "What materials are used to make a Tombstone?",
    answer: "Common materials used for tombstones include granite, marble, sandstone, limestone, and bronze. Granite is the most popular due to its durability and resistance to weathering.",
    },
    {
      question: "What Design elements do I look for?",
    answer: "Consider design elements such as shape, size, color, engravings, religious symbols, and personalized features that reflect the personality of your loved one.",
    },
    {
      question: "How long does a Tombstone take to be made?",
    answer: "The production time for a tombstone typically ranges from 4-12 weeks, depending on the complexity of the design, material availability, and customization requirements.",
    },
    {
      question: "Can I add personal photos, engravings or special designs?",
    answer: "Yes, most manufacturers offer personalization options including photo engravings, custom text, special designs, and even QR codes linking to memorial websites.",
    },
    {
      question: "Are there ways whereby I can finance a Tombstone?",
    answer: "Many manufacturers offer payment plans, and there are also funeral policies and insurance options that can cover tombstone costs. Some manufacturers may offer layaway plans or installment options.",
    },
];

  const categoryBackgrounds = {
    "TOMBSTONES": "/2560(w)x400px(h)_Banner_OldYoungCouple.jpg",
    "PREMIUM": "/2560(w)x400px(h)_Banner_OldYoungCouple.jpg",
    "FAMILY": "/2560(w)x400px(h)_Banner_OldYoungCouple.jpg",
    "CHILD": "/2560(w)x400px(h)_Banner_OldYoungCouple.jpg",
    "HEAD": "/2560(w)x400px(h)_Banner_OldYoungCouple.jpg",
    "CREMATION": "/2560(w)x400px(h)_Banner_OldYoungCouple.jpg",
};

  const featuredListings = [
    {
      id: "white-Cross",
      image: "/X20Tombstone_Pic Sets/cross1/Cross_Main.jpg",
      price: "R 10 200",
      title: "WHITE CROSS...",
      details: "Full Tombstone | Granite | Cross Theme",
      tag: "Great Price",
    },
    {
      id: "white-angel",
      image: "/X20Tombstone_Pic Sets/bible/Bible_Main.jpg",
      price: "R 28 500",
      title: "WHITE ANGEL...",
      details: "Full Tombstone | Granite | Bible Theme",
      tag: "Great Price",
    },
    {
      id: "gold-cross",
      image: "/X20Tombstone_Pic Sets/cross2/Cross2_Main.jpg",
      price: "R 19 900",
      title: "GOLD CROSS...",
      details: "Full Tombstone | Marble | Cross Theme",
      tag: "Great Price",
    },
];

  const premiumListings = [
    {
      id: "cathedral-c14",
      image: "/X20Tombstone_Pic Sets/flower/Flower_Main.jpg",
      thumbnailImages: [
        "/X20Tombstone_Pic Sets/flower/Flower_1.jpg",
        "/X20Tombstone_Pic Sets/flower/Flower_2.jpg"
      ],
      price: "R 8 820",
      title: "CATHEDRAL C14",
      details: "Full Tombstone | Granite | Cross Theme",
      features: "Photo Engraving Available | Self Install & Pick-Up Available",
      manufacturer: "Example Tombstone Co.",
      enquiries: "21",
      location: "Durban North, KZN",
      distance: "38km from you",
      tag: "Unique Design",
      tagColor: "bg-red-600 hover:bg-red-700",
      tagRingColor: "red-400",
    },
    {
      id: "elegant-marble",
      image: "/X20Tombstone_Pic Sets/cross3/Cross2_Main.jpg",
      thumbnailImages: [
        "/X20Tombstone_Pic Sets/cross3/Cross2_1.jpg",
        "/X20Tombstone_Pic Sets/cross3/Cross2_2.jpg",
        "/X20Tombstone_Pic Sets/cross3/Cross2_3.jpg",
      ],
      price: "R 12 450",
      title: "ELEGANT MARBLE MEMORIAL",
      details: "Full Tombstone | Marble | Angel Theme",
      features: "Gold Leaf Lettering Available | Delivery Included",
      manufacturer: "Marble Masters",
      enquiries: "15",
      location: "Cape Town, Western Cape",
      distance: "120km from you",
      tag: "Premium Quality",
      tagColor: "bg-blue-600 hover:bg-blue-700",
      tagRingColor: "blue-400",
    },
    {
      id: "black-granite",
      image: "/X20Tombstone_Pic Sets/mausoleam/mausoleam_main.jpg",
      thumbnailImages: [
        "/X20Tombstone_Pic Sets/mausoleam/mausoleam_1.jpg",
        "/X20Tombstone_Pic Sets/mausoleam/mausoleam_2.jpg",
        "/X20Tombstone_Pic Sets/mausoleam/mausoleam_3.jpg",
      ],
      price: "R 15 750",
      title: "BLACK GRANITE MEMORIAL",
      details: "Full Tombstone | Black Granite | Modern Theme",
      features: "Laser Engraving | 5-Year Warranty",
      manufacturer: "Granite Specialists",
      enquiries: "32",
      location: "Johannesburg, Gauteng",
      distance: "25km from you",
      tag: "Best Seller",
      tagColor: "bg-purple-600 hover:bg-purple-700",
      tagRingColor: "purple-400",
    },
    {
      id: "traditional-double",
      image: "/X20Tombstone_Pic Sets/mausoleam2/Mausoleam2_Main.jpg",
      thumbnailImages: [
        "/X20Tombstone_Pic Sets/mausoleam2/Mausoleam2_1.jpg",
        "/X20Tombstone_Pic Sets/mausoleam2/Mausoleam2_2.jpg",
        "/X20Tombstone_Pic Sets/mausoleam2/Mausoleam2_Main.jpg",
      ],
      price: "R 22 980",
      title: "TRADITIONAL DOUBLE HEADSTONE",
      details: "Double Tombstone | Granite | Traditional Theme",
      features: "Dual Inscription | Installation Included",
      manufacturer: "Family Memorials Ltd",
      enquiries: "18",
      location: "Bloemfontein, Free State",
      distance: "210km from you",
      tag: "Family Option",
      tagColor: "bg-green-600 hover:bg-green-700",
      tagRingColor: "green-400",
    },
    {
      id: "cultural-heritage",
      image: "/X20Tombstone_Pic Sets/bigbible_mainPIc/BigBible_Main.jpg",
      thumbnailImages: [
        "/X20Tombstone_Pic Sets/bigbible_mainPIc/BigBible_Main.jpg",
        "/X20Tombstone_Pic Sets/bigbible_mainPIc/BigBible_Main.jpg",
        "/X20Tombstone_Pic Sets/bigbible_mainPIc/BigBible_Main.jpg"
      ],
      price: "R 18 350",
      title: "CULTURAL HERITAGE MEMORIAL",
      details: "Full Tombstone | Granite & Bronze | Cultural Theme",
      features: "Custom Cultural Symbols | Multilingual Inscriptions",
      manufacturer: "Heritage Memorials",
      enquiries: "24",
      location: "Pretoria, Gauteng",
      distance: "45km from you",
      tag: "Cultural Design",
      tagColor: "bg-amber-600 hover:bg-amber-700",
      tagRingColor: "amber-400",
    },
    {
      id: "modern-abstract",
      image: "/X20Tombstone_Pic Sets/Abstract/Abstract_Main.jpg",
      thumbnailImages: [
        "/X20Tombstone_Pic Sets/Abstract/Abstract_1.jpg",
        "/X20Tombstone_Pic Sets/Abstract/Abstract_2.jpg",
        "/X20Tombstone_Pic Sets/Abstract/Abstract_3.jpg",
      ],
      price: "R 21 000",
      title: "MODERN ABSTRACT SCULPTURE",
      details: "Sculpture | Granite | Abstract Theme",
      features: "Unique Shape | Artistic Design | Custom Engraving",
      manufacturer: "Artful Memorials",
      enquiries: "19",
      location: "Cape Town, Western Cape",
      distance: "110km from you",
      tag: "Artistic",
      tagColor: "bg-teal-600 hover:bg-teal-700",
      tagRingColor: "teal-400",
    },
    {
      id: "garden-style-marker",
      image: "/X20Tombstone_Pic Sets/stepped/Stepped_Main.jpg",
      thumbnailImages: [
        "/X20Tombstone_Pic Sets/stepped/Stepped_1.jpg",
        "/X20Tombstone_Pic Sets/stepped/Stepped_2.jpg",
        "/X20Tombstone_Pic Sets/stepped/Stepped_3.jpg",
      ],
      price: "R 7 500",
      title: "GARDEN STYLE FLAT MARKER",
      details: "Flat Marker | Bronze | Nature Theme",
      features: "Integrated Vase | Low Profile | Durable Bronze",
      manufacturer: "Bronze Crafters",
      enquiries: "14",
      location: "Durban, KZN",
      distance: "60km from you",
      tag: "Garden Accent",
      tagColor: "bg-yellow-600 hover:bg-yellow-700",
      tagRingColor: "yellow-400",
    },
    {
      id: "religious-themed-upright",
      image: "/X20Tombstone_Pic Sets/cross1/Cross_Main.jpg",
      thumbnailImages: [
        "/X20Tombstone_Pic Sets/cross1/Cross_1.jpg",
        "/X20Tombstone_Pic Sets/cross1/Cross_2.jpg",
        "/X20Tombstone_Pic Sets/cross1/Cross_3.jpg",
      ],
      price: "R 16 500",
      title: "RELIGIOUS THEMED UPRIGHT",
      details: "Upright Tombstone | Granite | Religious Theme",
      features: "Cross/Star of David/Crescent Symbol | Custom Verses",
      manufacturer: "Sacred Stones",
      enquiries: "35",
      location: "Johannesburg, Gauteng",
      distance: "20km from you",
      tag: "Faith Inspired",
      tagColor: "bg-orange-600 hover:bg-orange-700",
      tagRingColor: "orange-400",
    },
    {
      id: "companion-bench-memorial",
      image: "/X20Tombstone_Pic Sets/mausoleam3/mausoleam3_main.jpg",
      thumbnailImages: [
        "/X20Tombstone_Pic Sets/mausoleam3/mausoleam3_1.jpg",
        "/X20Tombstone_Pic Sets/mausoleam3/mausoleam3_2.jpg",
        "/X20Tombstone_Pic Sets/mausoleam3/mausoleam3_3.jpg",
      ],
      price: "R 25 000",
      title: "COMPANION BENCH MEMORIAL",
      details: "Bench Memorial | Granite | Shared Theme",
      features: "Seating Area | Double Inscription | Durable",
      manufacturer: "Comforting Creations",
      enquiries: "22",
      location: "Pretoria, Gauteng",
      distance: "55km from you",
      tag: "Shared Memory",
      tagColor: "bg-brown-600 hover:bg-brown-700",
      tagRingColor: "brown-400",
    },
    {
      id: "unique-child-design",
      image: "/X20Tombstone_Pic Sets/child/Child_Main.jpg",
      thumbnailImages: [
        "/X20Tombstone_Pic Sets/child/Child_1.jpg",
        "/X20Tombstone_Pic Sets/child/Child_2.jpg",
        "/X20Tombstone_Pic Sets/child/Child_3.jpg",
      ],
      price: "R 8 000",
      title: "UNIQUE CHILD MEMORIAL DESIGN",
      details: "Child Memorial | Marble | Custom Design",
      features: "Personalized Artwork | Smaller Scale",
      manufacturer: "Little Angels Memorials",
      enquiries: "9",
      location: "Bloemfontein, Free State",
      tag: "Personalized",
      tagColor: "bg-pink-400 hover:bg-pink-500",
      tagRingColor: "pink-200",
    },
];

  const manufacturerProducts = [
    {
      id: "royal-granite",
      image: "/X20Tombstone_Pic Sets/Glass/Glass_Main.jpg",
      price: "R 14 500",
      title: "ROYAL GRANITE",
      details: "Full Tombstone | Black Granite | Royal Theme",
      tag: "Premium",
    },
    {
      id: "dove-memorial",
      image: "/X20Tombstone_Pic Sets/Head/Head_Main.jpg",
      price: "R 9 750",
      title: "DOVE MEMORIAL",
      details: "Headstone | White Marble | Dove Theme",
      tag: "Great Price",
    },
    {
      id: "family-monument",
      image: "/X20Tombstone_Pic Sets/stepped/Stepped_Main.jpg",
      price: "R 22 800",
      title: "FAMILY MONUMENT",
      details: "Double Tombstone | Granite | Traditional",
      tag: "Family Size",
    },
];

  // Standard listings data (using the 5 items provided by the user)
  const standardListings = [
    {
      id: "modern-abstract-sculpture",
      image: "/X20Tombstone_Pic Sets/Abstract/Abstract_Main.jpg",
      thumbnailImages: [
        "/X20Tombstone_Pic Sets/Abstract/Abstract_1.jpg",
        "/X20Tombstone_Pic Sets/Abstract/Abstract_2.jpg",
        "/X20Tombstone_Pic Sets/Abstract/Abstract_3.jpg"
      ],
      price: "R 21 000",
      title: "MODERN ABSTRACT SCULPTURE",
      details: "Sculpture | Granite | Abstract Theme",
      features: "Unique Shape | Artistic Design | Custom Engraving",
      manufacturer: "Artful Memorials",
      enquiries: "0",
      location: "Cape Town, Western Cape",
      distance: "110km from you",
      tag: "Artistic",
      tagColor: "bg-teal-600 hover:bg-teal-700",
      tagRingColor: "teal-400",
    },
    {
      id: "garden-style-flat-marker",
      image: "/X20Tombstone_Pic Sets/stepped/Stepped_Main.jpg",
      thumbnailImages: [
        "/X20Tombstone_Pic Sets/stepped/Stepped_1.jpg",
        "/X20Tombstone_Pic Sets/stepped/Stepped_2.jpg",
        "/X20Tombstone_Pic Sets/stepped/Stepped_3.jpg"
      ],
      price: "R 7 500",
      title: "GARDEN STYLE FLAT MARKER",
      details: "Flat Marker | Bronze | Nature Theme",
      features: "Integrated Vase | Low Profile | Durable Bronze",
      manufacturer: "Bronze Crafters",
      enquiries: "0",
      location: "Durban, KZN",
      distance: "60km from you",
      tag: "Garden Accent",
      tagColor: "bg-yellow-600 hover:bg-yellow-700",
      tagRingColor: "yellow-400",
    },
    {
      id: "religious-themed-upright",
      image: "/X20Tombstone_Pic Sets/cross1/Cross_Main.jpg",
      thumbnailImages: [
        "/X20Tombstone_Pic Sets/cross1/Cross_1.jpg",
        "/X20Tombstone_Pic Sets/cross1/Cross_2.jpg",
        "/X20Tombstone_Pic Sets/cross1/Cross_3.jpg"
      ],
      price: "R 16 500",
      title: "RELIGIOUS THEMED UPRIGHT",
      details: "Upright Tombstone | Granite | Religious Theme",
      features: "Cross/Star of David/Crescent Symbol | Custom Verses",
      manufacturer: "Sacred Stones",
      enquiries: "0",
      location: "Johannesburg, Gauteng",
      distance: "20km from you",
      tag: "Faith Inspired",
      tagColor: "bg-orange-600 hover:bg-orange-700",
      tagRingColor: "orange-400",
    },
    {
      id: "companion-bench-memorial",
      image: "/X20Tombstone_Pic Sets/mausoleam3/mausoleam3_main.jpg",
      thumbnailImages: [
        "/X20Tombstone_Pic Sets/mausoleam3/mausoleam3_1.jpg",
        "/X20Tombstone_Pic Sets/mausoleam3/mausoleam3_2.jpg",
        "/X20Tombstone_Pic Sets/mausoleam3/mausoleam3_3.jpg"
      ],
      price: "R 25 000",
      title: "COMPANION BENCH MEMORIAL",
      details: "Bench Memorial | Granite | Shared Theme",
      features: "Seating Area | Double Inscription | Durable",
      manufacturer: "Comforting Creations",
      enquiries: "0",
      location: "Pretoria, Gauteng",
      distance: "55km from you",
      tag: "Shared Memory",
      tagColor: "bg-brown-600 hover:bg-brown-700",
      tagRingColor: "brown-400",
    },
    {
      id: "unique-child-memorial-design",
      image: "/X20Tombstone_Pic Sets/child/Child_Main.jpg",
      thumbnailImages: [
        "/X20Tombstone_Pic Sets/child/Child_1.jpg",
        "/X20Tombstone_Pic Sets/child/Child_2.jpg",
        "/X20Tombstone_Pic Sets/child/Child_3.jpg"
      ],
      price: "R 8 000",
      title: "UNIQUE CHILD MEMORIAL DESIGN",
      details: "Child Memorial | Marble | Custom Design",
      features: "Personalized Artwork | Smaller Scale",
      manufacturer: "Little Angels Memorials",
      enquiries: "0",
      location: "Bloemfontein, Free State",
      distance: "38km from you",
      tag: "Personalized",
      tagColor: "bg-pink-400 hover:bg-pink-500",
      tagRingColor: "pink-200",
    },
];

export default function Home() {
  // Combined state for UI controls
  const [uiState, setUiState] = useState({
    mobileMenuOpen: false,
    mobileDropdown: null,
    showAllOptions: false,
    openDropdown: null,
    searchDropdownOpen: false,
    locationModalOpen: false,
    activeTooltip: null
  });

  // State for filter selections
  const [filters, setFilters] = useState({
    minPrice: null,
    maxPrice: null,
    colour: null,
    designTheme: null,
    location: null,
    stoneType: null,
    culture: null,
    custom: null,
  });

  // State for selected category
  const [selectedCategory, setSelectedCategory] = useState("TOMBSTONES");
  const [selectedTown, setSelectedTown] = useState(null);

  // Add the useFavorites hook to the component
  const { totalFavorites } = useFavorites();

  // Close dropdowns when clicking outside
  const dropdownRefs = useRef({})

  // Memoized event handlers
  const handleClickOutside = useCallback((event) => {
    if (uiState.openDropdown && dropdownRefs.current[uiState.openDropdown] && !dropdownRefs.current[uiState.openDropdown].contains(event.target)) {
      setUiState(prev => ({ ...prev, openDropdown: null }))
    }
    if (uiState.searchDropdownOpen && dropdownRefs.current['search'] && !dropdownRefs.current['search'].contains(event.target)) {
      setUiState(prev => ({ ...prev, searchDropdownOpen: false }))
    }
    if (uiState.openDropdown === 'location' && dropdownRefs.current['location'] && !dropdownRefs.current['location'].contains(event.target)) {
      setUiState(prev => ({ ...prev, openDropdown: null }))
    }
  }, [uiState.openDropdown, uiState.searchDropdownOpen]);

  const handleTownSelect = useCallback((town) => {
    setSelectedTown(town)
    setUiState(prev => ({ ...prev, searchDropdownOpen: false }))
  }, []);

  const toggleDropdown = useCallback((name) => {
    if (name === 'location' && window.innerWidth < 640) {
      setUiState(prev => ({ ...prev, locationModalOpen: true, openDropdown: null }))
    } else {
      setUiState(prev => ({ ...prev, openDropdown: prev.openDropdown === name ? null : name }))
    }
  }, []);

  const selectOption = useCallback((name, option) => {
    setFilters(prev => ({
      ...prev,
      [name]: option,
    }))
    setUiState(prev => ({ ...prev, openDropdown: null }))
    if (name === 'location') {
      setUiState(prev => ({ ...prev, locationModalOpen: false }))
    }
  }, []);

  const handleMobileMenuToggle = useCallback(() => {
    setUiState(prev => ({ ...prev, mobileMenuOpen: !prev.mobileMenuOpen }))
  }, []);

  const handleMobileDropdownToggle = useCallback((section) => {
    setUiState(prev => ({ ...prev, mobileDropdown: prev.mobileDropdown === section ? null : section }))
  }, []);

  const handleShowAllOptionsToggle = useCallback(() => {
    setUiState(prev => ({ ...prev, showAllOptions: !prev.showAllOptions }))
  }, []);

  const handleTooltipToggle = useCallback((index) => {
    setUiState(prev => ({ ...prev, activeTooltip: prev.activeTooltip === index ? null : index }))
  }, []);

  const handleSearchDropdownToggle = useCallback(() => {
    setUiState(prev => ({ ...prev, searchDropdownOpen: !prev.searchDropdownOpen }))
  }, []);

  const handleLocationModalClose = useCallback(() => {
    setUiState(prev => ({ ...prev, locationModalOpen: false }))
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [handleClickOutside])

  // Add these functions before the return statement
  const handleLocationSelect = (province) => {
    // This function is no longer needed as location selection is handled by the integrated component logic
  }

  const getDisplayValue = () => {
    if (selectedTown) {
      return `${selectedTown}, ${filters.location}`
    } else if (filters.location) {
      return filters.location
    }
    return ""
  }

  // Memoized components
  const MemoizedFaqTooltip = memo(({ faq, index }) => {
    return (
      <div className="relative">
        <button
          className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 text-sm flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 group w-full justify-between text-left"
          onClick={() => handleTooltipToggle(index)}
          aria-expanded={uiState.activeTooltip === index}
          style={{
            clipPath: 'polygon(0% 0%, 97% 0%, 100% 50%, 97% 100%, 0% 100%)',
          }}
        >
          <span className="flex items-center">
            {index === 0 && <span className="mr-1">→</span>}
            {faq.question}
          </span>
          <Info className="h-3 w-3 opacity-70 flex-shrink-0" />
        </button>

        {uiState.activeTooltip === index && (
          <div className="absolute z-50 mt-2 w-72 bg-white rounded-md shadow-lg border border-gray-200 p-3 text-sm text-gray-700 animate-slide-in">
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-bold text-gray-900">{faq.question}</h4>
              <button onClick={() => handleTooltipToggle(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p>{faq.answer}</p>
          </div>
        )}
      </div>
    )
  });

  const MemoizedBannerAd = memo(() => (
    <div className="max-w-4xl mx-auto my-6 border border-gray-300 rounded overflow-hidden">
      <Link href="https://ads.google.com" target="_blank" rel="noopener noreferrer">
        <div className="relative h-24 bg-gray-100 flex items-center justify-center">
          <p className="text-gray-500 text-sm">Banner Ad (Animated Gif - Linked to Google Ads)</p>
          <div className="absolute top-1 right-1 bg-gray-200 px-1 text-xs text-gray-500 rounded">Ad</div>
        </div>
      </Link>
    </div>
  ));

  const MemoizedFeaturedListingCard = memo(({ product }) => (
    <div className="border border-gray-300 rounded bg-white p-4 hover:shadow-md transition-shadow">
      <Image
        src={product.image || "/placeholder.svg"}
        alt={product.title}
        width={300}
        height={200}
        className="mb-2 rounded"
      />
      <h4 className="font-semibold text-gray-800">{product.title}</h4>
      <p className="text-gray-600 text-sm">{product.details}</p>
      <p className="text-gray-900 font-bold">{product.price}</p>
      {product.tag && (
        <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full inline-block mt-2">
          {product.tag}
        </div>
      )}
    </div>
  ));

  // Function to filter listings based on selected filters
  const getFilteredListings = useCallback(() => {
    let filteredListings = [...premiumListings, ...featuredListings, ...manufacturerProducts];

    // Filter by category tab
    if (selectedCategory !== "TOMBSTONES") {
      filteredListings = filteredListings.filter(listing => {
        const details = listing.details?.toLowerCase() || '';
        switch (selectedCategory) {
          case "PREMIUM":
            return listing.tag?.toLowerCase().includes('premium') || 
                   listing.tagColor?.includes('blue') || 
                   listing.tagColor?.includes('purple');
          case "FAMILY":
            return details.includes('family') || 
                   listing.tag?.toLowerCase().includes('family') ||
                   details.includes('double');
          case "CHILD":
            return details.includes('child') || 
                   listing.tag?.toLowerCase().includes('child');
          case "HEAD":
            return details.includes('headstone') || 
                   details.includes('head stone');
          case "CREMATION":
            return details.includes('cremation') || 
                   details.includes('urn');
          default:
            return true;
        }
      });
    }

    // Filter by price range
    if (filters.minPrice || filters.maxPrice) {
      filteredListings = filteredListings.filter(listing => {
        if (!listing.price) return false;
        const price = parseInt(listing.price.replace(/[^0-9]/g, ''));
        const minPrice = filters.minPrice ? parseInt(filters.minPrice.replace(/[^0-9]/g, '')) : 0;
        const maxPrice = filters.maxPrice ? parseInt(filters.maxPrice.replace(/[^0-9]/g, '')) : Infinity;
        return price >= minPrice && price <= maxPrice;
      });
    }

    // Filter by location
    if (filters.location && filters.location !== 'All locations') {
      filteredListings = filteredListings.filter(listing => 
        listing.location && listing.location.includes(filters.location)
      );
    }

    // Filter by body type
    if (filters.bodyType) {
      filteredListings = filteredListings.filter(listing => 
        listing.details && listing.details.toLowerCase().includes(filters.bodyType.toLowerCase())
      );
    }

    // Filter by design theme
    if (filters.designTheme) {
      filteredListings = filteredListings.filter(listing => 
        listing.details && listing.details.toLowerCase().includes(filters.designTheme.toLowerCase())
      );
    }

    // Filter by stone type
    if (filters.stoneType) {
      filteredListings = filteredListings.filter(listing => 
        listing.details && listing.details.toLowerCase().includes(filters.stoneType.toLowerCase())
      );
    }

    // Filter by culture
    if (filters.culture) {
      filteredListings = filteredListings.filter(listing => 
        listing.details && listing.details.toLowerCase().includes(filters.culture.toLowerCase())
      );
    }

    // Filter by custom features
    if (filters.custom) {
      filteredListings = filteredListings.filter(listing => 
        listing.features && listing.features.toLowerCase().includes(filters.custom.toLowerCase())
      );
    }

    return filteredListings;
  }, [filters, selectedCategory]);

  // Get filtered listings count
  const filteredCount = getFilteredListings().length;

  // Add loading state
  const [isSearching, setIsSearching] = useState(false);

  // Function to handle search
  const handleSearch = useCallback(() => {
    setIsSearching(true);
    const results = getFilteredListings();
    // Simulate a small delay to show loading state
    setTimeout(() => {
      setIsSearching(false);
      // Here you can add additional search functionality
      console.log('Search results:', results);
    }, 800); // 800ms delay to show loading animation
  }, [getFilteredListings]);

  // Update search button text based on category
  const getSearchButtonText = () => {
    if (isSearching) {
      return (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Searching...
        </div>
      );
    }
    const categoryText = selectedCategory === "TOMBSTONES" ? "" : ` in ${selectedCategory}`;
    return `Search ${filteredCount} Tombstones${categoryText}`;
  };

  // Add search suggestions data
  const searchSuggestions = [
    "tombstone", "headstone", "gravestone", "grave marker", "memorial stone",
    "grave headstone", "granite tombstone", "marble headstone", "custom tombstone",
    "engraved headstone", "cemetery stone", "funeral stone", "affordable tombstone",
    "cheap headstone", "baby tombstone", "pet tombstone", "family headstone",
    "double headstone", "upright tombstone", "flat marker", "cross headstone",
    "black granite", "white marble", "angel tombstone", "Christian headstone",
    "Muslim tombstone", "personalized tombstone", "traditional tombstone",
    "modern headstone", "classic tombstone", "photo headstone", "cemetery monument",
    "memorial plaque", "burial stone", "tombstone engraving", "engraved plaque",
    "cremation memorial", "grave design", "headstone shop", "tombstone supplier",
    "buy tombstone", "headstone prices", "tombstone catalogue", "gravestone near me",
    "headstone for child", "veteran headstone", "memorial design", "online tombstone",
    "tombstone for sale", "cemetery headstone"
  ];

  // Add state for search input and suggestions
  const [searchInput, setSearchInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  // Function to handle search input changes
  const handleSearchInputChange = useCallback((value) => {
    setSearchInput(value);
    if (value.trim()) {
      const filtered = searchSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered.slice(0, 5)); // Show top 5 matches
      setShowSuggestions(true);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);

  // Function to handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion) => {
    setSearchInput(suggestion);
    setShowSuggestions(false);
    // You can add additional logic here to trigger search with the selected suggestion
  }, []);

  // Split premium listings into two sections
  const premiumListingsSection1 = premiumListings.slice(0, 5);
  const premiumListingsSection2 = premiumListings.slice(5, 10);

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Show 10 items per page (5 premium + 5 standard)

  // Calculate total pages based on all listings
  const totalListings = premiumListings.length + standardListings.length;
  const totalPages = Math.ceil(totalListings / itemsPerPage);

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">TombstoneFinder.CO.ZA</h1>

            {/* Desktop Navigation with Dropdowns */}
            <nav className="ml-4 md:ml-8 hidden md:flex">
              {/* Find a Tombstone Dropdown */}
              <div className="relative group">
                <button className="px-2 md:px-3 py-2 text-xs md:text-sm text-gray-700 hover:text-gray-900 transition-colors flex items-center">
                  Find a Tombstone
                  <ChevronDown className="ml-1 h-3 w-3 md:h-4 md:w-4" />
                </button>
                <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 hidden group-hover:block animate-slide-in z-50">
                  <div className="py-1">
                    <Link
                      href="/tombstones-for-sale"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      TOMBSTONES FOR SALE
                    </Link>
                    <Link
                      href="/tombstones-on-special"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      TOMBSTONES ON SPECIAL
                    </Link>
                  </div>
                </div>
              </div>

              {/* Find a Manufacturer Dropdown */}
              <div className="relative group">
                <button className="px-2 md:px-3 py-2 text-xs md:text-sm text-gray-700 hover:text-gray-900 transition-colors flex items-center">
                  Find a Manufacturer
                  <ChevronDown className="ml-1 h-3 w-3 md:h-4 md:w-4" />
                </button>
                <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 hidden group-hover:block animate-slide-in z-50">
                  <div className="py-1">
                    <Link
                      href="/manufacturers"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      MANUFACTURERS
                    </Link>
                  </div>
                </div>
              </div>

              {/* Services Dropdown */}
              <div className="relative group">
                <button className="px-2 md:px-3 py-2 text-xs md:text-sm text-gray-700 hover:text-gray-900 transition-colors flex items-center">
                  Services
                  <ChevronDown className="ml-1 h-3 w-3 md:h-4 md:w-4" />
                </button>
                <div className="absolute left-0 mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200 hidden group-hover:block animate-slide-in z-50">
                  <div className="py-1">
                    <Link
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      LET US HANDLE EVERYTHING
                    </Link>
                    <Link
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      TOMBSTONE FINANCE
                    </Link>
                    <Link
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      TOMBSTONE INSTALLATION GUIDE
                    </Link>
                  </div>
                </div>
              </div>

              {/* Favourites Dropdown */}
              <div className="relative group">
                <button className="px-2 md:px-3 py-2 text-xs md:text-sm text-gray-700 hover:text-gray-900 transition-colors flex items-center">
                  Favourites
                  <ChevronDown className="ml-1 h-3 w-3 md:h-4 md:w-4" />
                </button>
                <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 hidden group-hover:block animate-slide-in z-50">
                  <div className="py-1">
                    <Link
                      href="/favorites"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-between"
                    >
                      <span>FAVOURITES</span>
                      {totalFavorites > 0 ? (
                        <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {totalFavorites}
                        </span>
                      ) : null}
                    </Link>
                  </div>
                </div>
              </div>
            </nav>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={handleMobileMenuToggle}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Login/Register Dropdown */}
          <div className="hidden md:block relative group">
            <button className="text-teal-500 text-xs md:text-sm hover:text-teal-600 transition-colors flex items-center">
              Login / Register
              <ChevronDown className="ml-1 h-3 w-3 md:h-4 md:w-4" />
            </button>
            <div className="absolute right-0 mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200 hidden group-hover:block animate-slide-in z-50">
              <div className="py-1">
                <Link
                  href="/login/manufacturer"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  MANUFACTURERS LOGIN PORTAL
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation - Slide from right */}
        <nav
          className={`fixed top-0 right-0 bottom-0 w-3/4 max-w-xs bg-white px-4 py-16 md:hidden border-l border-gray-200 shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${uiState.mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            onClick={handleMobileMenuToggle}
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>

          {/* Mobile Find a Tombstone */}
          <div className="py-2">
            <button
              className="flex justify-between items-center w-full text-gray-700 hover:text-gray-900 transition-colors"
              onClick={() => handleMobileDropdownToggle("tombstone")}
            >
              <span>Find a Tombstone</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${uiState.mobileDropdown === "tombstone" ? "transform rotate-180" : ""}`}
              />
            </button>
            {uiState.mobileDropdown === "tombstone" && (
              <div className="pl-4 mt-2 space-y-2">
                <Link
                  href="/tombstones-for-sale"
                  className="block py-1 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  TOMBSTONES FOR SALE
                </Link>
                <Link
                  href="/tombstones-on-special"
                  className="block py-1 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  TOMBSTONES ON SPECIAL
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Find a Manufacturer */}
          <div className="py-2">
            <button
              className="flex justify-between items-center w-full text-gray-700 hover:text-gray-900 transition-colors"
              onClick={() => handleMobileDropdownToggle("manufacturer")}
            >
              <span>Find a Manufacturer</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${uiState.mobileDropdown === "manufacturer" ? "transform rotate-180" : ""}`}
              />
            </button>
            {uiState.mobileDropdown === "manufacturer" && (
              <div className="pl-4 mt-2">
                <Link href="/manufacturers" className="block py-1 text-gray-600 hover:text-gray-900 transition-colors">
                  MANUFACTURERS
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Services */}
          <div className="py-2">
            <button
              className="flex justify-between items-center w-full text-gray-700 hover:text-gray-900 transition-colors"
              onClick={() => handleMobileDropdownToggle("services")}
            >
              <span>Services</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${uiState.mobileDropdown === "services" ? "transform rotate-180" : ""}`}
              />
            </button>
            {uiState.mobileDropdown === "services" && (
              <div className="pl-4 mt-2 space-y-2">
                <Link href="#" className="block py-1 text-gray-600 hover:text-gray-900 transition-colors">
                  LET US HANDLE EVERYTHING
                </Link>
                <Link href="#" className="block py-1 text-gray-600 hover:text-gray-900 transition-colors">
                  TOMBSTONE FINANCE
                </Link>
                <Link href="#" className="block py-1 text-gray-600 hover:text-gray-900 transition-colors">
                  TOMBSTONE INSTALLATION GUIDE
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Favourites */}
          <div className="py-2">
            <button
              className="flex justify-between items-center w-full text-gray-700 hover:text-gray-900 transition-colors"
              onClick={() => handleMobileDropdownToggle("favourites")}
            >
              <span>Favourites</span>
              {totalFavorites > 0 ? (
                <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full mr-2">
                  {totalFavorites}
                </span>
              ) : (
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${uiState.mobileDropdown === "favourites" ? "transform rotate-180" : ""}`}
                />
              )}
            </button>
            {uiState.mobileDropdown === "favourites" && (
              <div className="pl-4 mt-2">
                <Link href="/favorites" className="block py-1 text-gray-600 hover:text-gray-900 transition-colors">
                  FAVOURITES
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Login/Register */}
          <div className="py-2">
            <button
              className="flex justify-between items-center w-full text-teal-500 hover:text-teal-600 transition-colors"
              onClick={() => handleMobileDropdownToggle("login")}
            >
              <span>Login / Register</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${uiState.mobileDropdown === "login" ? "transform rotate-180" : ""}`}
              />
            </button>
            {uiState.mobileDropdown === "login" && (
              <div className="pl-4 mt-2">
                <Link
                  href="/login/manufacturer"
                  className="block py-1 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  MANUFACTURERS LOGIN PORTAL
                </Link>
              </div>
            )}
          </div>
        </nav>
        {/* Overlay when mobile menu is open */}
        {uiState.mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={handleMobileMenuToggle}
          ></div>
        )}
      </header>

      {/* Hero Section with Search */}
      <section className="relative flex items-center justify-center bg-[#333]">
        {/* Background Image - Hidden on mobile */}
        <div className="absolute inset-0 z-0 hidden sm:block">
          <Image
            src={categoryBackgrounds[selectedCategory] || "/2560(w)x400px(h)_Banner_OldYoungCouple.jpg"}
            alt={`${selectedCategory} background`}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full md:max-w-lg md:ml-32 md:mr-auto flex flex-col items-center h-full md:pt-8">
          {/* Category Tabs Container */}
          <CategoryTabs
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />

          {/* Main Search Box */}
          <SearchContainer
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            filters={filters}
            setFilters={setFilters}
            setSelectedTown={setSelectedTown}
            handleSearch={handleSearch}
            locationsData={locationsData}
            filterOptions={filterOptions}
            isSearching={isSearching}
            getSearchButtonText={getSearchButtonText}
            locationModalOpen={uiState.locationModalOpen}
            handleLocationModalClose={handleLocationModalClose}
            parentToggleDropdown={toggleDropdown}
          />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-8">
        <div className="container mx-auto px-4">
          <FaqSection />
        </div>
      </section>

      {/* Location Selection Modal (Mobile Only) */}
      <LocationModal
        isOpen={uiState.locationModalOpen}
        onClose={handleLocationModalClose}
        locationsData={locationsData}
        onSelectLocation={(locationName) => selectOption('location', locationName)}
      />

      {/* Following the order from the image */}

      {/* 1. Banner Ad (Animated Gif - Linked to Google Ads) */}
      <MemoizedBannerAd />

      {/* 2. X3 Featured Listings */}
      <FeaturedListings listings={featuredListings} />

      {/* 3. X5 Premium Listings */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-center text-gray-600 border-b border-gray-300 pb-2 mb-4">PREMIUM LISTINGS</h3>
            <p className="text-center text-xs text-gray-500 mb-4">*Sponsored</p>

            <div className="space-y-6">
              {premiumListingsSection1.map((listing) => (
                <div key={listing.id}>
                  <PremiumListingCard listing={listing} href={`/memorial/${listing.id}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Banner Ad (Animated Gif - Linked to Google Ads) */}
      <MemoizedBannerAd />

      {/* 5. X5 Premium Listings */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-center text-gray-600 border-b border-gray-300 pb-2 mb-4">PREMIUM LISTINGS</h3>
            <p className="text-center text-xs text-gray-500 mb-4">*Sponsored</p>

            <div className="space-y-6">
              {premiumListingsSection2.map((listing) => (
                <div key={listing.id}>
                  <PremiumListingCard listing={listing} href={`/memorial/${listing.id}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Featured Manufacturer */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-center text-gray-600 mb-2">Featured Manufacturer</h3>
            <p className="text-center text-xs text-gray-500 mb-4">*Sponsored</p>

            <div className="border border-gray-300 rounded bg-white p-4 mb-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
                <div>
                  <h4 className="font-bold text-gray-800 text-xl mb-1">ABC Tombstones PTY Ltd</h4>
                </div>
                <div>
                  <Image
                    src="/placeholder.svg"
                    alt="ABC Tombstones Logo"
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                </div>
              </div>
              <Link
                href="#"
                className="text-blue-600 text-sm hover:text-blue-700 hover:underline transition-colors inline-block mt-2"
              >
                View more matching tombstones
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {manufacturerProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Standard Listings */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-center text-gray-600 border-b border-gray-300 pb-2 mb-4">STANDARD LISTINGS</h3>
            <p className="text-center text-xs text-gray-500 mb-4">*Non-Sponsored</p>

            <div className="space-y-6">
              {standardListings.map((listing) => (
                <Link key={listing.id} href={`/memorial/${listing.id}`}>
                  <StandardListingCard listing={listing} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. Banner Ad (Animated Gif - Linked to Google Ads) */}
      <MemoizedBannerAd />

      {/* 9. Standard Listings */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-center text-gray-600 border-b border-gray-300 pb-2 mb-4">STANDARD LISTINGS</h3>
            <p className="text-center text-xs text-gray-500 mb-4">*Non-Sponsored</p>

            <div className="space-y-6">
              {standardListings.map((listing) => (
                <Link key={listing.id} href={`/memorial/${listing.id}`}>
                  <StandardListingCard listing={listing} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Add pagination just before footer */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">About TombstoneFinder.CO.ZA</h4>
              <p className="text-gray-600">
                TombstoneFinder.CO.ZA connects you with trusted tombstone manufacturers and suppliers across South Africa.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {["Home", "Find a Tombstone", "Find a Manufacturer", "Services", "Contact Us"].map((link, index) => (
                  <li key={index}>
                    <Link href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <address className="text-gray-300 text-sm not-italic">
                <p>Email: info@tombstonefinder.co.za</p>
                <p>Phone: +27 12 345 6789</p>
                <p>Address: 123 Memorial Street, Pretoria, South Africa</p>
              </address>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-4 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} TombstoneFinder.CO.ZA. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .more-options-slide {
          transform: translateX(100%);
          transition: transform 0.7s ease-in-out;
        }
        .more-options-slide.open {
          transform: translateX(0);
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.2s ease-out;
        }
      `}</style>
    </main>
  )
}