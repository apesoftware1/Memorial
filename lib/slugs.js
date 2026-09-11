export function toSlugSegment(value) {
  const raw = typeof value === "string" && value.trim() ? value.trim() : "";
  if (!raw) return "";
  const decoded = (() => {
    try {
      return decodeURIComponent(raw);
    } catch (_e) {
      return raw;
    }
  })();
  const lower = decoded.toLowerCase();
  const compactCodes = lower
    .replace(/(?<=\b[a-z]{2,})\s+(?=\d{1,3}[a-z]?\b)/gi, "")
    .replace(/(?<=\b\d{1,3}[a-z]?)\s+(?=[a-z]{2,}\b)/gi, "");
  return compactCodes
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function normalizeListingSlug(raw) {
  const base = typeof raw === "string" ? raw.trim() : "";
  if (!base) return "";
  const decoded = (() => {
    try {
      return decodeURIComponent(base);
    } catch (_e) {
      return base;
    }
  })();
  return decoded
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function cleanListingSlug(slug, title) {
  const rawSlug = typeof slug === "string" ? slug.trim() : "";
  if (!rawSlug) return normalizeListingSlug(title);
  const stripped = rawSlug.replace(/(-copy-[a-z0-9]+)+/gi, "").trim();
  if (!stripped || /^[-]*$/.test(stripped)) return normalizeListingSlug(title);
  return normalizeListingSlug(stripped);
}

export function pickFirstValue(v) {
  if (!v) return "";
  if (typeof v === "string") return v.trim();
  if (Array.isArray(v)) {
    const first = v.find((x) => x !== null && x !== undefined && x !== "");
    if (first === undefined || first === null) return "";
    if (typeof first === "string") return first.trim();
    if (typeof first === "object") {
      return String(
        first.value ?? first.name ?? first.title ?? first.label ?? ""
      ).trim();
    }
    return String(first).trim();
  }
  if (typeof v === "object") {
    return String(
      v.value ?? v.name ?? v.title ?? v.label ?? ""
    ).trim();
  }
  return String(v).trim();
}

const COUNTRY_AND_PROVINCE_RE = /\b(south africa|rsa|south-africa|kzn|kwazulu[-\s]?natal|gauteng|gp|western cape|wc|eastern cape|ec|northern cape|nc|free state|fs|mpumalanga|mp|limpopo|lp|north west|nw)\b/i;
const STREET_RE = /\b(street|road|rd|ave|avenue|blvd|boulevard|drive|dr|lane|ln|way|court|ct|place|pl|terrace|ter|crescent|cres|close|cl|str|cnair|est|extension|ext)\b/i;

export function pickListingTown(listing) {
  if (!listing || typeof listing !== "object") return "";
  const firstBranch = Array.isArray(listing.branches) ? listing.branches[0] : null;
  const town1 = pickFirstValue(firstBranch?.location?.town);
  if (town1) {
    const t = town1.split(",")[0].trim();
    if (!COUNTRY_AND_PROVINCE_RE.test(t) && !STREET_RE.test(t) && !/^\d+$/.test(t)) return t;
  }
  const city1 = pickFirstValue(firstBranch?.location?.city);
  if (city1) {
    const t = city1.split(",")[0].trim();
    if (!COUNTRY_AND_PROVINCE_RE.test(t) && !STREET_RE.test(t) && !/^\d+$/.test(t)) return t;
  }
  const l1 = pickFirstValue(listing.location?.town);
  if (l1) {
    const t = l1.split(",")[0].trim();
    if (!COUNTRY_AND_PROVINCE_RE.test(t) && !STREET_RE.test(t) && !/^\d+$/.test(t)) return t;
  }
  const l2 = pickFirstValue(listing.location?.city);
  if (l2) {
    const t = l2.split(",")[0].trim();
    if (!COUNTRY_AND_PROVINCE_RE.test(t) && !STREET_RE.test(t) && !/^\d+$/.test(t)) return t;
  }
  const companyLoc = pickFirstValue(listing.company?.location);
  if (companyLoc) {
    const parts = companyLoc.split(",").map((p) => p.trim()).filter(Boolean);
    const townCandidates = parts.filter((p) => {
      if (/^\d+$/.test(p)) return false;
      if (/^\d/.test(p) && /\d$/.test(p) && p.length <= 6) return false;
      if (COUNTRY_AND_PROVINCE_RE.test(p)) return false;
      if (STREET_RE.test(p)) return false;
      if (/^\d+\s+\w/.test(p) && STREET_RE.test(p)) return false;
      if (!isNaN(Number(p.replace(/\s+/g, "")))) return false;
      return true;
    });
    const dedupedCandidates = townCandidates.length > 0
      ? townCandidates.filter((v, i, arr) => arr.findIndex((x) => x.toLowerCase() === v.toLowerCase()) === i)
      : [];
    if (dedupedCandidates.length > 0) {
      return dedupedCandidates[dedupedCandidates.length - 1];
    }
    if (parts.length >= 3) return parts[parts.length - 3];
    if (parts.length >= 2) return parts[parts.length - 2];
    if (parts.length === 1) return parts[0];
  }
  const topLoc = pickFirstValue(listing.location);
  if (topLoc && typeof topLoc === "string") {
    const parts = topLoc.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 3) return parts[parts.length - 3];
    if (parts.length >= 2) return parts[parts.length - 2];
    if (parts.length === 1) return parts[0];
  }
  return "";
}

export function normalizeTownCompare(value) {
  const base = toSlugSegment(typeof value === "string" ? value : "");
  if (!base) return "";
  if (COUNTRY_AND_PROVINCE_RE.test(base.replace(/-/g, " "))) return "";
  return base;
}

const TOWN_KW_RE = /^(granite|marble|sandstone|limestone|slate|travertine|stone|pillars|pillar|pillared|column|columns|obelisk|arch|arched|dome|domed|mausoleum|teddybear|teddy|tombstone|gravestone|headstone|memorial|tomb|executive|heart|book|openbook|classic|modern|double|single|family|child|infant|pet|standard|premium|luxury|economy|budget|value)$/i;

export function extractUrlTownSegment(rawSlug) {
  const normalized = normalizeListingSlug(rawSlug);
  if (!normalized) return "";
  const tokens = normalized.split("-").filter(Boolean);
  if (tokens.length < 3) return "";
  const tombIdx = tokens.indexOf("tombstone");
  let candidate = "";
  if (tombIdx !== -1 && tombIdx < tokens.length - 1) {
    candidate = tokens.slice(tombIdx + 1).join("-");
  } else {
    let i = tokens.length - 1;
    while (i >= 0 && TOWN_KW_RE.test(tokens[i])) i -= 1;
    if (i < 0) return "";
    let j = i;
    while (j >= 0 && !TOWN_KW_RE.test(tokens[j]) && !/^\d+$/.test(tokens[j])) j -= 1;
    const start = Math.max(0, j + 1);
    candidate = tokens.slice(start, i + 1).join("-");
  }
  if (!candidate) return "";
  if (COUNTRY_AND_PROVINCE_RE.test(candidate.replace(/-/g, " "))) return "";
  if (/^\d+$/.test(candidate)) return "";
  if (STREET_RE.test(candidate.replace(/-/g, " "))) return "";
  return normalizeTownCompare(candidate);
}

function cleanCompanyLocationCandidates(companyLocation) {
  const raw = pickFirstValue(companyLocation);
  if (!raw) return [];
  const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);
  const filtered = parts.filter((p) => {
    if (/^\d+$/.test(p)) return false;
    if (/^\d/.test(p) && /\d$/.test(p) && p.length <= 6) return false;
    if (COUNTRY_AND_PROVINCE_RE.test(p)) return false;
    if (STREET_RE.test(p)) return false;
    if (/^\d+\s+\w/.test(p) && STREET_RE.test(p)) return false;
    if (!isNaN(Number(p.replace(/\s+/g, "")))) return false;
    return true;
  });
  return filtered;
}

