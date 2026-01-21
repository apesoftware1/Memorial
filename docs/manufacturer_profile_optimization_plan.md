# ManufacturerProfileEditor Performance Optimization Roadmap

## The Core Problems

### 1. Massive Component Size
- Single 2000+ line component doing everything
- No code splitting = entire bundle loads upfront
- Every state change triggers potential full re-render

### 2. Expensive Operations on Every Render
- Array sorting happening in render (`.sort()` inside JSX)
- Multiple `.filter()` and `.map()` chains in render
- Complex computations not memoized

### 3. Excessive State
- 20+ useState declarations creating unnecessary re-renders
- Related state not grouped (causes cascade updates)
- Derived state stored instead of computed

### 4. Heavy Nested useEffects
- Multiple effects watching same dependencies
- No cleanup in several effects
- Branch filtering logic duplicated 3 times in one useEffect

### 5. No Virtualization
- Rendering all listings at once (potentially 150+)
- Each listing card is complex with images
- Mobile renders full desktop markup then hides with CSS

---

## The Lightning Speed Fixes (Priority Order)

### 1. Virtualize the Listings Grid (Biggest Impact: 70-80%)
**Problem:** Rendering 150 listing cards simultaneously kills performance.
**Fix:** Only render visible cards plus buffer.
**Why:** Browser only displays ~6 cards at once. Rendering 144 invisible cards is pure waste.

### 2. Memoize Sorted/Filtered Listings (Impact: 30-40%)
**Problem:** Sorting/filtering runs on every render inside JSX.
**Fix:** Use `useMemo` to compute once per dependency change.
**Current Code Issue:**
```javascript
{[...(branchFromUrl ? filteredListings : companyListings)]
  .sort((a, b) => { /* expensive sort */ })
  .map((listing) => ...)}
```
This runs the entire sort on EVERY parent re-render.

### 3. Extract Listing Card to Separate Component (Impact: 40-50%)
**Problem:** Inline rendering prevents `React.memo` optimization.
**Fix:** Separate component with memo prevents unnecessary re-renders.

### 4. Consolidate Related State (Impact: 20-30%)
**Problem:** 20+ separate useState = 20+ potential re-render triggers.
**Fix:** Group related state into objects, use `useReducer` for complex state.
**Example:**
```javascript
// Instead of:
const [editingField, setEditingField] = useState(null);
const [editValue, setEditValue] = useState("");
const [editingSocialLinks, setEditingSocialLinks] = useState({});

// Use:
const [editState, setEditState] = useState({
  field: null,
  value: "",
  socialLinks: {}
});
```

### 5. Move Static Data Outside Component (Impact: 15-20%)
**Problem:** Icon maps recreated every render.
**Fix:** Move to constants file.
**Detail:** All those massive icon map objects (`COLOR_ICON_MAP`, `HEAD_STYLE_ICON_MAP`, etc.) inside `handleDuplicate` get recreated every time the component renders.

### 6. Lazy Load Modals (Impact: 10-15%)
**Problem:** All modal components load upfront even when never opened.
**Fix:** Dynamic imports for modals.

### 7. Optimize Branch Filtering Logic (Impact: 25-30%)
**Problem:** Massive duplicated `useEffect` with 3 identical filtering blocks.
**Fix:** Extract to single memoized function.
**Detail:** That 50+ line `useEffect` starting at line 398 has the same filtering logic repeated 3 times. Single memoized function would be 10 lines.

### 8. Debounce Search/Filter Changes (Impact: 15-20%)
**Problem:** Every filter change triggers immediate re-render.
**Fix:** Debounce by 150ms.

### 9. Image Optimization (Impact: 30-40%)
**Problem:** All images load eagerly.
**Fix:** Lazy load images below fold, use proper sizes prop.

### 10. Remove Mobile Conditional Rendering (Impact: 20-25%)
**Problem:** Rendering full desktop version then hiding with CSS wastes cycles.
**Fix:** Use separate components or at least early return.

---

## Implementation Plan

### Phase 1 (Immediate 80% improvement)
- [x] 1. Memoize sorted/filtered listings
- [x] 2. Extract listing card to memo component
- [x] 3. Move icon maps to constants file
- [ ] 4. Fix branch filtering useEffect

### Phase 2 (Another 15% improvement)
- [x] 5. Add virtualization for listings grid
- [x] 6. Lazy load modals
- [x] 7. Consolidate state

### Phase 3 (Final 5% optimization)
- [x] 8. Image lazy loading
- [ ] 9. Debounce filters
- [ ] 10. Mobile rendering optimization
