toolName: apply_patch
            
status: failed
          
          

        
            
toolName: edit_file_update
            
status: failed
          
            
filePath: c:\Users\kelvin\Desktop\finder\TombstoneFinder\app\manufacturers\manufacturers-Profile-Page\ManufacturerProfileEditor.jsx
          
          

        
            
toolName: view_files
            
status: success
          
            
filePath: c:\Users\kelvin\Desktop\finder\TombstoneFinder\app\manufacturers\manufacturers-Profile-Page\ManufacturerProfileEditor.jsx
          
Right now, the code for branch filtering in the Profile Editor is already very simple and strict – so the remaining mismatch is no longer a “bug in the loop”, it’s a mismatch between how Strapi is configured and what the GraphQL query returns.

Let me show you exactly what the frontend is doing, and then what you need to check/fix in Strapi so the numbers line up.

---

**1. What the frontend does for “Show X listings for MTHOFI – GLENWOOD branch”**

The logic lives here:  
[ManufacturerProfileEditor.jsx](file:///c:/Users/kelvin/Desktop/finder/TombstoneFinder/app/manufacturers/manufacturers-Profile-Page/ManufacturerProfileEditor.jsx#L350-L413)

When you switch to a branch (e.g. via `?branch=MTHOFI - GLENWOOD`), the editor runs:

```js
const branchParam = searchParams.get('branch');
if (branchParam && company?.branches?.length) {
  const branch = company.branches.find(
    b => b.name === branchParam || b.documentId === branchParam
  );
  if (branch) {
    setBranchFromUrl(branch);

    // Filter listings to show only those associated with this branch
    let branchListings = listings.filter(listing =>
      listing.branches?.some(b => b.documentId === branch.documentId)
    );

    // Override price with branch specific price if available
    branchListings = branchListings.map(listing => {
      const branchListing = listing.branch_listings?.find(bl =>
        bl.branch?.documentId === branch.documentId
      );
      if (branchListing?.price) {
        return { ...listing, price: branchListing.price };
      }
      return listing;
    });

    // Apply category filter
    if (categoryFilter !== "All Categories") {
      branchListings = branchListings.filter(listing => {
        const categoryName = listing.listing_category?.name || listing.category;
        return (categoryName || "").toLowerCase() === categoryFilter.toLowerCase();
      });
    }

    setFilteredListings(branchListings);
    setSelectedBranch(branch);
  }
}
```

Key points:

- It starts from `listings` passed into the editor, which come from `GET_COMPANY_BY_USER` (only this company’s listings).
- It **only keeps** listings where:
  - `listing.branches` contains the current branch (GLENWOOD).
- `branch_listings` is used **only** to override the price, not to decide membership.
- It then applies the category filter.

The “Showing 23 listings for MTHOFI – GLENWOOD branch” line is:

```jsx
Showing {filteredListings.length} listings for {branchFromUrl.name} branch
```

So **23** means:

> 23 listings belonging to this company where `listing.branches` includes GLENWOOD and the listing passes the current category filter.

---

**2. Why Strapi shows “81” for GLENWOOD**

In Strapi Admin you are looking at a **different scope**:

- When you open the branch `MTHOFI - GLENWOOD` and see “81 listings”, that’s the **branch → listings** relation:
  - All listings linked to that branch in Strapi.
  - This list is *not* automatically filtered by:
    - company,
    - GraphQL’s published state,
    - the current category selection on the Profile Page.

So:

- Strapi “81” = **all** listings attached to GLENWOOD in the DB.
- Frontend “23” = **only this company’s GraphQL listings where `listing.branches` includes GLENWOOD and category matches.**

If some of those 81:

- belong to another company,
- are draft/unpublished,
- or don’t pass your category filter,

they simply won’t appear in `company.listings` in the GraphQL response, and so cannot be counted by the editor.

---

**3. What we’ve already fixed in code**

These pieces are already aligned:

- **Company data**:  
  [manufacturers-Profile-Page/page.js](file:///c:/Users/kelvin/Desktop/finder/TombstoneFinder/app/manufacturers/manufacturers-Profile-Page/page.js#L34-L40) uses:

  ```js
  const { data, ... } = useQuery(GET_COMPANY_BY_USER, {
    variables: { documentId },
    skip: !documentId,
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });
  ```

  So it always fetches fresh company + listings.

- **Branches**:  
  [getCompany.js](file:///c:/Users/kelvin/Desktop/finder/TombstoneFinder/graphql/queries/getCompany.js#L12-L21) now requests all branches:

  ```graphql
  branches(pagination: { limit: -1 }) {
    documentId
    name
    location { ... }
  }
  ```

- **Branch membership** on the Profile Page:
  - Uses only `listing.branches` to decide if a listing belongs to a branch.
  - Uses `branch_listings` only to override price, not to “invent” membership.

So from the frontend side, the logic is now:

> “Show the listings that both belong to this company and are directly attached to this branch.”

That’s exactly what you want for the branch view.

---

**4. How to actually fix the mismatch**

At this point, the remaining mismatch is **in the Strapi data**, not the frontend code.

To make “Showing X listings for MTHOFI – GLENWOOD branch” match what you expect:

1. **Choose the canonical truth for branch membership**  
   - We’ve already chosen: `listing.branches` / `branch.listings` is the source of truth for “which listings belong to a branch”.
   - `branch_listings` is only for per-branch pricing.

2. **In Strapi, for GLENWOOD:**
   - Open the GLENWOOD branch.
   - In the `listings` relation:
     - Make sure every listing you think “should be in GLENWOOD”:
       - Has `company` = MTHOFI GROUP (so it shows up in `company.listings`).
       - Is **published** (so GraphQL returns it).
       - Has the category you’re currently viewing (or select “All Categories” in the Editor).
   - If there are listings attached to GLENWOOD that belong to other companies or are drafts, they will contribute to Strapi’s “81”, but **cannot** appear in the Profile Page for this manufacturer.

3. **Optionally, clean up legacy links:**
   - If some listings are only connected via `branch_listings` and not via `branch.listings`, they will not be counted anymore for branch membership (by design).
   - For those, go into Strapi and add them to the branch’s `listings` relation if they really belong to that branch.

After you do that for GLENWOOD:

- The number of listings you see under that branch (for MTHOFI GROUP, published, correct category) should converge toward the frontend’s “Showing X listings…”.
- Because the frontend is now strictly: **company listings ∩ branch.listings ∩ (category filter)**.

There isn’t a further code change that can “pull 81” if GraphQL isn’t returning those listings for this company; the fix is to align the Strapi relations (company + branch + publish status) to the business truth you want.