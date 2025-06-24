"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

function isMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768;
}

export default function AdvertCreator() {
  // Demo state for form fields
  const [category, setCategory] = useState("Full Tombstone");
  const [images, setImages] = useState(Array(11).fill(null));
  const [style, setStyle] = useState("");
  const [colour, setColour] = useState("");
  const [stoneType, setStoneType] = useState("");
  const [culture, setCulture] = useState("");
  const [custom, setCustom] = useState("");
  const [price, setPrice] = useState("");
  const [flasher, setFlasher] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [finalPrice, setFinalPrice] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const [mobile, setMobile] = useState(false);

  // Demo options
  const categories = [
    "Full Tombstone", "Premium", "Double/Family", "Child", "Head & Base", "Cremation & Urns"
  ];
  const styles = ["Classic", "Modern", "Traditional", "Custom"];
  const colours = ["Black", "Grey", "White", "Red", "Blue"];
  const stoneTypes = ["Granite", "Marble", "Sandstone"];
  const cultures = ["Christian", "Jewish", "Muslim", "Hindu", "African"];
  const customs = ["Engraving", "Photo", "Gold Leaf", "Special Shape", "Lighting"];
  const flasherOptions = [
    {
      label: "CHRISTIAN CROSS",
      sub: [
        "Forever Loved",
        "Heartfelt Memory",
        "Loving Tribute",
        "Endless Love",
        "Cherished Always",
        "Devoted Blessing",
        "Soulful Elegance",
        "Love Remembered",
        "Emotional Tribute",
        "True Devotion",
      ],
    },
    { label: "HEART", sub: [] },
    { label: "BIBLE", sub: [] },
    { label: "PILLARS", sub: [] },
    { label: "TRADITIONAL AFRICAN", sub: [] },
    { label: "ABSTRACT", sub: [] },
    { label: "PRAYING HANDS", sub: [] },
    { label: "SCROLL", sub: [] },
    { label: "ANGEL", sub: [] },
    { label: "MAUSOLEUM", sub: [] },
    { label: "OBELISK", sub: [] },
    { label: "PLAIN", sub: [] },
    { label: "TEDDY BEAR", sub: [] },
    { label: "BUTTERFLY", sub: [] },
    { label: "CAR", sub: [] },
    { label: "BIKE", sub: [] },
    { label: "SPORTS", sub: [] },
  ];
  const discountOptions = [5, 10, 15, 17.5, 20, 25, 30, 40, 45];

  // Flasher options with sub-options
  const [selectedFlasher, setSelectedFlasher] = useState({ main: "", sub: "" });

  // Image upload handler (demo only)
  function handleImageChange(idx, file) {
    const newImages = [...images];
    newImages[idx] = file;
    setImages(newImages);
  }

  // Add effect to calculate final price
  useEffect(() => {
    if (!price || isNaN(Number(price)) || !discount) {
      setFinalPrice("");
      return;
    }
    const priceNum = parseFloat(price);
    const discountNum = discount / 100;
    const discounted = priceNum - priceNum * discountNum;
    setFinalPrice(discounted.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  }, [price, discount]);

  useEffect(() => {
    setMobile(isMobile());
    const handleResize = () => setMobile(isMobile());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (mobile) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fffbe6',
      animation: 'fadeIn 1.2s',
    }}>
      <div style={{
        background: '#ffe066',
        color: '#b26a00',
        fontWeight: 700,
        fontSize: 22,
        padding: '32px 40px',
        borderRadius: 16,
        boxShadow: '0 2px 16px rgba(255, 224, 102, 0.18)',
        textAlign: 'center',
        letterSpacing: 1,
        animation: 'fadeIn 1.2s',
      }}>
        Page not available for mobile use!
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
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
        TOMBSTONE ADVERT Creator
      </div>
      {/* Note */}
      <div style={{ maxWidth: 1000, margin: "0 auto 8px auto", display: "flex", justifyContent: "flex-end" }}>
        <span style={{ fontSize: 12, color: "#888" }}>All fields are required for new listings.</span>
      </div>
      {/* Contact and Store Info */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
        marginBottom: 32,
      }}>
        <div>
          <label style={{ fontSize: 12, marginBottom: 4, display: "block" }}>Sales Person Phone Number</label>
          <input style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px", outline: "none" }} />
        </div>
        <div>
          <label style={{ fontSize: 12, marginBottom: 4, display: "block" }}>Sales Person WhatsApp Number</label>
          <input style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px", outline: "none" }} />
        </div>
        <div>
          <label style={{ fontSize: 12, marginBottom: 4, display: "block" }}>Sales Person Email Address</label>
          <input style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px", outline: "none" }} />
        </div>
        <div>
          <label style={{ fontSize: 12, marginBottom: 4, display: "block" }}>Sales Person WhatsApp Address</label>
          <input style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px", outline: "none" }} />
        </div>
        <div>
          <label style={{ fontSize: 12, marginBottom: 4, display: "block" }}>Store Physical Address</label>
          <input style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px", outline: "none" }} />
        </div>
        <div>
          <label style={{ fontSize: 12, marginBottom: 4, display: "block" }}>Store Google Location Pin</label>
          <input style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px", outline: "none" }} />
        </div>
      </div>

      {/* Product Category Section Header */}
      <div style={{ background: "#ededed", fontWeight: 700, fontSize: 13, padding: "6px 12px ", marginBottom: 0, letterSpacing: 0.5 }}>
        PRODUCT CATEGORY
      </div>
      <div style={{ height: 12 }} />
      {/* Product Category Buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            style={{
              background: category === cat ? "#005bac" : "#e0e0e0",
              color: category === cat ? "#fff" : "#333",
              border: "none",
              borderRadius: 20,
              padding: "8px 18px",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            {cat}
          </button>
        ))}
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
          <input style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px", outline: "none", marginBottom: 16 }} />
          <label style={{ fontSize: 12, marginBottom: 4, display: "block" }}>Product Description</label>
          <textarea style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px", outline: "none", minHeight: 80 }} />
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
                {images[0] ? (
                  <img src={URL.createObjectURL(images[0])} alt="" style={{ width: 88, height: 88, borderRadius: 8 }} />
                ) : (
                  <span style={{ color: "#bbb", fontSize: 36, fontWeight: 700 }}>+</span>
                )}
                <input
                  id={`img-upload-main`}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={e => handleImageChange(0, e.target.files[0])}
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
                    {images[idx] ? (
                      <img src={URL.createObjectURL(images[idx])} alt="" style={{ width: 40, height: 40, borderRadius: 8 }} />
                    ) : (
                      <span style={{ color: "#bbb", fontSize: 22, fontWeight: 700 }}>+</span>
                )}
                <input
                  id={`img-upload-${idx}`}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={e => handleImageChange(idx, e.target.files[0])}
                />
              </div>
            ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Section Header */}
      <div style={{ background: "#ededed", fontWeight: 700, fontSize: 13, padding: "6px 12px ", marginBottom: 0, letterSpacing: 0.5, display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: 8 }}>PRODUCT DETAILS</span>
      </div>
      <div style={{ height: 12 }} />
      {/* Product Details Grid with Icons */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 24, marginBottom: 32 }}>
        {/* STYLE */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            <Image src="/new files/newIcons/Styles_Icons/Styles_Icons-11.svg" alt="Style" width={18} height={18} style={{ marginRight: 6 }} />
            Style
          </div>
          {(() => {
            const options = ["Christian Cross", "Heart", "Bible", "Pillars", "Traditional African", "Abstract", "Praying Hands", "Scroll", "Angel", "Mausoleum", "Obelisk", "Plain", "Teddy Bear", "Butterfly", "Car", "Bike", "Sports"];
            const [selected, setSelected] = useState([]);
            return options.map((s) => (
            <label key={s} style={{ display: "block", fontSize: 13, marginBottom: 6 }}>
                <input
                  type="checkbox"
                  checked={selected.includes(s)}
                  onChange={() => {
                    if (selected.includes(s)) {
                      setSelected(selected.filter(x => x !== s));
                    } else if (selected.length < 2) {
                      setSelected([...selected, s]);
                    } else {
                      setModalMsg("you can only add 2 charactaristcs ");
                      setModalOpen(true);
                    }
                  }}
                  style={{ marginRight: 6 }}
                />
              {s}
            </label>
            ));
          })()}
        </div>
        {/* COLOUR */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            <Image src="/new files/newIcons/Colour_Icons/Colour_Icons-28.svg" alt="Colour" width={18} height={18} style={{ marginRight: 6 }} />
            Colour
          </div>
          {(() => {
            const options = ["Black", "Grey", "White", "Red", "Blue", "Mixed"];
            const [selected, setSelected] = useState([]);
            return options.map((c) => (
            <label key={c} style={{ display: "block", fontSize: 13, marginBottom: 6 }}>
                <input
                  type="checkbox"
                  checked={selected.includes(c)}
                  onChange={() => {
                    if (selected.includes(c)) {
                      setSelected(selected.filter(x => x !== c));
                    } else if (selected.length < 2) {
                      setSelected([...selected, c]);
                    } else {
                      setModalMsg("you can only add 2 charactaristcs ");
                      setModalOpen(true);
                    }
                  }}
                  style={{ marginRight: 6 }}
                />
              {c}
            </label>
            ));
          })()}
        </div>
        {/* STONE TYPE */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            <Image src="/new files/newIcons/Material_Icons/Material_Icons-39.svg" alt="Stone Type" width={18} height={18} style={{ marginRight: 6 }} />
            Stone Type
          </div>
          {(() => {
            const options = ["Granite", "Marble", "Concrete", "Sandstone", "Limestone", "Bronze", "Quartz", "Glass", "Mixed"];
            const [selected, setSelected] = useState([]);
            return options.map((st) => (
            <label key={st} style={{ display: "block", fontSize: 13, marginBottom: 6 }}>
                <input
                  type="checkbox"
                  checked={selected.includes(st)}
                  onChange={() => {
                    if (selected.includes(st)) {
                      setSelected(selected.filter(x => x !== st));
                    } else if (selected.length < 2) {
                      setSelected([...selected, st]);
                    } else {
                      setModalMsg("you can only add 2 charactaristcs ");
                      setModalOpen(true);
                    }
                  }}
                  style={{ marginRight: 6 }}
                />
              {st}
            </label>
            ));
          })()}
        </div>
        {/* CULTURE */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            <Image src="/new files/newIcons/Culture_Icons/Culture_Icons-48.svg" alt="Culture" width={18} height={18} style={{ marginRight: 6 }} />
            Culture
          </div>
          {(() => {
            const options = ["Christian", "Jewish", "Muslim", "Hindu", "Traditional African", "Any"];
            const [selected, setSelected] = useState([]);
            return options.map((cu) => (
            <label key={cu} style={{ display: "block", fontSize: 13, marginBottom: 6 }}>
                <input
                  type="checkbox"
                  checked={selected.includes(cu)}
                  onChange={() => {
                    if (selected.includes(cu)) {
                      setSelected(selected.filter(x => x !== cu));
                    } else if (selected.length < 2) {
                      setSelected([...selected, cu]);
                    } else {
                      setModalMsg("you can only add 2 charactaristcs ");
                      setModalOpen(true);
                    }
                  }}
                  style={{ marginRight: 6 }}
                />
              {cu}
            </label>
            ));
          })()}
        </div>
        {/* CUSTOMISATION */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            <Image src="/new files/newIcons/Custom_Icons/Custom_Icons-54.svg" alt="Customisation" width={18} height={18} style={{ marginRight: 6 }} />
            Customisation
          </div>
          {(() => {
            const options = ["Photo Engraving", "Photo Etching", "Gold Leaf", "Leather Finish", "Engraving", "Special Shape", "Lighting"];
            const [selected, setSelected] = useState([]);
            return options.map((cu) => (
            <label key={cu} style={{ display: "block", fontSize: 13, marginBottom: 6 }}>
                <input
                  type="checkbox"
                  checked={selected.includes(cu)}
                  onChange={() => {
                    if (selected.includes(cu)) {
                      setSelected(selected.filter(x => x !== cu));
                    } else if (selected.length < 2) {
                      setSelected([...selected, cu]);
                    } else {
                      setModalMsg("you can only add 2 charactaristcs ");
                      setModalOpen(true);
                    }
                  }}
                  style={{ marginRight: 6 }}
                />
              {cu}
            </label>
            ));
          })()}
        </div>
      </div>

      {/* Additional Product Details Section Header */}
      <div style={{ background: "#ededed", fontWeight: 700, fontSize: 13, padding: "6px 12px ", marginBottom: 0, letterSpacing: 0.5, display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: 8 }}>ADDITIONAL PRODUCT DETAILS</span>
      </div>
      <div style={{ height: 12 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 32, fontSize: 12 }}>
        {/* TRANSPORT AND INSTALLATION */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2, display: 'flex', alignItems: 'center' }}>
            TRANSPORT AND INSTALLATION
          </div>
          <div style={{ fontSize: 11, color: '#555', marginBottom: 6 }}>(Can choose up to 3 Transport and Installation Options)</div>
          {(() => {
            const options = [
              "FREE TRANSPORT AND INSTALLATION WITHIN 5KM OF FACTORY",
              "FREE TRANSPORT AND INSTALLATION WITHIN 20KM OF FACTORY",
              "FREE TRANSPORT AND INSTALLATION WITHIN 50KM OF FACTORY",
              "FREE TRANSPORT AND INSTALLATION WITHIN 100KM OF FACTORY",
              "FINAL TRANSPORT AND INSTALLATION COST TO BE CONFIRMED BY MANUFACTURER"
            ];
            const [selected, setSelected] = useState([]);
            return options.map((o) => (
              <label key={o} style={{ display: "block", fontSize: 13, marginBottom: 6 }}>
                <input
                  type="checkbox"
                  checked={selected.includes(o)}
                  onChange={() => {
                    if (selected.includes(o)) {
                      setSelected(selected.filter(x => x !== o));
                    } else if (selected.length < 3) {
                      setSelected([...selected, o]);
                    } else {
                      setModalMsg("you can only add 3 characteristics");
                      setModalOpen(true);
                    }
                  }}
                  style={{ marginRight: 6 }}
                />
                {o}
              </label>
            ));
          })()}
        </div>
        {/* FOUNDATION OPTIONS */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2, display: 'flex', alignItems: 'center' }}>
            FOUNDATION OPTIONS
          </div>
          <div style={{ fontSize: 11, color: '#555', marginBottom: 6 }}>(Can choose up to 3 Foundation Options)</div>
          {(() => {
            const options = [
              "NO FOUNDATION COSTS INCLUDED IN PRICE",
              "GRAVESITE CLEARING COST NOT INCLUDED IN PRICE",
              "GRAVESITE CLEARING COST INCLUDED IN PRICE",
              "CEMENT FOUNDATION COST NOT INCLUDED IN PRICE",
              "CEMENT FOUNDATION COST INCLUDED IN PRICE",
              "BRICK FOUNDATION COST INCLUDED IN PRICE",
              "X1 LAYER BRICK FOUNDATION COST INCLUDED IN PRICE",
              "X2 LAYER BRICK FOUNDATION COST INCLUDED IN PRICE",
              "X3 LAYER BRICK FOUNDATION COST INCLUDED IN PRICE"
            ];
            const [selected, setSelected] = useState([]);
            return options.map((o) => (
              <label key={o} style={{ display: "block", fontSize: 13, marginBottom: 6 }}>
                <input
                  type="checkbox"
                  checked={selected.includes(o)}
                  onChange={() => {
                    if (selected.includes(o)) {
                      setSelected(selected.filter(x => x !== o));
                    } else if (selected.length < 3) {
                      setSelected([...selected, o]);
                    } else {
                      setModalMsg("you can only add 3 characteristics");
                      setModalOpen(true);
                    }
                  }}
                  style={{ marginRight: 6 }}
                />
                {o}
              </label>
            ));
          })()}
        </div>
        {/* WARRANTY / GUARANTEE */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2, display: 'flex', alignItems: 'center' }}>
            WARRANTY / GUARANTEE
          </div>
          <div style={{ fontSize: 11, color: '#555', marginBottom: 6 }}>(Can choose up to 1 Style Option)</div>
          {(() => {
            const options = [
              "5 YEAR MANUFACTURERS WARRANTY",
              "10 YEAR MANUFACTURERS WARRANTY",
              "15 YEAR MANUFACTURERS WARRANTY",
              "20 YEAR MANUFACTURERS WARRANTY",
              "25 YEAR MANUFACTURERS WARRANTY",
              "LIFETIME MANUFACTURERS WARRANTY"
            ];
            const [selected, setSelected] = useState([]);
            return options.map((o) => (
              <label key={o} style={{ display: "block", fontSize: 13, marginBottom: 6 }}>
                <input
                  type="checkbox"
                  checked={selected.includes(o)}
                  onChange={() => {
                    if (selected.includes(o)) {
                      setSelected(selected.filter(x => x !== o));
                    } else if (selected.length < 1) {
                      setSelected([...selected, o]);
                    } else {
                      setModalMsg("you can only add 1 characteristic");
                      setModalOpen(true);
                    }
                  }}
                  style={{ marginRight: 6 }}
                />
                {o}
              </label>
            ));
          })()}
        </div>
      </div>

      {/* ADVERTISED PRICE & ADVERT FLASHER Section */}
      <div style={{ background: "#ff2d2d", color: "#fff", fontWeight: 700, fontSize: 13, padding: "8px 12px", marginBottom: 0, letterSpacing: 0.5, display: 'flex', alignItems: 'center', textTransform: 'uppercase' }}>
        ADVERTISED PRICE & ADVERT FLASHER
      </div>
      <div style={{ padding: '18px 0 0 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Price Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#222', marginRight: 4 }}>ADVERTISED PRICE</span>
          <span style={{ fontWeight: 700, fontSize: 18, color: '#ff2d2d', marginRight: 2 }}>R</span>
          <input
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            style={{
              width: 120,
              fontSize: 18,
              fontWeight: 700,
              color: "#222",
              border: "none",
              background: "transparent",
              borderBottom: "2px solid #ff2d2d",
              textAlign: "center",
              outline: "none",
              marginRight: 8,
            }}
            placeholder="000 000 . 00"
          />
        </div>
        {/* Flasher Dropdown Row */}
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: '#222', marginRight: 8 }}>ADVERT FLASHER</span>
          <span style={{ fontSize: 11, color: '#888' }}>(Can only choose 1 Advert Flasher per Ad)</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button style={{ marginTop: 8, padding: '6px 16px', borderRadius: 4, background: '#fff', border: '1px solid #ff2d2d', color: '#ff2d2d', fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}>
                {selectedFlasher.sub || selectedFlasher.main || 'Select Flasher'}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {flasherOptions.map(opt =>
                opt.sub.length > 0 ? (
                  <DropdownMenuSub key={opt.label}>
                    <DropdownMenuSubTrigger>{opt.label}</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {opt.sub.map(sub => (
                        <DropdownMenuItem key={sub} onClick={() => setSelectedFlasher({ main: opt.label, sub })}>
                          {sub}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                ) : (
                  <DropdownMenuItem key={opt.label} onClick={() => setSelectedFlasher({ main: opt.label, sub: opt.label })}>
                    {opt.label}
                  </DropdownMenuItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* Badge Row */}
        {selectedFlasher.sub && (
          <div style={{ marginTop: 12 }}>
            <Badge variant="default">{selectedFlasher.sub}</Badge>
          </div>
        )}
      </div>

      {/* Pricing Details Section Header */}
      <div style={{ background: "#ededed", fontWeight: 700, fontSize: 13, padding: "6px 12px ", marginBottom: 0, letterSpacing: 0.5, display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: 8 }}>PRICING DETAILS</span>
      </div>
      <div style={{ height: 12 }} />
      {/* Pricing Details Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1.2fr", gap: 24, marginBottom: 16, alignItems: 'end' }}>
        {/* Advertised Price */}
        <div style={{ textAlign: "center" }}>
          <label style={{ fontSize: 14, fontWeight: 700, color: "#ff0000", marginBottom: 4, display: "block" }}>Advertised Price</label>
          <input
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            style={{
              width: "90%",
              fontSize: 28,
              fontWeight: 700,
              color: "#ff0000",
              border: "none",
              background: "transparent",
              borderBottom: "2px solid #ff0000",
              textAlign: "center",
              outline: "none",
              marginBottom: 0,
            }}
          />
        </div>
        {/* Discount */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 4, display: "block" }}>Discount</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {[5, 10, 15, 17.5, 20, 25, 30, 40, 45].map((d) => (
              <label key={d} style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
                <input
                  type="radio"
                  name="discount"
                  value={d}
                  checked={discount === d}
                  onChange={() => setDiscount(d)}
                  style={{ marginRight: 4 }}
                />
                {d}%
              </label>
            ))}
          </div>
        </div>
        {/* Final Price */}
        <div style={{ textAlign: "center" }}>
          <label style={{ fontSize: 14, fontWeight: 700, color: "#00b0f0", marginBottom: 4, display: "block" }}>Final Price</label>
          <input
            type="text"
            value={finalPrice || ""}
            readOnly
            style={{
              width: "90%",
              fontSize: 28,
              fontWeight: 700,
              color: "#00b0f0",
              border: "none",
              background: "transparent",
              borderBottom: "2px solid #00b0f0",
              textAlign: "center",
              outline: "none",
              marginBottom: 0,
            }}
          />
        </div>
      </div>
      {/* Dates Row */}
      <div style={{ display: "flex", gap: 32, marginBottom: 24 }}>
        <div style={{ flex: 1 }} />
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#333", marginBottom: 4, display: "block" }}>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, padding: "6px 10px", fontSize: 12 }}
          />
          <label style={{ fontSize: 12, fontWeight: 700, color: "#333", margin: "8px 0 4px 0", display: "block" }}>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, padding: "6px 10px", fontSize: 12 }}
          />
        </div>
        <div style={{ flex: 1 }} />
      </div>

      {/* Save/Upload Buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32 }}>
        <button
          type="button"
          style={{
            background: "#e0e0e0",
            color: "#333",
            borderRadius: 4,
            padding: "10px 20px",
            fontWeight: 700,
            fontSize: 15,
            border: "none",
            cursor: "pointer",
          }}
        >
          SAVE TEMPLATE
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            style={{
              background: "#28a745",
              color: "#fff",
              borderRadius: 4,
              padding: "10px 20px",
              fontWeight: 700,
              fontSize: 15,
              border: "none",
              cursor: "pointer",
            }}
            onClick={e => {
              if (!images.some(img => img)) {
                setModalMsg("upload images to create a new listing.");
                setModalOpen(true);
                e.preventDefault();
                return;
              }
              // Use the selected category for the new listing upload
              // Example: uploadNewListing({ category, ...otherFields })
              // (Replace this comment with actual upload logic as needed)
            }}
          >
            UPLOAD
          </button>
          <button
            type="button"
            style={{
              background: "#005bac",
              color: "#fff",
              borderRadius: 4,
              padding: "10px 20px",
              fontWeight: 700,
              fontSize: 15,
              border: "none",
              cursor: "pointer",
            }}
            onClick={() => {
              // create special logic here
            }}
          >
            CREATE SPECIAL
          </button>
        </div>
      </div>

      {/* Custom Modal Popup */}
      {modalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 260, boxShadow: '0 2px 16px rgba(0,0,0,0.18)', textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>{modalMsg}</div>
            <button onClick={() => setModalOpen(false)} style={{ background: '#005bac', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 24px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
} 