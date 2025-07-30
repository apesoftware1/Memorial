'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import Image from "next/image"
import categories from '../../../../category.json'
import adFlasherOptions from '../../../../adFlasher.json'

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

const customizationOptions = [
  'Engraving Photo',
  'Gold Leaf',
  'Special Shape',
  'Lighting'];

const transportOptions = ['Free transport within 20km', 'Paid delivery']
const foundationOptions = ['Brick foundation', 'Cement base']
const warrantyOptions = ['5-year warranty', '10-year manufacturer warranty']

export default function CreateListingForm() {
  const router = useRouter();
  const [company, setCompany] = useState(null);

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
     
      customization: []
    },
    additionalProductDetails: {
      transportAndInstallation: [],
      foundationOptions: [],
      warrantyOrGuarantee: []
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
  const [thumbnails, setThumbnails] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)

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
  const renderCheckboxGroup = (options, field, section, label, subtitle, iconSrc) => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
        {iconSrc && <Image src={iconSrc} alt={label} width={18} height={18} style={{ marginRight: 6 }} />}
        {label}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {options.map((option) => (
          <label key={option} style={{ display: "block", fontSize: 13, marginBottom: 6 }}>
            <input
              type="checkbox"
              checked={formData[section][field].includes(option)}
              onChange={() => handleDropdownChange(section, field, option)}
              style={{ marginRight: 6 }}
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );

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
        <div style={{ background: "#ededed", fontWeight: 700, fontSize: 13, padding: "6px 12px", marginBottom: 0, letterSpacing: 0.5 }}>
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
                value={company.user.name || ''}
                style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, opacity: 0.5, padding: "8px 12px", outline: "none", marginBottom: 16, background: "#f9f9f9" }}
                placeholder="Enter name"
                disabled
              />
              
              <label style={{ fontSize: 12, marginBottom: 4, display: "block", color: "##f9f9f9" }}>Sales Person WhatsApp Number</label>
              <input 
                type="text"
                value={company.user.whatsappNumber || ''}
                style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, opacity: 0.5, padding: "8px 12px", outline: "none", marginBottom: 16, background: "#f9f9f9" }}
                placeholder="Enter WhatsApp number"
                disabled
              />
              
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <label style={{ fontSize: 12, color: "##f9f9f9", flex: 1 }}>Store Google Location Pin</label>
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
              <label style={{ fontSize: 12, marginBottom: 4, display: "block", color: "##f9f9f9" }}>Sales Person Phone Number</label>
              <input 
                type="text"
                value={company.user.phoneNumber || ''}
                style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, opacity: 0.5, padding: "8px 12px", outline: "none", marginBottom: 16, background: "#f9f9f9" }}
                placeholder="Enter phone number"
                disabled
              />
              
              <label style={{ fontSize: 12, marginBottom: 4, display: "block", color: "##f9f9f9" }}>Sales Person E-mail Address</label>
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
        <div style={{ background: "#ededed", fontWeight: 700, fontSize: 13,  padding: "6px 12px", marginBottom: 0, letterSpacing: 0.5 }}>
          CATEGORY SELECTION
        </div>
        <div style={{ height: 12 }} />
        
        {/* Category Selection Content */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 12, marginBottom: 8, color: "#555" }}>Select a category for your listing:</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
            {categories.map((category) => (
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
                  textAlign: "center"
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
          {selectedCategory && (
            <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
              Selected: <strong>{selectedCategory.name}</strong>
            </div>
          )}
        </div>

        {/* Product Name, Description & Images Section Header */}
        <div style={{ background: "#ededed", fontWeight: 700, fontSize: 13, padding: "6px 12px", marginBottom: 0, letterSpacing: 0.5 }}>
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
                  onClick={() => document.getElementById(`img-upload-main`).click()}
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
                        background: "#fafbfc",
                        cursor: "pointer",
                        position: "relative",
                      }}
                      onClick={() => document.getElementById(`img-upload-${idx}`).click()}
                    >
                      {thumbnails[idx-1] ? (
                        <img src={URL.createObjectURL(thumbnails[idx-1])} alt="" style={{ width: 40, height: 40, borderRadius: 8 }} />
                      ) : (
                        <span style={{ color: "#bbb", fontSize: 22, fontWeight: 700 }}>+</span>
                      )}
                      <input
                        id={`img-upload-${idx}`}
                        name="thumbnails"
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & AdFlasher Section Header */}
        <div style={{ background: "#ededed", fontWeight: 700, fontSize: 13, padding: "6px 12px", marginBottom: 0, letterSpacing: 0.5 }}>
          PRICING & ADFLASHER
        </div>
        <div style={{ height: 12 }} />
        
        {/* Pricing & AdFlasher Content */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 12, marginRight: 8, color: "#555" }}>Price:</span>
            <input 
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px", outline: "none" }} 
            />
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 12, marginRight: 8, color: "#555" }}>AdFlasher:</span>
      <select
        name="adFlasher"
              value={formData.adFlasher}
        onChange={handleChange}
              style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px", outline: "none", background: "white" }}
      >
              <option value="">Select AdFlasher</option>
        {adFlasherOptions.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
          </div>
        </div>

        {/* Manufacturing Timeframe Section */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 32 }}>
          <span style={{ fontSize: 12, marginRight: 8, color: "#555" }}>Manufacturing Timeframe:</span>
      <select
        name="manufacturingTimeframe"
            value={formData.manufacturingTimeframe}
        onChange={handleChange}
            style={{ width: "200px", border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px", outline: "none", background: "white" }}
      >
        {[1,2,3,4,5,6].map((week) => (
          <option key={week} value={week}>{week} week{week > 1 ? 's' : ''}</option>
        ))}
      </select>
        </div>

        {/* Product Details Section Header */}
        <div style={{ background: "#ededed", fontWeight: 700, fontSize: 13, padding: "6px 12px", marginBottom: 0, letterSpacing: 0.5, display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: 8 }}>PRODUCT DETAILS</span>
        </div>
        <div style={{ height: 12 }} />
        
        {/* Product Details Grid with Icons */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 24, marginBottom: 32 }}>
          {renderCheckboxGroup(styleOptions, 'style', 'productDetails', 'Style', 'Can choose up to X2 Style Options', '/new files/newIcons/Styles_Icons/Styles_Icons-11.svg')}
          {renderCheckboxGroup(colorOptions, 'color', 'productDetails', 'Colour', 'Can choose up to X2 Colour Options', '/new files/newIcons/Colour_Icons/Colour_Icons-28.svg')}
          {renderCheckboxGroup(stoneTypeOptions, 'stoneType', 'productDetails', 'Stone Type', 'Can choose up to X2 Material Options', '/new files/newIcons/Material_Icons/Material_Icons-39.svg')}
 
          {renderCheckboxGroup(customizationOptions, 'customization', 'productDetails', 'Customisation', 'Can choose up to X3 Custom Options', '/new files/newIcons/Custom_Icons/Custom_Icons-54.svg')}
        </div>

        {/* Additional Product Details Section Header */}
        <div style={{ background: "#ededed", fontWeight: 700, fontSize: 13, padding: "6px 12px", marginBottom: 0, letterSpacing: 0.5, display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: 8 }}>ADDITIONAL PRODUCT DETAILS</span>
        </div>
        <div style={{ height: 12 }} />
        
        {/* Additional Product Details Content */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 12, marginRight: 8, color: "#555" }}>Transport:</span>
            <select
              style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px", outline: "none", background: "white" }}
            >
              <option value="">Select Transport Option</option>
              {transportOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 12, marginRight: 8, color: "#555" }}>Foundation:</span>
            <select
              style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px", outline: "none", background: "white" }}
            >
              <option value="">Select Foundation Option</option>
              {foundationOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 12, marginRight: 8, color: "#555" }}>Warranty:</span>
            <select
              style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px", outline: "none", background: "white" }}
            >
              <option value="">Select Warranty Option</option>
              {warrantyOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
        </div>
      </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button 
            type="submit"
            style={{
              background: "#005bac",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Create Listing
          </button>
          <button 
            type="button"
            onClick={() => router.push('/manufacturers/manufacturers-Profile-Page')}
            style={{
              background: "#ccc",
              color: "#333",
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Cancel
          </button>
        </div>
    </form>
    </div>
  )
}
