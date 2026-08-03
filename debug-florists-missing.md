[OPEN]

# Debug Session: florists-missing

## Symptom
- Florists are not appearing on the location landing page.

## Hypotheses (falsifiable)
1. No `localBusinesses` rows exist in Strapi for the selected town/province with `businessType = Florist` (or equivalent), or `active != true`, so the GraphQL query returns an empty list.
2. `businessType` values in Strapi don’t match what the UI expects (e.g., "florists" vs "Florist" vs "Floristry"), so florists are fetched but filtered out when building sections.
3. The location page is passing the local-business data to a component that is actually rendering “nearby locations” only, and never renders business types like florists.
4. The GraphQL query/selection set is missing required fields or uses filters that exclude florists (e.g., wrong `province`/`town` values, trimming/casing issues), so the backend returns none.
5. The UI renders the section, but CSS/layout conditions hide it or it’s rendered below the fold and looks missing (conditional rendering based on array length).

## Evidence Needed
- Which exact URL/location you checked (province/town).
- Whether `localBusinesses` returns florist rows for that province/town.
- Whether the page filters business types before rendering.

