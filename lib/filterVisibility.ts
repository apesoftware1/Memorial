import fs from "node:fs/promises";
import path from "node:path";

export type FilterKey =
  | "minPrice"
  | "maxPrice"
  | "location"
  | "style"
  | "slabStyle"
  | "stoneType"
  | "colour"
  | "custom";

export type FilterVisibilityConfig = {
  hidden: FilterKey[];
  hiddenOptions: Partial<Record<FilterKey, string[]>>;
  updatedAt: string;
};

const FILTER_KEYS: FilterKey[] = [
  "minPrice",
  "maxPrice",
  "location",
  "style",
  "slabStyle",
  "stoneType",
  "colour",
  "custom",
];

const dataFilePath = () =>
  path.join(process.cwd(), ".data", "filter-visibility.json");

const defaultConfig = (): FilterVisibilityConfig => ({
  hidden: [],
  hiddenOptions: {},
  updatedAt: new Date(0).toISOString(),
});

const normalizeHidden = (hidden: unknown): FilterKey[] => {
  const arr = Array.isArray(hidden) ? hidden : [];
  const unique = new Set<FilterKey>();
  for (const item of arr) {
    if (typeof item !== "string") continue;
    if ((FILTER_KEYS as string[]).includes(item)) unique.add(item as FilterKey);
  }
  return Array.from(unique.values());
};

const normalizeHiddenOptions = (
  hiddenOptions: unknown
): Partial<Record<FilterKey, string[]>> => {
  const obj =
    hiddenOptions && typeof hiddenOptions === "object" ? hiddenOptions : {};
  const out: Partial<Record<FilterKey, string[]>> = {};
  for (const key of FILTER_KEYS) {
    const raw = (obj as any)[key];
    const arr = Array.isArray(raw) ? raw : [];
    const unique = new Set<string>();
    for (const item of arr) {
      if (typeof item !== "string") continue;
      const v = item.trim().toLowerCase();
      if (!v) continue;
      unique.add(v);
    }
    if (unique.size > 0) out[key] = Array.from(unique.values());
  }
  return out;
};

export async function readFilterVisibilityConfig(): Promise<FilterVisibilityConfig> {
  const file = dataFilePath();
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw) as Partial<FilterVisibilityConfig>;
    return {
      hidden: normalizeHidden(parsed?.hidden),
      hiddenOptions: normalizeHiddenOptions((parsed as any)?.hiddenOptions),
      updatedAt:
        typeof parsed?.updatedAt === "string"
          ? parsed.updatedAt
          : defaultConfig().updatedAt,
    };
  } catch {
    return defaultConfig();
  }
}

export async function writeFilterVisibilityConfig(
  next: Pick<FilterVisibilityConfig, "hidden" | "hiddenOptions">
): Promise<FilterVisibilityConfig> {
  const file = dataFilePath();
  const dir = path.dirname(file);
  await fs.mkdir(dir, { recursive: true });
  const config: FilterVisibilityConfig = {
    hidden: normalizeHidden(next.hidden),
    hiddenOptions: normalizeHiddenOptions(next.hiddenOptions),
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(file, JSON.stringify(config, null, 2), "utf8");
  return config;
}

export function filterVisibilityToMap(config: FilterVisibilityConfig): Record<FilterKey, boolean> {
  const hidden = new Set(config.hidden);
  return FILTER_KEYS.reduce((acc, key) => {
    acc[key] = hidden.has(key);
    return acc;
  }, {} as Record<FilterKey, boolean>);
}

export const FILTER_VISIBILITY_KEYS = FILTER_KEYS;
