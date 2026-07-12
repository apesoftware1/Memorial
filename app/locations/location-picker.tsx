"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, MapPin, Search } from "lucide-react";
import { LOCATION_LANDING_SEO_OPTIONS_QUERY } from "@/graphql/queries/locationLandingSeoOptions";

type LocationPickerProps = {
  currentProvince?: string | null;
  currentCity?: string | null;
  currentTown?: string | null;
};

type BackendLocationLandingSeo = {
  province?: string | null;
  locationType?: string | null;
  locationValue?: string | null;
  cityContext?: string | null;
};

type LocationTownOption = {
  town: string;
  city: string | null;
  slug: string;
};

type LocationCityGroup = {
  name: string | null;
  towns: LocationTownOption[];
};

type LocationProvinceGroup = {
  name: string;
  cities: LocationCityGroup[];
};

type LocationLandingSeoOptionsData = {
  locationLandingSeos?: BackendLocationLandingSeo[] | null;
};

const PROVINCE_ABBREVIATIONS: Record<string, string> = {
  "eastern cape": "EC",
  "free state": "FS",
  gauteng: "GP",
  "kwa-zulu natal": "KZN",
  kwazulu: "KZN",
  "kwazulu natal": "KZN",
  limpopo: "LP",
  mpumalanga: "MP",
  "north west": "NW",
  "northern cape": "NC",
  "western cape": "WC",
};

function normalize(value?: string | null) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizeText(value?: string | null) {
  const trimmed = typeof value === "string" ? value.trim().replace(/_/g, "-") : "";
  return trimmed || null;
}

function collapseCity(city: string | null, town: string | null) {
  if (!city || !town) return city;
  return normalize(city) === normalize(town) ? null : city;
}

function slugifySegment(value: string) {
  return encodeURIComponent(
    value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-")
  );
}

function buildLocationPath(
  province?: string | null,
  city?: string | null,
  town?: string | null
) {
  const provinceValue = typeof province === "string" ? province.trim() : "";
  const cityValue = typeof city === "string" ? city.trim() : "";
  const townValue = typeof town === "string" ? town.trim() : "";

  if (!provinceValue || !townValue) return "";

  if (cityValue && normalize(cityValue) !== normalize(townValue)) {
    return `/locations/${slugifySegment(provinceValue)}/${slugifySegment(cityValue)}/${slugifySegment(townValue)}`;
  }

  return `/locations/${slugifySegment(provinceValue)}/${slugifySegment(townValue)}`;
}

function provinceShortLabel(value?: string | null) {
  const normalized = normalize(value);
  if (!normalized) return "";
  return PROVINCE_ABBREVIATIONS[normalized] || value?.trim() || "";
}

