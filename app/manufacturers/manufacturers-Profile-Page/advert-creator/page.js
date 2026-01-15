'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import Image from "next/image"
import adFlasherOptions from '../../../../adFlasher.json'
import pricingAdFlasher from '../../../../pricingAdFlasher.json'
import { useApolloClient } from '@apollo/client'
import { GET_LISTINGS } from '@/graphql/queries/getListings'
import { useListingCategories } from '@/hooks/use-ListingCategories'
import { desiredOrder } from '@/lib/categories'
import { AlertTriangle } from 'lucide-react'

const colorOptions = [
  'Black',
  'Blue',
  'Green',
  'Grey-Dark',
  'Grey-Light',
  'Maroon',
  'Pearl',
  'Red',
  'White',
  'Mixed',
];
const styleOptions = [
  'Christian Cross',
  'Heart',
  'Bible',
  'Pillars',
  'Traditional African',
  'Abstract',
  'Praying Hands',
  'Scroll',
  'Angel',
  'Mausoleum',
  'Obelisk',
  'Plain',
  'Teddy Bear',
  'Butterfly',
  'Car',
  'Bike',
  'Sports',
];
const stoneTypeOptions = [
  'Biodegradable',
  'Brass',
  'Ceramic/Porcelain',
  'Composite',
  'Concrete',
  'Copper',
  'Glass',
  'Granite',
  'Limestone',
  'Marble',
  'Perspex',
  'Quartzite',
  'Sandstone',
  'Slate',
  'Steel',
  'Stone',
  'Tile',
  'Wood',
];

const customizationOptions = [
  'Bronze/Stainless Plaques',
  'Ceramic Photo Plaques',
  'Flower Vases',
  'Gold Lettering',
  'Inlaid Glass',
  'Photo Laser-Edging',
  'QR Code',
];

// Add slab style options
const slabStyleOptions = [
  'Curved Slab',
  'Frame with Infill',
  'Full Slab',
  'Glass Slab',
  'Half Slab',
  'Stepped Slab',
  'Tiled Slab',
  'Double',
];

const transportOptions = ['Free transport within 20km', 'Paid delivery']
const foundationOptions = ['Brick foundation', 'Cement base']
const warrantyOptions = ['5-year warranty', '10-year manufacturer warranty']

// Use numeric values that will be submitted (as strings via handleChange)
const manufacturingLeadTimeOptions = [1, 2, 3, 7, 10, 14, 21]

// Helper function to format manufacturing lead time display text
const formatManufacturingLeadTimeText = (days) => {
  if (days === 1) {
    return "X1 WORKING DAY AFTER POP (Proof of Payment)";
  }
  return `X${days} WORKING DAYS AFTER POP (Proof of Payment)`;
};

// Category icon map for Category Selection (Advert Creator)
const CATEGORY_ICON_MAP = {
  SINGLE: "/last_icons/MainCatergories_Icons_X6_AdvertCreator_Icons/MainCatergories_Icons_X6_AdvertCreator_Icons/Single.svg",
  DOUBLE: "/last_icons/MainCatergories_Icons_X6_AdvertCreator_Icons/MainCatergories_Icons_X6_AdvertCreator_Icons/MainCatergories_AdvertCreator_Icons_2_Double.svg",
  CHILD: "/last_icons/MainCatergories_Icons_X6_AdvertCreator_Icons/MainCatergories_Icons_X6_AdvertCreator_Icons/MainCatergories_AdvertCreator_Icons_3_Child.svg",
  HEAD: "/last_icons/MainCatergories_Icons_X6_AdvertCreator_Icons/MainCatergories_Icons_X6_AdvertCreator_Icons/MainCatergories_AdvertCreator_Icons_4_Head.svg",
  PLAQUES: "/last_icons/MainCatergories_Icons_X6_AdvertCreator_Icons/MainCatergories_Icons_X6_AdvertCreator_Icons/MainCatergories_AdvertCreator_Icons_5-Plaques.svg",
  CREMATION: "/last_icons/MainCatergories_Icons_X6_AdvertCreator_Icons/MainCatergories_Icons_X6_AdvertCreator_Icons/MainCatergories_AdvertCreator_Icons_6_Cremation.svg",
};