export function listingAvailableAtTown(listing, urlTownSlug) {
  const needle = normalizeTownCompare(urlTownSlug);
  if (!needle) return true;
  const candidates = new Set();
  if (Array.isArray(listing?.branches)) {
    for (const b of listing.branches) {
      const loc = b?.location ?? {};
      const add = (v) => {
        const n = normalizeTownCompare(v);
        if (n) candidates.add(n);
      };
      add(loc.town);
      add(loc.city);
      add(loc.area);
      add(loc.province);
      add(loc.address);
      const addrStr = pickFirstValue(loc.address);
      if (addrStr) {
        const addrParts = addrStr.split(",").map((s) => s.trim()).filter(Boolean);
        for (const p of addrParts) add(p);
      }
    }
  }
  const listingLoc = listing?.location ?? {};
  const addLoc = (v) => {
    const n = normalizeTownCompare(v);
    if (n) candidates.add(n);
  };
  addLoc(listingLoc.town);
  addLoc(listingLoc.city);
  addLoc(listingLoc.area);
  addLoc(listingLoc.province);
  addLoc(listingLoc.address);
  const companyCandidates = cleanCompanyLocationCandidates(listing?.company?.location);
  for (const t of companyCandidates) candidates.add(normalizeTownCompare(t));
  const companyTopLoc = listing?.company;
  if (companyTopLoc && typeof companyTopLoc === "object") {
    addLoc(companyTopLoc.town);
    addLoc(companyTopLoc.city);
    addLoc(companyTopLoc.area);
    addLoc(companyTopLoc.province);
  }
  if (candidates.has(needle)) return true;
  for (const cand of candidates) {
    if (cand.startsWith(needle) || needle.startsWith(cand)) return true;
    if (cand.includes(needle) || needle.includes(cand)) return true;
  }
  return false;
}

