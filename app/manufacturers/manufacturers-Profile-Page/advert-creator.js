import { useState } from "react";

export default function AdvertCreator() {
  // Demo state for form fields
  const [category, setCategory] = useState("Full Tombstone");
  const [images, setImages] = useState([null, null, null, null, null, null]);
  const [style, setStyle] = useState("");
  const [colour, setColour] = useState("");
  const [stoneType, setStoneType] = useState("");
  const [culture, setCulture] = useState("");
  const [custom, setCustom] = useState("");
  const [price, setPrice] = useState("");
  const [flasher, setFlasher] = useState([]);
  const [discount, setDiscount] = useState("");
  const [finalPrice, setFinalPrice] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Demo options
  const categories = [
    "Full Tombstone", "Premium", "Double/Family", "Child", "Head & Base", "Cremation & Urns"
  ];
  const styles = ["Classic", "Modern", "Traditional", "Custom"];
  const colours = ["Black", "Grey", "White", "Red", "Blue"];
  const stoneTypes = ["Granite", "Marble", "Sandstone"];
  const cultures = ["Christian", "Jewish", "Muslim", "Hindu", "African"];
  const customs = ["Engraving", "Photo", "Gold Leaf", "Special Shape", "Lighting"];
  const flasherOptions = ["New", "Special", "Limited", "Popular"];
  const discountOptions = [5, 10, 15, 17.5, 20, 25, 30, 40, 45];

  // Image upload handler (demo only)
  function handleImageChange(idx, file) {
    const newImages = [...images];
    newImages[idx] = file;
    setImages(newImages);
  }

  function handleRemoveImage(e, idx) {
    e.stopPropagation();
    const newImages = [...images];
    newImages[idx] = null;
    setImages(newImages);
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
      }}>
        Create a Tombstone Advert
      </div>

      {/* Contact and Store Info */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
        marginBottom: 32,
      }}>
        <div>
          <label style={{ fontSize: 12, marginBottom: 4, display: "block" }}>Contact Name</label>
          <input style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px", outline: "none" }} />
        </div>
        <div>
          <label style={{ fontSize: 12, marginBottom: 4, display: "block" }}>Store Name</label>
          <input style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px", outline: "none" }} />
        </div>
        <div>
          <label style={{ fontSize: 12, marginBottom: 4, display: "block" }}>Contact Email</label>
          <input style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px", outline: "none" }} />
        </div>
        <div>
          <label style={{ fontSize: 12, marginBottom: 4, display: "block" }}>Store Phone</label>
          <input style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px", outline: "none" }} />
        </div>
      </div>

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

      {/* Product Description & Images */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 32 }}>
        <div>
          <label style={{ fontSize: 12, marginBottom: 4, display: "block" }}>Product Name</label>
          <input style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px", outline: "none", marginBottom: 16 }} />
          <label style={{ fontSize: 12, marginBottom: 4, display: "block" }}>Product Description</label>
          <textarea style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px", outline: "none", minHeight: 60 }} />
        </div>
        <div>
          <label style={{ fontSize: 12, marginBottom: 4, display: "block" }}>Product Images</label>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {images.map((img, idx) => (
              <div
                key={idx}
                style={{
                  width: 64,
                  height: 64,
                  border: "2px dashed #ccc",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#fafbfc",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "visible",
                }}
                onClick={() => document.getElementById(`img-upload-${idx}`).click()}
              >
                {img ? (
                  <>
                    <img src={URL.createObjectURL(img)} alt="" style={{ width: 56, height: 56, borderRadius: "50%" }} />
                    <button
                      type="button"
                      onClick={(e) => handleRemoveImage(e, idx)}
                      style={{
                        position: "absolute",
                        top: -6,
                        right: -6,
                        background: "red",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: 20,
                        height: 20,
                        fontSize: 12,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 100,
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      }}
                    >
                      X
                    </button>
                  </>
                ) : (
                  <span style={{ color: "#bbb", fontSize: 28, fontWeight: 700 }}>+</span>
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

      {/* Product Details */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 24, marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Style</div>
          {styles.map((s) => (
            <label key={s} style={{ display: "block", fontSize: 13, marginBottom: 6 }}>
              <input type="radio" name="style" value={s} checked={style === s} onChange={() => setStyle(s)} style={{ marginRight: 6 }} />
              {s}
            </label>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Colour</div>
          {colours.map((c) => (
            <label key={c} style={{ display: "block", fontSize: 13, marginBottom: 6 }}>
              <input type="radio" name="colour" value={c} checked={colour === c} onChange={() => setColour(c)} style={{ marginRight: 6 }} />
              {c}
            </label>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Stone Type</div>
          {stoneTypes.map((st) => (
            <label key={st} style={{ display: "block", fontSize: 13, marginBottom: 6 }}>
              <input type="radio" name="stoneType" value={st} checked={stoneType === st} onChange={() => setStoneType(st)} style={{ marginRight: 6 }} />
              {st}
            </label>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Culture</div>
          {cultures.map((cu) => (
            <label key={cu} style={{ display: "block", fontSize: 13, marginBottom: 6 }}>
              <input type="radio" name="culture" value={cu} checked={culture === cu} onChange={() => setCulture(cu)} style={{ marginRight: 6 }} />
              {cu}
            </label>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Customization</div>
          {customs.map((cu) => (
            <label key={cu} style={{ display: "block", fontSize: 13, marginBottom: 6 }}>
              <input type="radio" name="custom" value={cu} checked={custom === cu} onChange={() => setCustom(cu)} style={{ marginRight: 6 }} />
              {cu}
            </label>
          ))}
        </div>
      </div>

      {/* Additional Product Details */}
      <div style={{ fontSize: 12, marginBottom: 32 }}>
        <div style={{ marginBottom: 8 }}>Transport and Installation: <span style={{ color: "#888" }}>Available, Not Available</span></div>
        <div style={{ marginBottom: 8 }}>Foundation Options: <span style={{ color: "#888" }}>Standard, Reinforced</span></div>
        <div style={{ marginBottom: 8 }}>Warranty/Guarantee: <span style={{ color: "#888" }}>5 Years, 10 Years</span></div>
      </div>

      {/* Advert Price & Flasher */}
      <div style={{ display: "flex", alignItems: "center", gap: 32, marginBottom: 32 }}>
        <div style={{ flex: 1, textAlign: "center" }}>
          <label style={{ fontSize: 14, fontWeight: 700, color: "#ff0000", marginBottom: 4, display: "block" }}>Advert Price</label>
          <input
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            style={{
              width: "80%",
              fontSize: 16,
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
        <div style={{ flex: 2 }}>
          <label style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 4, display: "block" }}>Flasher</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {flasherOptions.map((f) => (
              <label key={f} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={flasher.includes(f)}
                  onChange={() => setFlasher(flasher.includes(f) ? flasher.filter(x => x !== f) : [...flasher, f])}
                  style={{ width: 18, height: 18, borderRadius: "50%", accentColor: "#ff0000" }}
                />
                <span style={{ color: flasher.includes(f) ? "#ff0000" : "#333" }}>{f}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Discount & Final Price */}
      <div style={{ display: "flex", alignItems: "center", gap: 32, marginBottom: 32 }}>
        <div style={{ flex: 2 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 4, display: "block" }}>Discount</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
            {discountOptions.map((d) => (
              <label key={d} style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
                <input
                  type="radio"
                  name="discount"
                  value={d}
                  checked={discount === d.toString()}
                  onChange={() => setDiscount(d.toString())}
                  style={{ marginRight: 4 }}
                />
                {d}%
              </label>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, textAlign: "center" }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: "#00b0f0", marginBottom: 4, display: "block" }}>Final Price</label>
          <input
            type="number"
            value={finalPrice}
            onChange={e => setFinalPrice(e.target.value)}
            style={{
              width: "80%",
              fontSize: 16,
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
      </div>

      {/* Submit Button */}
      <div style={{ textAlign: "center" }}>
        <button
          type="submit"
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
        >
          Create Advert
        </button>
      </div>
    </div>
  );
} 