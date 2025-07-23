'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'

const colorOptions = [
  'Black',
  'White',
  'Grey',
  'Brown',
  'Blue Pearl',
  'Red',
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
  'Granite',
  'Marble',
  'Sandstone',
  'Limestone',
  'Bronze',
];
const cultureOptions = ['Christian', 'Traditional']
const customizationOptions = [
  'Engraving Photo',
  'Gold Leaf',
  'Special Shape',
  'Lighting'];

const transportOptions = ['Free transport within 20km', 'Paid delivery']
const foundationOptions = ['Brick foundation', 'Cement base']
const warrantyOptions = ['5-year warranty', '10-year manufacturer warranty']

// Add adFlasher options
const adFlasherOptions = [
  'New',
  'Popular',
  'Limited Offer',
  'Best Seller',
  'Exclusive',
];

export default function CreateListingForm() {
  const searchParams = useSearchParams();
  const companyDocumentIdFromQuery = searchParams.get('companyDocumentId') || '';
  const router = useRouter();

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
      style: [],
      stoneType: [],
      culture: [],
      customization: []
    },
    additionalProductDetails: {
      transportAndInstallation: [],
      foundationOptions: [],
      warrantyOrGuarantee: []
    },
    // Remove companyDocumentId from the form, but keep in state for payload
    companyDocumentId: companyDocumentIdFromQuery,
    categoryRefDocumentId: ''
  })

  // If the query param changes, update formData.companyDocumentId
  useEffect(() => {
    if (companyDocumentIdFromQuery) {
      setFormData((prev) => ({ ...prev, companyDocumentId: companyDocumentIdFromQuery }));
    }
  }, [companyDocumentIdFromQuery]);

  const [mainImage, setMainImage] = useState(null)
  const [thumbnails, setThumbnails] = useState([])

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

  const handleFileChange = (e) => {
    const { name, files } = e.target
    if (name === 'mainImage') {
      setMainImage(files[0])
    } else if (name === 'thumbnails') {
      setThumbnails(Array.from(files).slice(0, 5))
    }
  }

  const uploadToStrapi = async (file) => {
    const uploadData = new FormData()
    uploadData.append('files', file)
    const res = await fetch('http://localhost:1337/api/upload', {
      method: 'POST',
      body: uploadData
    })
    const data = await res.json()
    return data[0]?.id
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const uploadedMainImageId = mainImage ? await uploadToStrapi(mainImage) : null
    const uploadedThumbnailIds = await Promise.all(thumbnails.map(uploadToStrapi))

    const payload = {
      data: {
        title: formData.title,
        slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
        description: formData.description,
        price: parseFloat(formData.price),
        adFlasher: formData.adFlasher,
        // Always send these as false
        isPremium: false,
        isFeatured: false,
        isOnSpecial: false,
        manufacturingTimeframe: formData.manufacturingTimeframe,

        mainImage: uploadedMainImageId,
        thumbnails: uploadedThumbnailIds,

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
          color: formData.productDetails.color.map((value) => ({ value })),
          style: formData.productDetails.style.map((value) => ({ value })),
          stoneType: formData.productDetails.stoneType.map((value) => ({ value })),
          culture: formData.productDetails.culture.map((value) => ({ value })),
          customization: formData.productDetails.customization.map((value) => ({ value }))
        },

        additionalProductDetails: {
          transportAndInstallation: formData.additionalProductDetails.transportAndInstallation.map((value) => ({ value })),
          foundationOptions: formData.additionalProductDetails.foundationOptions.map((value) => ({ value })),
          warrantyOrGuarantee: formData.additionalProductDetails.warrantyOrGuarantee.map((value) => ({ value }))
        }
      }
    }

    const res = await fetch('https://balanced-sunrise-2fce1c3d37.strapiapp.com/api/listings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const responseData = await res.json()
    console.log(responseData)
    alert('Listing created successfully!')
    router.push('/manufacturers/manufacturers-Profile-Page')
  }

  // Helper to render a checkbox group for a field, with subtitle
  const renderCheckboxGroup = (options, field, section, label, subtitle) => (
    <div className="flex-1 min-w-[180px]">
      <div className="font-bold text-xs bg-gray-200 px-2 py-1 mb-1 border-b border-gray-300">{label}</div>
      {subtitle && <div className="text-[11px] text-gray-500 mb-2 px-2">{subtitle}</div>}
      <div className="flex flex-col gap-1 px-2">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-2 text-xs font-normal cursor-pointer">
            <input
              type="checkbox"
              checked={formData[section][field].includes(option)}
              onChange={() => handleDropdownChange(section, field, option)}
              className="accent-blue-600 w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-5xl mx-auto bg-white rounded shadow">
      <input name="title" placeholder="Title" onChange={handleChange} className="w-full border p-2 rounded" />
      <textarea name="description" placeholder="Description" onChange={handleChange} className="w-full border p-2 rounded" />
      <input name="price" type="number" placeholder="Price" onChange={handleChange} className="w-full border p-2 rounded" />
      {/* AdFlasher dropdown */}
      <select
        name="adFlasher"
        onChange={handleChange}
        className="w-full border p-2 rounded bg-white"
        value={formData.adFlasher}
      >
        <option value="">Select Badge/AdFlasher</option>
        {adFlasherOptions.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>

      {/* REMOVE: Premium, Featured, On Special checkboxes and companyDocumentId input */}
      {/* <div className="flex gap-4 mb-2"> ... </div> */}
      {/* <input name="companyDocumentId" ... /> */}

      <input name="categoryRefDocumentId" placeholder="Category Doc ID" onChange={handleChange} className="w-full border p-2 rounded" />

      <input name="mainImage" type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
      <input name="thumbnails" type="file" multiple accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />

      {/* Manufacturing Timeframe dropdown */}
      <select
        name="manufacturingTimeframe"
        onChange={handleChange}
        className="w-full border p-2 rounded bg-white"
        value={formData.manufacturingTimeframe}
      >
        <option value="">Select Manufacturing Timeframe (weeks)</option>
        {[1,2,3,4,5,6].map((week) => (
          <option key={week} value={week}>{week} week{week > 1 ? 's' : ''}</option>
        ))}
      </select>

      {/* Product Details: Only style, material, customization, colour as checkbox groups */}
      <div className="w-full">
        <div className="font-bold text-xs bg-gray-200 px-2 py-1 mb-2 border-b border-gray-300">PRODUCT DETAILS</div>
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {renderCheckboxGroup(styleOptions, 'style', 'productDetails', 'STYLE', 'Can choose up to X2 Style Options')}
          {renderCheckboxGroup(colorOptions, 'color', 'productDetails', 'COLOUR', 'Can choose up to X2 Colour Options')}
          {renderCheckboxGroup(stoneTypeOptions, 'stoneType', 'productDetails', 'MATERIAL', 'Can choose up to X2 Material Options')}
          {renderCheckboxGroup(customizationOptions, 'customization', 'productDetails', 'CUSTOMISATION', 'Can choose up to X3 Custom Options')}
        </div>
      </div>

      <button type="submit" className="bg-black text-white px-4 py-2 rounded w-full mt-4">Create Listing</button>
    </form>
  )
}