function buildLocationGroups(rows: BackendLocationLandingSeo[] | null | undefined): LocationProvinceGroup[] {
  const provinceMap = new Map<
    string,
    { province: string; cities: Map<string, { name: string | null; towns: Map<string, LocationTownOption> }> }
  >();

  for (const row of rows || []) {
    const province = normalizeText(row?.province);
    const locationType = normalizeText(row?.locationType);
    const town = normalizeText(row?.locationValue);
    const city = collapseCity(normalizeText(row?.cityContext), town);

    if (!province || !town || normalize(locationType) !== "town") continue;

    if (!provinceMap.has(province)) {
      provinceMap.set(province, { province, cities: new Map() });
    }

    const provinceGroup = provinceMap.get(province)!;
    const cityKey = city || "__NO_CITY__";
    if (!provinceGroup.cities.has(cityKey)) {
      provinceGroup.cities.set(cityKey, { name: city, towns: new Map() });
    }

    const cityGroup = provinceGroup.cities.get(cityKey)!;
    const slug = buildLocationPath(province, city, town);
    if (!cityGroup.towns.has(slug)) {
      cityGroup.towns.set(slug, { town, city, slug });
    }
  }

  return Array.from(provinceMap.values())
    .map((provinceGroup) => ({
      name: provinceGroup.province,
      cities: Array.from(provinceGroup.cities.values())
        .map((cityGroup) => ({
          name: cityGroup.name,
          towns: Array.from(cityGroup.towns.values()).sort((left, right) => left.town.localeCompare(right.town)),
        }))
        .sort((left, right) => String(left.name || "").localeCompare(String(right.name || ""))),
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

function buildSummary(
  province?: string | null,
  city?: string | null,
  town?: string | null
) {
  const provinceLabel = provinceShortLabel(province);
  const townLabel = typeof town === "string" ? town.trim() : "";
  const cityLabel = typeof city === "string" ? city.trim() : "";

  if (provinceLabel && townLabel) return `${provinceLabel} > ${townLabel}`;
  if (provinceLabel && cityLabel) return `${provinceLabel} > ${cityLabel}`;
  return provinceLabel;
}

function useLocationSelection(
  currentProvince?: string | null,
  currentCity?: string | null,
  currentTown?: string | null
) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const { data, loading } = useQuery<LocationLandingSeoOptionsData>(LOCATION_LANDING_SEO_OPTIONS_QUERY, {
    fetchPolicy: "cache-first",
  });

  const provinces = useMemo(
    () => buildLocationGroups(data?.locationLandingSeos),
    [data]
  );

  const derivedSelection = useMemo(() => {
    const province = provinces.find((item) => normalize(item.name) === normalize(currentProvince)) || null;
    if (!province) {
      return { provinceName: "", cityName: "", townSlug: "" };
    }

    const matchedCity =
      province.cities.find((item) => normalize(item.name) === normalize(currentCity)) ||
      province.cities.find((item) => item.towns.some((town) => normalize(town.town) === normalize(currentTown))) ||
      province.cities[0] ||
      null;

    if (!matchedCity) {
      return { provinceName: province.name, cityName: "", townSlug: "" };
    }

    const matchedTown =
      matchedCity.towns.find((town) => normalize(town.town) === normalize(currentTown)) ||
      matchedCity.towns[0] ||
      null;

    return {
      provinceName: province.name,
      cityName: matchedCity.name || "",
      townSlug: matchedTown?.slug || "",
    };
  }, [currentProvince, currentCity, currentTown, provinces]);

  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProvinceName, setSelectedProvinceName] = useState(derivedSelection.provinceName);
  const [selectedCityName, setSelectedCityName] = useState(derivedSelection.cityName);
  const [selectedTownSlug, setSelectedTownSlug] = useState(derivedSelection.townSlug);

  useEffect(() => {
    setSelectedProvinceName(derivedSelection.provinceName);
    setSelectedCityName(derivedSelection.cityName);
    setSelectedTownSlug(derivedSelection.townSlug);
  }, [derivedSelection]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const selectedProvince =
    provinces.find((province) => normalize(province.name) === normalize(selectedProvinceName)) || null;
  const availableCities = selectedProvince?.cities || [];
  const shouldShowCity = availableCities.some((city) => Boolean(city.name));
  const selectedCity =
    (shouldShowCity
      ? availableCities.find((city) => normalize(city.name) === normalize(selectedCityName))
      : availableCities[0]) || null;
  const townOptions = selectedCity?.towns || [];
  const selectedTown =
    townOptions.find((town) => town.slug === selectedTownSlug) ||
    townOptions.find((town) => normalize(town.town) === normalize(currentTown)) ||
    null;

  useEffect(() => {
    if (!selectedProvince) return;

    if (!shouldShowCity) {
      if (selectedCityName) setSelectedCityName("");
      return;
    }

    const isCurrentCityValid = availableCities.some((city) => normalize(city.name) === normalize(selectedCityName));
    if (!isCurrentCityValid) {
      setSelectedCityName(selectedCity?.name || "");
    }
  }, [availableCities, selectedCity, selectedCityName, selectedProvince, shouldShowCity]);

  useEffect(() => {
    if (!townOptions.length) {
      if (selectedTownSlug) setSelectedTownSlug("");
      return;
    }

    const isValidTown = townOptions.some((town) => town.slug === selectedTownSlug);
    if (!isValidTown) {
      setSelectedTownSlug(townOptions[0]?.slug || "");
    }
  }, [selectedTownSlug, townOptions]);

  const resetSelection = () => {
    setSelectedProvinceName("");
    setSelectedCityName("");
    setSelectedTownSlug("");
  };

  const navigateToTown = () => {
    if (!selectedTown?.slug) return;
    router.push(selectedTown.slug);
    setShowDropdown(false);
  };

  return {
    dropdownRef,
    provinces,
    loading,
    showDropdown,
    setShowDropdown,
    selectedProvinceName,
    setSelectedProvinceName,
    selectedCityName,
    setSelectedCityName,
    selectedTownSlug,
    setSelectedTownSlug,
    selectedProvince,
    shouldShowCity,
    availableCities,
    townOptions,
    selectedTown,
    resetSelection,
    navigateToTown,
  };
}

type CascadeFieldsProps = {
  provinces: LocationProvinceGroup[];
  loading: boolean;
  selectedProvinceName: string;
  setSelectedProvinceName: (value: string) => void;
  selectedCityName: string;
  setSelectedCityName: (value: string) => void;
  selectedTownSlug: string;
  setSelectedTownSlug: (value: string) => void;
  availableCities: LocationCityGroup[];
  shouldShowCity: boolean;
  townOptions: LocationTownOption[];
  compact?: boolean;
};

function CascadeFields({
  provinces,
  loading,
  selectedProvinceName,
  setSelectedProvinceName,
  selectedCityName,
  setSelectedCityName,
  selectedTownSlug,
  setSelectedTownSlug,
  availableCities,
  shouldShowCity,
  townOptions,
  compact = false,
}: CascadeFieldsProps) {
  const labelClassName = compact
    ? "mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500"
    : "mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500";
  const selectClassName = compact
    ? "h-10 w-full border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none"
    : "h-11 w-full border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none";

  return (
    <div className={`grid gap-3 ${shouldShowCity ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
      <label className="block">
        <span className={labelClassName}>Province</span>
        <select
          value={selectedProvinceName}
          onChange={(event) => {
            setSelectedProvinceName(event.target.value);
            setSelectedCityName("");
            setSelectedTownSlug("");
          }}
          disabled={loading}
          className={selectClassName}
        >
          <option value="">Select province</option>
          {provinces.map((province) => (
            <option key={province.name} value={province.name}>
              {province.name}
            </option>
          ))}
        </select>
      </label>

      {shouldShowCity ? (
        <label className="block">
          <span className={labelClassName}>City</span>
          <select
            value={selectedCityName}
            onChange={(event) => {
              setSelectedCityName(event.target.value);
              setSelectedTownSlug("");
            }}
            disabled={loading || !availableCities.length}
            className={selectClassName}
          >
            <option value="">Select city</option>
            {availableCities
              .filter((city) => city.name)
              .map((city) => (
                <option key={city.name || "city"} value={city.name || ""}>
                  {city.name}
                </option>
              ))}
          </select>
        </label>
      ) : null}

      <label className="block">
        <span className={labelClassName}>Town</span>
        <select
          value={selectedTownSlug}
          onChange={(event) => setSelectedTownSlug(event.target.value)}
          disabled={loading || !townOptions.length}
          className={selectClassName}
        >
          <option value="">{loading ? "Loading towns..." : "Select town"}</option>
          {townOptions.map((town) => (
            <option key={town.slug} value={town.slug}>
              {town.town}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export default function LocationPicker({
  currentProvince,
  currentCity,
  currentTown,
}: LocationPickerProps) {
  const {
    dropdownRef,
    provinces,
    loading,
    showDropdown,
    setShowDropdown,
    selectedProvinceName,
    setSelectedProvinceName,
    selectedCityName,
    setSelectedCityName,
    selectedTownSlug,
    setSelectedTownSlug,
    availableCities,
    shouldShowCity,
    townOptions,
    selectedTown,
    resetSelection,
    navigateToTown,
  } = useLocationSelection(currentProvince, currentCity, currentTown);

  const selectedLabel = selectedTown?.town || "Location";

  return (
    <section className="rounded-3xl bg-[#005d77] px-4 py-4 text-white shadow-sm sm:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="min-w-0 lg:w-64">
          <p className="text-sm font-medium text-white/80">Browse another location</p>
          <p className="mt-1 text-lg font-semibold">Select province, city, and town</p>
        </div>

        <div className="relative flex-1" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowDropdown((prev) => !prev)}
            className="flex w-full items-center rounded-xl border border-white/20 bg-white px-4 py-3 text-left text-gray-900 shadow-sm"
          >
            <MapPin className="mr-3 h-4 w-4 shrink-0 text-gray-400" />
            <span className={`min-w-0 flex-1 truncate text-sm ${selectedTown ? "text-gray-900" : "text-gray-500"}`}>
              {selectedLabel}
            </span>
            <ChevronDown className="ml-3 h-4 w-4 shrink-0 text-gray-400" />
          </button>

          {showDropdown ? (
            <div className="absolute z-50 mt-2 w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Locations</span>
                <button
                  type="button"
                  className="text-xs font-semibold uppercase tracking-wide text-blue-600 hover:text-blue-800"
                  onClick={resetSelection}
                >
                  Reset
                </button>
              </div>

              <CascadeFields
                provinces={provinces}
                loading={loading}
                selectedProvinceName={selectedProvinceName}
                setSelectedProvinceName={setSelectedProvinceName}
                selectedCityName={selectedCityName}
                setSelectedCityName={setSelectedCityName}
                selectedTownSlug={selectedTownSlug}
                setSelectedTownSlug={setSelectedTownSlug}
                availableCities={availableCities}
                shouldShowCity={shouldShowCity}
                townOptions={townOptions}
              />

              {!loading && !provinces.length ? (
                <div className="mt-3 text-sm text-gray-500">No backend locations available yet.</div>
              ) : null}

              <button
                type="button"
                onClick={navigateToTown}
                disabled={loading || !selectedTown?.slug}
                className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-amber-300"
              >
                <Search className="h-4 w-4" />
                View Location
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function HeaderLocationPicker({
  currentProvince,
  currentCity,
  currentTown,
}: LocationPickerProps) {
  const {
    dropdownRef,
    provinces,
    loading,
    showDropdown,
    setShowDropdown,
    selectedProvinceName,
    setSelectedProvinceName,
    selectedCityName,
    setSelectedCityName,
    selectedTownSlug,
    setSelectedTownSlug,
    availableCities,
    shouldShowCity,
    townOptions,
    selectedProvince,
    selectedTown,
    resetSelection,
    navigateToTown,
  } = useLocationSelection(currentProvince, currentCity, currentTown);

  const summary = buildSummary(selectedProvince?.name, selectedTown?.city, selectedTown?.town);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setShowDropdown((prev) => !prev)}
        className="px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
      >
        <span className="flex items-center">
          Locations
          <ChevronDown className="ml-1 h-4 w-4" />
        </span>
      </button>

      {summary && selectedTown?.slug ? (
        <Link
          href={selectedTown.slug}
          className="mt-0.5 block px-3 text-left text-[11px] font-semibold uppercase tracking-wide text-[#005d77] hover:underline"
        >
          {summary}
        </Link>
      ) : null}

      {showDropdown ? (
        <div className="absolute left-0 top-full z-50 mt-2 w-[24rem] rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Locations</span>
            <button
              type="button"
              className="text-xs font-semibold uppercase tracking-wide text-blue-600 hover:text-blue-800"
              onClick={resetSelection}
            >
              Reset
            </button>
          </div>

          <CascadeFields
            provinces={provinces}
            loading={loading}
            selectedProvinceName={selectedProvinceName}
            setSelectedProvinceName={setSelectedProvinceName}
            selectedCityName={selectedCityName}
            setSelectedCityName={setSelectedCityName}
            selectedTownSlug={selectedTownSlug}
            setSelectedTownSlug={setSelectedTownSlug}
            availableCities={availableCities}
            shouldShowCity={shouldShowCity}
            townOptions={townOptions}
            compact
          />

          {!loading && !provinces.length ? (
            <div className="mt-3 text-sm text-gray-500">No backend locations available yet.</div>
          ) : null}

          <button
            type="button"
            onClick={navigateToTown}
            disabled={loading || !selectedTown?.slug}
            className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-amber-300"
          >
            <Search className="h-4 w-4" />
            View Location
          </button>
        </div>
      ) : null}
    </div>
  );
}