export default function CreateListingForm() {
  const router = useRouter();
  const client = useApolloClient();
  const [company, setCompany] = useState(null);
  const { categories, loading: categoriesLoading, error: categoriesError } = useListingCategories();
  
  // Mobile warning state
  const [isMobileSmall, setIsMobileSmall] = useState(false);
  const [showMobileWarning, setShowMobileWarning] = useState(false);
  
  // Check if screen is small mobile on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      const isSmall = window.innerWidth < 640;
      setIsMobileSmall(isSmall);
      setShowMobileWarning(isSmall);
    };
    
    // Check on mount
    checkScreenSize();
    
    // Add resize listener
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  const sortedCategories = Array.isArray(categories)
      ? desiredOrder
          .map(name => categories.find(cat => cat?.name && cat.name.toUpperCase() === name))
          .filter(Boolean)
      : [];
  
  // Loading and success states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  // Add CSS animation for slideIn effect
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    adFlasher: '',
    // Remove these from the form, but keep in state as false
    isPremium: false,
    isFeatured: false,
    isOnSpecial: false,
    manufacturingTimeframe: '1',
    productDetails: {
      color: [],
      headStyle: [],
      stoneType: [],
      slabStyle: [],
      customization: []
    },
    additionalProductDetails: {
      transportAndInstallation: [],
      foundationOptions: [],
      warrantyOrGuarantee: [],
      manufacturingLeadTime: [] // ADDED: store the single selected lead time here
    },
    // Remove companyDocumentId from the form, but keep in state for payload
    companyDocumentId: '',
    categoryRefDocumentId: ''
  })

  // Load company data from sessionStorage
  useEffect(() => {
    const storedCompany = sessionStorage.getItem('advertCreatorCompany');
    if (storedCompany) {
      const companyData = JSON.parse(storedCompany);
      setCompany(companyData);
      setFormData((prev) => ({ ...prev, companyDocumentId: companyData.documentId }));
    } else {
      // Fallback: redirect back to profile if no company data
      router.push('/manufacturers/manufacturers-Profile-Page');
    }
  }, [router]);

  const [mainImage, setMainImage] = useState(null)
  const [thumbnails, setThumbnails] = useState(new Array(10).fill(null))
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [modalMsg, setModalMsg] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [expandedAdFlasherCategory, setExpandedAdFlasherCategory] = useState(null)
  const [badgeCategoryKey, setBadgeCategoryKey] = useState(null)
  const [priceMajor, setPriceMajor] = useState('')
  const [priceMinor, setPriceMinor] = useState('00')
  const [priceInput, setPriceInput] = useState('')

  // Optional preload of price display from existing formData.price
  useEffect(() => {
    if (formData?.price != null && formData.price !== '') {
      const [major, minor] = String(formData.price).split('.')
      setPriceMajor((major || '').replace(/[^\d]/g, ''))
      setPriceMinor((minor || '00').padEnd(2, '0').slice(0, 2))
      const v = String(formData.price).replace(/,/g, '').replace(/\s+/g, '')
      setPriceInput(v)
    }
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleDropdownChange = (section, field, value) => {
    setFormData((prev) => {
      const current = prev[section][field]
      const exists = current.includes(value)
      const updated = exists ? current.filter((v) => v !== value) : [...current, value]
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: updated
        }
      }
    })
  }

  const handleAdditionalProductDetailsChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      additionalProductDetails: {
        ...prev.additionalProductDetails,
        [field]: value ? [value] : []
      }
    }))
  }

  const handleManufacturingLeadTimeToggle = (days) => {
    setFormData((prev) => {
      const str = String(days);
      const isSelected = prev.additionalProductDetails.manufacturingLeadTime.includes(str);
      const nextArray = isSelected ? [] : [str];
      return {
        ...prev,
        manufacturingTimeframe: isSelected ? '' : str, // mirror into existing payload field
        additionalProductDetails: {
          ...prev.additionalProductDetails,
          manufacturingLeadTime: nextArray,
        },
      };
    });
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
    setFormData((prev) => ({
      ...prev,
      categoryRefDocumentId: category.documentId
    }))
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    
    if (name === 'mainImage') {
      setMainImage(files[0])
      
    } else if (name === 'thumbnails') {
      setThumbnails(Array.from(files).slice(0, 5))
     
    }
  }

  const handleThumbnailChange = (e, index) => {
    const file = e.target.files[0]
    
    if (file) {
      const newThumbnails = [...thumbnails]
      newThumbnails[index] = file
      setThumbnails(newThumbnails)
      
    }
  }

  const handlePriceMajorChange = (e) => {
    const raw = e.target.value.replace(/[^\d]/g, '')
    setPriceMajor(raw)
    const major = parseInt(raw || '0', 10)
    const minor = parseInt((priceMinor || '0').slice(0, 2), 10)
    const price = (major + minor / 100).toFixed(2)
    setFormData((prev) => ({ ...prev, price }))
  }

  const handlePriceMinorChange = (e) => {
    let raw = e.target.value.replace(/[^\d]/g, '').slice(0, 2)
    setPriceMinor(raw)
    const major = parseInt(priceMajor || '0', 10)
    const minor = parseInt(raw || '0', 10)
    const price = (major + minor / 100).toFixed(2)
    setFormData((prev) => ({ ...prev, price }))
  }

  const handlePriceChange = (e) => {
    const raw = e.target.value.replace(/,/g, '').replace(/\s+/g, '')
    if (!/^\d*\.?\d*$/.test(raw)) return
    setPriceInput(raw)
    if (raw === '') {
      setFormData((prev) => ({ ...prev, price: '' }))
    } else {
      const num = Number(raw)
      if (!Number.isNaN(num)) {
        setFormData((prev) => ({ ...prev, price: num.toFixed(2) }))
      }
    }
  }

  const handlePriceBlur = () => {
    if (priceInput === '') return
    const num = Number(priceInput)
    if (!Number.isNaN(num)) {
      const formatted = num.toFixed(2)
      setPriceInput(formatted)
      setFormData((prev) => ({ ...prev, price: formatted }))
    }
  }

  const handleToggleAdFlasherCategory = (category) => {
    setExpandedAdFlasherCategory((prev) => (prev === category ? null : category))
    setBadgeCategoryKey(category)
  }

  const handleSelectAdFlasher = (category, option) => {
    setFormData((prev) => ({ ...prev, adFlasher: option }))
  }

  const uploadToCloudinary = async (file) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    
    const uploadData = new FormData()
    uploadData.append('file', file)
    uploadData.append('upload_preset', 'listings')
    // uploadData.append('folder', 'myImages')
    // uploadData.append('transformation', 'w_800,h_600,c_limit,q_auto,f_auto')
    
    const res = await fetch(`https://api.cloudinary.com/v1_1/dtymvjhjq/image/upload`, {
      method: 'POST',
      body: uploadData
    })
    
    if (!res.ok) {
      const errorText = await res.text()
      console.error('Cloudinary upload failed:', res.status, errorText)
      throw new Error('Upload failed')
    }
    
    const data = await res.json()

    return data // Return the full Cloudinary response (url, public_id, etc.)
  }

  const handleCheckboxChange = (section, field, value, max) => {
    const currentSelected = formData[section][field];
    if (currentSelected.includes(value)) {
      // Remove the value
      const newSelected = currentSelected.filter(x => x !== value);
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: newSelected
        }
      }));
    } else if (currentSelected.length < max) {
      // Add the value
      const newSelected = [...currentSelected, value];
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: newSelected
        }
      }));
    } else {
      setModalMsg(`You can only add ${max} characteristics.`);
      setModalOpen(true);
    }
  };

  const COLOR_ICON_MAP = {
    Black: "/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Black.svg",
    Blue: "/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Blue.svg",
    Green: "/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Green.svg",
    "Grey-Dark": "/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Grey-Dark.svg",
    "Grey-Light": "/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Grey-Light.svg",
    Maroon: "/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Maroon.svg",
    Pearl: "/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Pearl.svg",
    White: "/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_White.svg",
    Mixed: "/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Mixed.svg",
    // Red icon not present in folder listing; add when available
    Red: "/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Red.svg",
  };

  const HEAD_STYLE_ICON_MAP = {
    "Christian Cross": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_ChristianCross.svg",
    "Heart": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Heart.svg",
    "Bible": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Bible.svg",
    "Pillars": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Pillars.svg",
    "Traditional African": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_TraditionalAfrican.svg",
    "Abstract": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Abstract.svg",
    "Praying Hands": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_PrayingHands.svg",
    "Scroll": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Scroll.svg",
    "Angel": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Angel.svg",
    "Mausoleum": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Mausolean.svg",
    "Obelisk": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Obelisk.svg",
    "Plain": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Plain.svg",
    "Teddy Bear": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_TeddyBear.svg",
    "Butterfly": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Butterfly.svg",
    "Car": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Car.svg",
    "Bike": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Bike.svg",
    "Sports": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Sport.svg",
  };



  // Stone Type icons map (corrected nested folder path)
  const STONE_TYPE_ICON_MAP = {
    "Biodegradable": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Biodegradable.svg",
    "Brass": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Brass.svg",
    "Ceramic/Porcelain": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Ceramic_Porcelain.svg",
    "Composite": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Composite.svg",
    "Concrete": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Concrete.svg",
    "Copper": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Copper.svg",
    "Glass": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Glass.svg",
    "Granite": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Granite.svg",
    "Limestone": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Limestone.svg",
    "Marble": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Marble.svg",
    "Perspex": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Perspex.svg",
    "Quartzite": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Quartzite.svg",
    "Sandstone": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Sandstone.svg",
    "Slate": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Slate.svg",
    "Steel": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Steel.svg",
    "Stone": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Stone.svg",
    "Tile": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Tile.svg",
    "Wood": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Wood.svg",
  };

  // Customization icons map
  const CUSTOMIZATION_ICON_MAP = {
    "Bronze/Stainless Plaques": "/last_icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_BronzeStainless Plaque.svg",
    "Ceramic Photo Plaques": "/last_icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_CeramicPhotoPlaque.svg",
    "Flower Vases": "/last_icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_FlowerVase.svg",
    "Gold Lettering": "/last_icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_GoldLettering.svg",
    "Inlaid Glass": "/last_icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_InlaidGlass.svg",
    "Photo Laser-Edging": "/last_icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_PhotoLaserEdginhg.svg",
    "QR Code": "/last_icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_QR Code.svg",
  };

  // Slab Style icons map
  const SLAB_STYLE_ICON_MAP = {
    "Curved Slab": "/last_icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_CurvedSlab.svg",
    "Frame with Infill": "/last_icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_FramewithInfill.svg",
    "Full Slab": "/last_icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_FullSlab.svg",
    "Glass Slab": "/last_icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_GlassSlab.svg",
    "Half Slab": "/last_icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_HalfSlab.svg",
    "Stepped Slab": "/last_icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_Stepped.svg",
    "Tiled Slab": "/last_icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_Tiled.svg",
  };

  const getIconPath = (type, value) => {
    switch (type) {
      case 'color': {
        const key = String(value).trim();
        return COLOR_ICON_MAP[key] || null;
      }
      case 'style': {
        const key = String(value).trim();
        return HEAD_STYLE_ICON_MAP[key] || '/new files/newIcons/Styles_Icons/Styles_Icons-11.svg';
      }
      case 'slabStyle': {
        const key = String(value).trim();
        return SLAB_STYLE_ICON_MAP[key] || '/new files/newIcons/Styles_Icons/Styles_Icons-11.svg';
      }
      case 'stoneType': {
        const key = String(value).trim();
        return STONE_TYPE_ICON_MAP[key] || null;
      }
      case 'customization': {
        const key = String(value).trim();
        return CUSTOMIZATION_ICON_MAP[key] || '/new files/newIcons/Custom_Icons/Custom_Icons-54.svg';
      }
      default:
        return null;
    }
  };

  const normalizeAdFlasherKey = (label) => {
    const upper = label.toUpperCase().replace(/\s+/g, '_')
    if (upper === 'TRADITIONAL_AFRICAN') return 'AFRICAN'
    if (upper === 'SPORTS') return 'SPORT'
    return upper
  }

  const PRICING_ADFLASHER = pricingAdFlasher?.PRICING_ADFLASHER || {}
  const adFlasherOptionsMap = PRICING_ADFLASHER?.AD_FLASHER || {}
  const priceRuleText = PRICING_ADFLASHER?.PRICE_RULE || ''

  const selectedAdFlasherCategoryKey = useMemo(() => {
    if (!formData.adFlasher) return null
    for (const [cat, cfg] of Object.entries(adFlasherOptionsMap)) {
      const options = Array.isArray(cfg) ? cfg : (cfg?.options || [])
      if (options.includes(formData.adFlasher)) return cat
    }
    return null
  }, [formData.adFlasher, adFlasherOptionsMap])

  // Use the last clicked category for badge color/label when no option is chosen
  const effectiveAdFlasherCategoryKey = useMemo(() => {
    return badgeCategoryKey || selectedAdFlasherCategoryKey
  }, [badgeCategoryKey, selectedAdFlasherCategoryKey])

  const selectedAdFlasherColor = useMemo(() => {
    if (!effectiveAdFlasherCategoryKey) return null
    const cfg = adFlasherOptionsMap[effectiveAdFlasherCategoryKey]
    if (cfg && !Array.isArray(cfg) && cfg.color) return cfg.color
    if (Array.isArray(cfg) && cfg.color) return cfg.color
    return '#005bac'
  }, [effectiveAdFlasherCategoryKey, adFlasherOptionsMap])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.title || !formData.description || !formData.price || !formData.categoryRefDocumentId) {
      setSubmitMessage("Please fill in all required fields: Title, Description, Price, and Category");
      setShowMessage(true);
      return;
    }
    
    if (!mainImage) {
      setSubmitMessage("Please upload a main image");
      setShowMessage(true);
      return;
    }
    
    setIsSubmitting(true);
    setShowMessage(false);

    try {
      // Upload main image to Cloudinary
      const uploadedMainImage = mainImage ? await uploadToCloudinary(mainImage) : null
      
      // Upload all thumbnails to Cloudinary (filter out empty slots)
      const validThumbnails = thumbnails.filter(thumb => thumb !== null && thumb !== undefined)
      const uploadedThumbnails = await Promise.all(
        validThumbnails.map(thumbnail => uploadToCloudinary(thumbnail))
      )

    const payload = {
      data: {
        title: formData.title,
        slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
        description: formData.description,
        price: parseFloat(formData.price),
        adFlasher: formData.adFlasher,
        adFlasherColor: selectedAdFlasherColor,
        // Always send these as false
        isPremium: true,
        isFeatured: false,
        isOnSpecial: false,
        isStandard: false,
        manufacturingTimeframe: formData.manufacturingTimeframe,

        // Store Cloudinary data in your new Strapi fields
        mainImageUrl: uploadedMainImage?.url || null,
        mainImagePublicId: uploadedMainImage?.public_id || null,
        thumbnailUrls: uploadedThumbnails.map(thumb => thumb.url),
        thumbnailPublicIds: uploadedThumbnails.map(thumb => thumb.public_id),

        company: {
          connect: [{ documentId: formData.companyDocumentId }]
        },
        categoryRef: {
          connect: [{ documentId: formData.categoryRefDocumentId }]
        },
        listing_category: {
          connect: [{ documentId: formData.categoryRefDocumentId }]
        },

        productDetails: {
          color: formData.productDetails.color.map((value) => ({
            value,
            icon: getIconPath('color', value)
          })),
          style: formData.productDetails.headStyle.map((value) => ({
            value,
            icon: getIconPath('style', value)
          })), // map headStyle -> style for backend
          slabStyle: formData.productDetails.slabStyle.map((value) => ({
            value,
            icon: getIconPath('slabStyle', value)
          })),
          stoneType: formData.productDetails.stoneType.map((value) => ({
            value,
            icon: getIconPath('stoneType', value)
          })),
          customization: formData.productDetails.customization.map((value) => ({
            value,
            icon: getIconPath('customization', value)
          }))
        },

        additionalProductDetails: {
          transportAndInstallation: formData.additionalProductDetails.transportAndInstallation.map((value) => ({ value })),
          foundationOptions: formData.additionalProductDetails.foundationOptions.map((value) => ({ value })),
          warrantyOrGuarantee: formData.additionalProductDetails.warrantyOrGuarantee.map((value) => ({ value }))
        }
      }
          }



      const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'https://api.tombstonesfinder.co.za/api';
      const res = await fetch(`${baseUrl}/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const responseData = await res.json()
        
        
        // Update Apollo cache to include the new listing
        try {
          const existingData = client.readQuery({ query: GET_LISTINGS });
          if (existingData) {
            const newListing = {
              __typename: 'Listing',
              documentId: responseData.data.documentId,
              title: formData.title,
              slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
              description: formData.description,
              price: parseFloat(formData.price),
              adFlasher: formData.adFlasher,
              adFlasherColor: selectedAdFlasherColor,
              isPremium: false,
              isFeatured: false,
              isOnSpecial: false,
              isStandard: true,
              manufacturingTimeframe: formData.manufacturingTimeframe,
              mainImageUrl: uploadedMainImage?.url || null,
              mainImagePublicId: uploadedMainImage?.public_id || null,
              thumbnailUrls: uploadedThumbnails.map(thumb => thumb.url),
              thumbnailPublicIds: uploadedThumbnails.map(thumb => thumb.public_id),
              productDetails: {
            color: formData.productDetails.color.map((value) => ({
              value,
              icon: getIconPath('color', value)
            })),
            style: formData.productDetails.headStyle.map((value) => ({
              value,
              icon: getIconPath('style', value)
            })),
            slabStyle: formData.productDetails.slabStyle.map((value) => ({
              value,
              icon: getIconPath('slabStyle', value)
            })),
            stoneType: formData.productDetails.stoneType.map((value) => ({
              value,
              icon: getIconPath('stoneType', value)
            })),
            customization: formData.productDetails.customization.map((value) => ({
              value,
              icon: getIconPath('customization', value)
            }))
          },
              additionalProductDetails: {
                transportAndInstallation: formData.additionalProductDetails.transportAndInstallation.map((value) => ({ value })),
                foundationOptions: formData.additionalProductDetails.foundationOptions.map((value) => ({ value })),
                warrantyOrGuarantee: formData.additionalProductDetails.warrantyOrGuarantee.map((value) => ({ value }))
              },
              company: company,
              listing_category: { name: selectedCategory?.name || 'Unknown' }
            };
            
            client.writeQuery({
              query: GET_LISTINGS,
              data: {
                listings: [newListing, ...existingData.listings]
              }
            });
            
        
          }
        } catch (cacheError) {

        }
        
        setSubmitMessage("Listing created successfully!");
        setShowMessage(true);
        setIsSubmitting(false);
        
        // Redirect to profile page after successful creation
        setTimeout(() => {
          router.push('/manufacturers/manufacturers-Profile-Page')
        }, 2000);
      } else {
        const errorData = await res.text()
        console.error('Strapi API Error:', res.status, errorData)
        setSubmitMessage(`Error creating listing: ${res.status} - ${errorData}`);
        setShowMessage(true);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error:', error)
      setSubmitMessage(`Error uploading images or creating listing: ${error.message}`);
      setShowMessage(true);
      setIsSubmitting(false);
    }
  }

  // Helper to render a checkbox group for a field, with subtitle
  const renderCheckboxGroup = (options, field, section, label, subtitle, iconSrc, max = 2) => {
    const currentSelected = formData[section][field];
    // resolve icon map key: headStyle uses backend key 'style'
    const iconPathKey = field === 'headStyle' ? 'style' : field;

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
          {iconSrc && <Image src={iconSrc} alt={label} width={18} height={18} style={{ marginRight: 6 }} />}
          {label}
        </div>
        {subtitle && (
          <div style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>{subtitle}</div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {options.map((option) => {
            const optionIcon = getIconPath(iconPathKey, option);
            return (
              <label
                key={option}
                style={{ display: "flex", alignItems: "center", fontSize: 13, marginBottom: 6 }}
              >
                <input
                  type="checkbox"
                  checked={currentSelected.includes(option)}
                  onChange={() => handleCheckboxChange(section, field, option, max)}
                  style={{ marginRight: 8 }}
                />
                {optionIcon && (
                  <Image
                    src={optionIcon}
                    alt={`${option} icon`}
                    width={22}
                    height={22}
                    style={{ marginRight: 8, display: 'inline-block', objectFit: 'contain' }}
                  />
                )}
                <span>{option}</span>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  // Handle categories loading and error states
  if (categoriesLoading) {
    return (
      <div style={{
        maxWidth: 1000,
        margin: "40px auto",
        background: "#f8f8f8",
        padding: 24,
        borderRadius: 16,
        fontFamily: "Arial, sans-serif",
        color: "#333",
        textAlign: "center"
      }}>
        Loading categories...
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div style={{
        maxWidth: 1000,
        margin: "40px auto",
        background: "#f8f8f8",
        padding: 24,
        borderRadius: 16,
        fontFamily: "Arial, sans-serif",
        color: "#333",
        textAlign: "center"
      }}>
        Error loading categories: {categoriesError.message}
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: 1000,
      margin: "40px auto",
      background: "#f8f8f8",
      padding: 24,
      borderRadius: 16,
      fontFamily: "Arial, sans-serif",
      color: "#333",
    }}>
      {/* Mobile Warning Message */}
      {showMobileWarning && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 20
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: 12,
            padding: 24,
            maxWidth: "90%",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16
          }}>
            <AlertTriangle size={48} color="#ff9800" />
            <h2 style={{ fontSize: 20, fontWeight: "bold", color: "#333" }}>Small Screen Detected</h2>
            <p style={{ fontSize: 16, color: "#555", marginBottom: 16 }}>
              This page is not optimized for small screens. For the best experience, please use a tablet or desktop device.
            </p>
            <button
              onClick={() => setShowMobileWarning(false)}
              style={{
                backgroundColor: "#005bac",
                color: "white",
                border: "none",
                borderRadius: 8,
                padding: "12px 24px",
                fontSize: 16,
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              Continue Anyway
            </button>
          </div>
        </div>
      )}
      
      {/* Return Link */}
      <div style={{ maxWidth: 1000, margin: "0 auto 8px auto", paddingLeft: 4 }}>
        <a href="/manufacturers/manufacturers-Profile-Page" style={{ color: "#005bac", fontSize: 13, textDecoration: "underline", display: "inline-flex", alignItems: "center" }}>
          <span style={{ fontSize: 18, marginRight: 4 }}>&lt;</span> Return to Profile Page & Listings.
        </a>
      </div>
      
      {/* Header */}
      <div style={{
        background: "#005bac",
        color: "#fff",
        fontWeight: "bold",
        fontSize: 18,
        padding: 16,
        textAlign: "center",
        borderRadius: 12,
        marginBottom: 32,
        textTransform: "uppercase",
        letterSpacing: 1,
      }}>
        CREATE NEW LISTING
      </div>
      
      {/* Note */}
      <div style={{ maxWidth: 1000, margin: "0 auto 8px auto", display: "flex", justifyContent: "flex-end" }}>
        <span style={{ fontSize: 12, color: "#888" }}>All fields are required for creating a listing.</span>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Advert Contact Details & Store Location Section Header */}
        <div style={{ background: "#005bac", color: "#fff", fontWeight: 700, fontSize: 13, padding: "6px 12px", marginBottom: 0, letterSpacing: 0.5 }}>
          ADVERT CONTACT DETAILS & STORE LOCATION
        </div>
        
                {/* Contact Details Grid */}
        {company ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
            {/* Left Column */}
            <div>
              <label style={{ fontSize: 12, marginBottom: 4, display: "block", color: "#555" }}>Sales Person Name</label>
              <input 
                type="text"
                value={company?.user?.name || ''}
                style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, opacity: 0.5, padding: "8px 12px", outline: "none", marginBottom: 16, background: "#f9f9f9" }}
                placeholder="Enter name"
                disabled
              />
              
              <label style={{ fontSize: 12, marginBottom: 4, display: "block", color: "#555" }}>Sales Person WhatsApp Number</label>
              <input 
                type="text"
                value={company.user.whatsappNumber || ''}
                style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, opacity: 0.5, padding: "8px 12px", outline: "none", marginBottom: 16, background: "#f9f9f9" }}
                placeholder="Enter WhatsApp number"
                disabled
              />
              
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <label style={{ fontSize: 12, color: "#555", flex: 1 }}>Store Google Location Pin</label>
                <div style={{ 
                  width: 24, 
                  height: 24, 
                  backgroundColor: "#e0e0e0", 
                  borderRadius: "50%", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  cursor: "not-allowed"
                }}>
                  <span style={{ fontSize: 12, color: "#888" }}>📍</span>
                </div>
              </div>
              <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
                {company.location || 'Location not set'}
              </div>
            </div>
            
            {/* Right Column */}
            <div>
              <label style={{ fontSize: 12, marginBottom: 4, display: "block", color: "#555" }}>Sales Person Phone Number</label>
              <input 
                type="text"
                value={company.user.phoneNumber || ''}
                style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, opacity: 0.5, padding: "8px 12px", outline: "none", marginBottom: 16, background: "#f9f9f9" }}
                placeholder="Enter phone number"
                disabled
              />
              
              <label style={{ fontSize: 12, marginBottom: 4, display: "block", color: "#555" }}>Sales Person E-mail Address</label>
              <input 
                type="email"
                value={company.user.email || ''}
                style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, opacity: 0.5, padding: "8px 12px", outline: "none", marginBottom: 16, background: "#f9f9f9" }}
                placeholder="Enter email address"
                disabled
              />
            </div>
          </div>
        ) : (
          <div style={{ padding: "32px", textAlign: "center", color: "#666" }}>
            Loading company information...
          </div>
        )}

        {/* Category Selection Section Header */}
        <div style={{ background: "#005bac", color: "#fff", fontWeight: 700, fontSize: 13,  padding: "6px 12px", marginBottom: 0, letterSpacing: 0.5 }}>
          CATEGORY SELECTION
        </div>
        <div style={{ height: 12 }} />
        
        {/* Category Selection Content */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 12, marginBottom: 8, color: "#555" }}>Select a category for your listing:</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
            {sortedCategories.map((category) => {
              return (
                <button
                  key={category.documentId}
                  type="button"
                  onClick={() => handleCategorySelect(category)}
                  style={{
                    padding: "12px 16px",
                    border: selectedCategory?.documentId === category.documentId ? "2px solid #005bac" : "1px solid #ccc",
                    borderRadius: 8,
                    background: selectedCategory?.documentId === category.documentId ? "#e6f3ff" : "#fff",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: selectedCategory?.documentId === category.documentId ? "600" : "400",
                    color: selectedCategory?.documentId === category.documentId ? "#005bac" : "#333",
                    transition: "all 0.2s ease",
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8
                  }}
                >
                  <Image 
                src={CATEGORY_ICON_MAP[category.name] || category.icon} 
                alt={category.name} 
                width={20} 
                height={20} 
                style={{ flexShrink: 0 }}
              />
                  {category.name}
                </button>
              );
            })}
          </div>
          {selectedCategory && (
            <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
              Selected: <strong>{selectedCategory.name}</strong>
            </div>
          )}
        </div>

        {/* Product Name, Description & Images Section Header */}
        <div style={{ background: "#005bac", color: "#fff", fontWeight: 700, fontSize: 13, padding: "6px 12px", marginBottom: 0, letterSpacing: 0.5 }}>
          PRODUCT NAME, DESCRIPTION & IMAGES
        </div>
        <div style={{ height: 12 }} />
        
        {/* Product Name, Description & Images Content */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 32, marginBottom: 32 }}>
          {/* Left: Name & Description */}
          <div>
            <label style={{ fontSize: 12, marginBottom: 4, display: "block" }}>Product Name</label>
            <input 
              name="title"
              value={formData.title}
              onChange={handleChange}
              style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px", outline: "none", marginBottom: 16 }} 
            />
            <label style={{ fontSize: 12, marginBottom: 4, display: "block" }}>Product Description</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px", outline: "none", minHeight: 80 }} 
            />
          </div>
          
          {/* Right: Images */}
          <div>
            <label style={{ fontSize: 12, marginBottom: 4, display: "block" }}>Product Images</label>
            <div style={{ display: "flex", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Main Image</div>
                <div
                  style={{
                    width: 96,
                    height: 96,
                    border: "2px solid #ccc",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#fafbfc",
                    cursor: "pointer",
                    position: "relative",
                    marginBottom: 4,
                  }}
                  onClick={() => {
                 
                    const input = document.getElementById(`img-upload-main`);
                    if (input) {
                      input.click();
                    } else {
                      
                    }
                  }}
                >
                  {mainImage ? (
                    <img src={URL.createObjectURL(mainImage)} alt="Main" style={{ width: 88, height: 88, borderRadius: 8 }} />
                  ) : (
                    <span style={{ color: "#bbb", fontSize: 36, fontWeight: 700 }}>+</span>
                  )}
                  <input
                    id={`img-upload-main`}
                    name="mainImage"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Additional Images only for PREMIUM Packages</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                  {[1,2,3,4,5,6,7,8,9,10].map((idx) => (
                    <div
                      key={idx}
                      style={{
                        width: 48,
                        height: 48,
                        border: "2px solid #ccc",
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: idx > 5 ? "#e0e0e0" : "#fafbfc",
                        cursor: idx > 5 ? "not-allowed" : "pointer",
                        position: "relative",
                        opacity: idx > 5 ? 0.6 : 1,
                      }}
                      onClick={() => {
                        if (idx <= 5) {
                        
                          const input = document.getElementById(`img-upload-${idx}`);
                          if (input) {
                            input.click();
                          } else {
                            console.error(`Thumbnail ${idx} input not found`);
                          }
                        }
                      }}
                    >
                      {thumbnails[idx-1] ? (
                        <img src={URL.createObjectURL(thumbnails[idx-1])} alt="" style={{ width: 40, height: 40, borderRadius: 8 }} />
                      ) : (
                        <span style={{ color: idx > 5 ? "#999" : "#bbb", fontSize: 22, fontWeight: 700 }}>{idx > 5 ? "×" : "+"}</span>
                      )}
                      <input
                        id={`img-upload-${idx}`}
                        name="thumbnails"
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => idx <= 5 && handleThumbnailChange(e, idx-1)}
                        disabled={idx > 5}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Product Details Section Header */}
        <div style={{ background: "#005bac", color: "#fff", fontWeight: 700, fontSize: 13, padding: "6px 12px", marginBottom: 0, letterSpacing: 0.5, display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: 6 }}>PRODUCT DETAILS</span>
        </div>
        <div style={{ height: 12 }} />
        
        {/* Product Details Grid with Icons */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 24, marginBottom: 32 }}>
          {renderCheckboxGroup(styleOptions, 'headStyle', 'productDetails', 'Head Style', 'Can choose up to X2 HEAD STYLE Options', '/new files/newIcons/Styles_Icons/Styles_Icons-11.svg')}
          {renderCheckboxGroup(slabStyleOptions, 'slabStyle', 'productDetails', 'Slab Style', 'Can choose up to X1 Slab Style Option', null, 1)}
          {renderCheckboxGroup(colorOptions, 'color', 'productDetails', 'Colour', 'Can choose up to X2 Colour Options', '/new files/newIcons/Colour_Icons/Colour_Icons-28.svg')}
          {renderCheckboxGroup(stoneTypeOptions, 'stoneType', 'productDetails', 'Stone Type', 'Can choose up to X2 Material Options', '/new files/newIcons/Material_Icons/Material_Icons-39.svg')}
 
          {renderCheckboxGroup(customizationOptions, 'customization', 'productDetails', 'Customisation', 'Can choose up to X3 Custom Options', '/new files/newIcons/Custom_Icons/Custom_Icons-54.svg')}
        </div>

        {/* Additional Product Details Section Header */}
        <div style={{ background: "#005bac", color: "#fff", fontWeight: 700, fontSize: 13, padding: "6px 12px", marginBottom: 0, letterSpacing: 0.5, display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: 6 }}>ADDITIONAL PRODUCT DETAILS</span>
        </div>
        <div style={{ height: 12 }} />
        
        {/* Additional Product Details Content */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
          {/* 1. TRANSPORT AND INSTALLATION (max 2) */}
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>1. TRANSPORT AND INSTALLATION</div>
            <div style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>(Can choose up to X2 Transport and Installation Options)</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                "FREE TRANSPORT AND INSTALLATION WITHIN 5KM OF FACTORY",
                "FREE TRANSPORT AND INSTALLATION WITHIN 20KM OF FACTORY",
                "FREE TRANSPORT AND INSTALLATION WITHIN 50KM OF FACTORY",
                "FREE TRANSPORT AND INSTALLATION WITHIN 100KM OF FACTORY",
                "FREE TRANSPORT AND INSTALLATION",
                "DISCOUNTED TRANSPORT AND INSTALLATION COST INCLUDED IN SALE",
                "FINAL TRANSPORT AND INSTALLATION COST TO BE CONFIRMED BY MANUFACTURER",
              ].map((option) => (
                <label key={option} style={{ display: "block", fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={formData.additionalProductDetails.transportAndInstallation.includes(option)}
                    onChange={() =>
                      handleCheckboxChange(
                        "additionalProductDetails",
                        "transportAndInstallation",
                        option,
                        2
                      )
                    }
                    style={{ marginRight: 6 }}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          {/* 2. FOUNDATION OPTIONS (max 3) */}
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>2. FOUNDATION OPTIONS</div>
            <div style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>(Can choose up to X3 Foundation Options)</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                "NO FOUNDATION COSTS INCLUDED IN PRICE",
                "GRAVESITE CLEARING COST NOT INCLUDED IN PRICE",
                "GRAVESITE CLEARING COST INCLUDED IN PRICE",
                "CEMENT FOUNDATION COST NOT INCLUDED IN PRICE",
                "CEMENT FOUNDATION COST INCLUDED IN PRICE",
                "BRICK FOUNDATION COST NOT INCLUDED IN PRICE",
                "BRICK FOUNDATION COST INCLUDED IN PRICE",
                "X1 LAYER BRICK FOUNDATION COST INCLUDED IN PRICE",
                "X2 LAYER BRICK FOUNDATION COST INCLUDED IN PRICE",
                "X3 LAYER BRICK FOUNDATION COST INCLUDED IN PRICE",
              ].map((option) => (
                <label key={option} style={{ display: "block", fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={formData.additionalProductDetails.foundationOptions.includes(option)}
                    onChange={() =>
                      handleCheckboxChange(
                        "additionalProductDetails",
                        "foundationOptions",
                        option,
                        3
                      )
                    }
                    style={{ marginRight: 6 }}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          {/* 3. WARRANTY/GUARANTEE (max 1) */}
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>3. WARRANTY/GUARANTEE</div>
            <div style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>(Can choose up to X1 Warranty/Guarantee Options)</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                "5   YEAR MANUFACTURES WARRANTY",
                "5   YEAR MANUFACTURES GUARANTEE",
                "10 YEAR MANUFACTURES WARRANTY",
                "10 YEAR MANUFACTURES GUARANTEE",
                "15 YEAR MANUFACTURES WARRANTY",
                "15 YEAR MANUFACTURES GUARANTEE",
                "20 YEAR MANUFACTURES WARRANTY",
                "20 YEAR MANUFACTURES GUARANTEE",
                "LIFETIME MANUFACTURERS WARRANTY",
                "LIFETIME MANUFACTURERS GUARANTEE",
              ].map((option) => (
                <label key={option} style={{ display: "block", fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={formData.additionalProductDetails.warrantyOrGuarantee.includes(option)}
                    onChange={() =>
                      handleCheckboxChange(
                        "additionalProductDetails",
                        "warrantyOrGuarantee",
                        option,
                        1
                      )
                    }
                    style={{ marginRight: 6 }}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          {/* 4. MANUFACTURING LEAD TIME (single select via checkbox) */}
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>4. MANUFACTURING LEAD TIME</div>
            <div style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>(Can choose up to X1 Manufacturing Lead Time)</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {manufacturingLeadTimeOptions.map((days) => {
                const str = String(days);
                const checked = formData.additionalProductDetails.manufacturingLeadTime.includes(str);
                return (
                  <label key={str} style={{ display: "block", fontSize: 13 }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleManufacturingLeadTimeToggle(days)}
                      style={{ marginRight: 6 }}
                    />
                    {formatManufacturingLeadTimeText(days)}
                  </label>
                );
              })}
            </div>
          </div>


        </div>

        {/* Pricing & AdFlasher Section Header */}
        <div style={{ background: "#d32f2f", color: "#fff", fontWeight: 700, fontSize: 13, padding: "6px 12px", marginBottom: 0, letterSpacing: 0.5 }}>
          PRICING & ADFLASHER
        </div>
        <div style={{ height: 12 }} />
        
        {/* Pricing & AdFlasher Content (Ad Flasher LEFT, Price RIGHT) */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 12, marginBottom: 32 }}>
          {/* LEFT: ADVERT FLASHER */}
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>ADVERT FLASHER</div>
            <div style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>
              (Can only choose X1 Advert Flasher per Ad)
            </div>

            {/* Make the list a 2-col grid: [name | arrow] so arrows sit close and align */}
            <div style={{ display: "grid", gridTemplateColumns: "max-content 22px", columnGap: 8, rowGap: 6 }}>
              {Object.entries(adFlasherOptionsMap).map(([category, cfg]) => {
                const options = Array.isArray(cfg) ? cfg : (cfg?.options || []);
      
                return (
                  <React.Fragment key={category}>
                    <button
                      type="button"
                      onClick={() => handleToggleAdFlasherCategory(category)}
                      aria-expanded={expandedAdFlasherCategory === category}
                      aria-controls={`adflasher-panel-${category}`}
                      style={{ display: "contents" }}
                    >
                      {/* Column 1: name */}
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#222", alignSelf: "center" }}>
                        {category.replace(/_/g, " ")}
                      </span>
                      {/* Column 2: arrow (right next to the name, aligned across rows) */}
                      <span style={{ fontSize: 12, color: "#111", lineHeight: 1, alignSelf: "center" }}>
                        {expandedAdFlasherCategory === category ? "▼" : "▶"}
                      </span>
                    </button>
      
                    {/* Expanded panel spans both columns below the row */}
                    {expandedAdFlasherCategory === category && (
                      <div
                        id={`adflasher-panel-${category}`}
                        style={{ gridColumn: "1 / -1", padding: "4px 0 8px 18px" }}
                      >
                        {options.map((option) => (
                          <label
                            key={option}
                            style={{ display: "flex", alignItems: "center", fontSize: 13, marginBottom: 6 }}
                          >
                            <input
                              type="radio"
                              name="adFlasherRadio"
                              checked={formData.adFlasher === option}
                              onChange={() => handleSelectAdFlasher(category, option)}
                              style={{ marginRight: 8 }}
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            <div style={{ marginTop: 8 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  border: '1px dashed #ccc',
                  borderRadius: 6,
                  padding: '6px 8px',
                  background: '#fafafa',
                }}
              >
                <span style={{ fontSize: 12, color: '#555' }}>Selection</span>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    borderRadius: 999,
                    background: selectedAdFlasherColor || '#005bac',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {formData.adFlasher
                    ? formData.adFlasher
                    : (effectiveAdFlasherCategoryKey
                        ? String(effectiveAdFlasherCategoryKey).replace(/_/g, ' ')
                        : 'None')}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: ADVERTISED PRICE */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 12, color: "#555" }}>Advertised Price</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, color: "#555" }}>R</span>
              <input
                name="price"
                type="text"
                value={priceInput}
                onChange={handlePriceChange}
                onBlur={handlePriceBlur}
                style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px", outline: "none" }}
                placeholder="000 000.00"
              />
            </div>
          </div>
        </div>


        {/* Action Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button 
            type="submit"
            disabled={isSubmitting}
            style={{
              background: isSubmitting ? "#ccc" : "#005bac",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              fontSize: 14,
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              transition: "background-color 0.2s ease"
            }}
            onMouseOver={(e) => !isSubmitting && (e.target.style.background = "#004a8c")}
            onMouseOut={(e) => !isSubmitting && (e.target.style.background = "#005bac")}
          >
            {isSubmitting ? "Creating..." : "Create Listing"}
          </button>
          <button 
            type="button"
            onClick={() => router.push('/manufacturers/manufacturers-Profile-Page')}
            disabled={isSubmitting}
            style={{
              background: isSubmitting ? "#eee" : "#ccc",
              color: "#333",
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              fontSize: 14,
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              transition: "background-color 0.2s ease"
            }}
            onMouseOver={(e) => !isSubmitting && (e.target.style.background = "#bbb")}
            onMouseOut={(e) => !isSubmitting && (e.target.style.background = "#ccc")}
          >
            Cancel
          </button>
        </div>

        {/* Success/Error Message */}
        {showMessage && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '16px 24px',
            borderRadius: '8px',
            color: '#fff',
            fontWeight: 'bold',
            zIndex: 1000,
            background: submitMessage.includes('Error') ? '#dc3545' : '#28a745',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            animation: 'slideIn 0.3s ease'
          }}>
            {submitMessage}
          </div>
        )}

        {/* Modal for max selection warning */}
        {modalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 260, boxShadow: '0 2px 16px rgba(0,0,0,0.18)', textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>{modalMsg}</div>
              <button onClick={() => setModalOpen(false)} style={{ background: '#005bac', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 24px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>OK</button>
            </div>
          </div>
        )}
    </form>
    </div>
  )
}
