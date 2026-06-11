const normalizeKey = (value) =>
  typeof value === "string"
    ? value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
    : "";

const LOCATION_HIERARCHY_OVERRIDES = {
  "kwazulu-natal": {
    bhamshela: {
      targetCity: "durban",
      removeSourceCity: false,
      dropSelfNamedTown: true,
      keepSourceWithoutTowns: true,
    },
  },
};

const cloneTown = (town) => ({
  ...town,
  name: typeof town?.name === "string" ? town.name.trim() : "",
});

const cloneCity = (city) => ({
  ...city,
  name: typeof city?.name === "string" ? city.name.trim() : "",
  towns: Array.isArray(city?.towns)
    ? city.towns
        .map(cloneTown)
        .filter((town) => town.name)
    : [],
});

const cloneProvince = (province) => ({
  ...province,
  name: typeof province?.name === "string" ? province.name.trim() : "",
  cities: Array.isArray(province?.cities)
    ? province.cities
        .map(cloneCity)
        .filter((city) => city.name)
    : [],
});

export function sanitizeLocationHierarchy(hierarchy) {
  if (!Array.isArray(hierarchy) || hierarchy.length === 0) return [];

  return hierarchy
    .map(cloneProvince)
    .filter((province) => province.name)
    .map((province) => {
      const provinceKey = normalizeKey(province.name);
      const provinceOverrides = LOCATION_HIERARCHY_OVERRIDES[provinceKey] || {};
      const nextCities = [];
      const cityIndexByKey = new Map();

      const ensureCity = (preferredCity) => {
        const preferredName =
          typeof preferredCity?.name === "string" && preferredCity.name.trim()
            ? preferredCity.name.trim()
            : "";
        const preferredKey = normalizeKey(preferredName);
        if (!preferredKey) return null;

        if (cityIndexByKey.has(preferredKey)) {
          const existing = nextCities[cityIndexByKey.get(preferredKey)];
          if (
            typeof preferredCity?.count === "number" &&
            (typeof existing?.count !== "number" || preferredCity.count > existing.count)
          ) {
            existing.count = preferredCity.count;
          }
          if (Array.isArray(preferredCity?.towns) && preferredCity.towns.length > 0) {
            const existingTownKeys = new Set(
              Array.isArray(existing?.towns)
                ? existing.towns.map((town) => normalizeKey(town?.name)).filter(Boolean)
                : []
            );
            for (const town of preferredCity.towns) {
              const townClone = cloneTown(town);
              const townKey = normalizeKey(townClone.name);
              if (!townKey || existingTownKeys.has(townKey)) continue;
              existing.towns.push(townClone);
              existingTownKeys.add(townKey);
            }
          }
          return existing;
        }

        const created = {
          ...(preferredCity || {}),
          name: preferredName,
          towns: Array.isArray(preferredCity?.towns)
            ? preferredCity.towns.map(cloneTown).filter((town) => town.name)
            : [],
        };
        cityIndexByKey.set(preferredKey, nextCities.length);
        nextCities.push(created);
        return created;
      };

      for (const city of province.cities) {
        const cityKey = normalizeKey(city.name);
        const override = provinceOverrides[cityKey];

        if (!override) {
          ensureCity(city);
          continue;
        }

        const targetCity = ensureCity({ name: override.targetCity, towns: [] });
        const targetTownKeys = new Set(
          Array.isArray(targetCity?.towns)
            ? targetCity.towns.map((town) => normalizeKey(town?.name)).filter(Boolean)
            : []
        );

        const sourceTowns = Array.isArray(city.towns) ? city.towns : [];
        for (const town of sourceTowns) {
          const townName = typeof town?.name === "string" ? town.name.trim() : "";
          const townKey = normalizeKey(townName);
          if (!townKey) continue;
          if (override.dropSelfNamedTown && townKey === cityKey) continue;
          if (targetTownKeys.has(townKey)) continue;
          targetCity.towns.push(cloneTown(town));
          targetTownKeys.add(townKey);
        }

        if (!override.removeSourceCity) {
          ensureCity({
            ...city,
            towns: override.keepSourceWithoutTowns
              ? []
              : sourceTowns.filter((town) => {
                  const townKey = normalizeKey(town?.name);
                  if (!townKey) return false;
                  if (override.dropSelfNamedTown && townKey === cityKey) return false;
                  return true;
                }),
          });
        }
      }

      return {
        ...province,
        cities: nextCities,
      };
    });
}