export function collectListingTownCandidates(listing) {
  const raw = new Set();
  const push = (v) => {
    const t = normalizeTownCompare(v);
    if (t) raw.add(t);
  };
  if (Array.isArray(listing?.branches)) {
    for (const b of listing.branches) {
      const loc = b?.location ?? {};
      push(loc.town);
      push(loc.city);
      push(loc.area);
    }
  }
  const listingLoc = listing?.location ?? {};
  push(listingLoc.town);
  push(listingLoc.city);
  push(listingLoc.area);
  const companyCandidates = cleanCompanyLocationCandidates(listing?.company?.location);
  for (const t of companyCandidates) push(t);
  const companyTop = listing?.company;
  if (companyTop && typeof companyTop === "object") {
    push(companyTop.town);
    push(companyTop.city);
    push(companyTop.area);
  }
  const primary = normalizeTownCompare(pickListingTown(listing));
  const arr = Array.from(raw).filter(Boolean);
  const idx = arr.indexOf(primary);
  if (idx > 0) {
    arr.splice(idx, 1);
    arr.unshift(primary);
  } else if (idx === -1 && primary) {
    arr.unshift(primary);
  }
  return arr;
}

export function buildAllCanonicalSlugsForListing(listing) {
  const towns = collectListingTownCandidates(listing);
  const name = pickFirstValue(listing?.name ?? listing?.title);
  const stoneType = pickFirstValue(listing?.productDetails?.stoneType);
  const headStyle =
    pickFirstValue(listing?.productDetails?.style) ||
    pickFirstValue(listing?.productDetails?.overallStyle) ||
    pickFirstValue(listing?.productDetails?.headstyle) ||
    pickFirstValue(listing?.productDetails?.headstoneStyle);
  const segName = toSlugSegment(name);
  const segStone = toSlugSegment(stoneType);
  const segHead = toSlugSegment(headStyle);
  const baseSegs = segHead
    ? [segName, segStone, segHead, "tombstone"]
    : [segName, segStone, "tombstone"];
  const baseFiltered = baseSegs.filter(Boolean);
  const slugs = towns.map((townSeg) => {
    const segs = townSeg ? [...baseFiltered, townSeg] : baseFiltered;
    return normalizeListingSlug(segs.join("-"));
  }).filter(Boolean);
  const deduped = slugs.filter((v, i, arr) => arr.indexOf(v) === i);
  return deduped;
}

export function buildListingCanonicalSegments(listing) {
  const name = pickFirstValue(listing?.name ?? listing?.title);
  const stoneType = pickFirstValue(listing?.productDetails?.stoneType);
  const headStyle =
    pickFirstValue(listing?.productDetails?.style) ||
    pickFirstValue(listing?.productDetails?.overallStyle) ||
    pickFirstValue(listing?.productDetails?.headstyle) ||
    pickFirstValue(listing?.productDetails?.headstoneStyle);
  const town = pickListingTown(listing);
  const segName = toSlugSegment(name);
  const segStone = toSlugSegment(stoneType);
  const segHead = toSlugSegment(headStyle);
  const segTown = toSlugSegment(town);
  if (!segHead) {
    return [segName, segStone, "tombstone", segTown].filter(Boolean);
  }
  return [segName, segStone, segHead, "tombstone", segTown].filter(Boolean);
}

export function buildListingCanonicalSlug(listing) {
  const segs = buildListingCanonicalSegments(listing);
  if (segs.length === 0) return "";
  return normalizeListingSlug(segs.join("-"));
}

export function buildListingCanonicalHref(listing) {
  const slug = buildListingCanonicalSlug(listing);
  if (!slug) return null;
  return `/tombstones/${slug}`;
}
