# Infinite Loop Fix Plan: Manufacturer Profile Page

## Diagnosis
The "Maximum update depth exceeded" error is caused by a cycle of layout shifts and re-renders between `FavoriteButton` (layout shift on mount), `VirtuosoGrid` (virtualization recalc), and unstable component references.

## Step 1: Stabilize `FavoriteButton` Layout (COMPLETED)
**Location:** `components/favorite-button.tsx`
**Status:** ✅ Fixed
**Problem:** `FavoriteButton` returns `null` initially (height 0) and then renders a button (height ~20px) after hydration. This layout shift triggers `VirtuosoGrid` to recalculate.
**Fix:** Render a transparent placeholder of the same size during the initial server-side/hydration phase.

## Step 2: Stabilize `ManufacturerProfileEditor` Grid Items (COMPLETED)
**Location:** `app/manufacturers/manufacturers-Profile-Page/ManufacturerProfileEditor.jsx`
**Status:** ✅ Fixed
**Problem:** The `itemContent` prop passed to `VirtuosoGrid` is an inline function. This creates a new function reference on every render, causing `VirtuosoGrid` to unmount and remount all items.
**Fix:** Wrap `itemContent` in `useCallback`.

## Step 3: Optimize `ListingCardItem` Props (COMPLETED)
**Location:** `app/manufacturers/manufacturers-Profile-Page/ListingCardItem.jsx`
**Status:** ✅ Fixed
**Problem:** `ListingCardItem` creates a new `company` object and `listing` object on every render. This bypasses `React.memo` optimization in child components.
**Fix:** Use `useMemo` to create stable objects for `company` and `listing`.
