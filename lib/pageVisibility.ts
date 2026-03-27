import fs from "node:fs/promises";
import path from "node:path";

export type PageKey = "services" | "tombstonesOnSpecial";

export type PageVisibilityConfig = {
  hidden: PageKey[];
  updatedAt: string;
};

const PAGE_KEYS: PageKey[] = ["services", "tombstonesOnSpecial"];

const dataFilePath = () =>
  path.join(process.cwd(), ".data", "page-visibility.json");

const defaultConfig = (): PageVisibilityConfig => ({
  hidden: [],
  updatedAt: new Date(0).toISOString(),
});

const normalizeHidden = (hidden: unknown): PageKey[] => {
  const arr = Array.isArray(hidden) ? hidden : [];
  const unique = new Set<PageKey>();
  for (const item of arr) {
    if (typeof item !== "string") continue;
    if ((PAGE_KEYS as string[]).includes(item)) unique.add(item as PageKey);
  }
  return Array.from(unique.values());
};

export async function readPageVisibilityConfig(): Promise<PageVisibilityConfig> {
  const file = dataFilePath();
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw) as Partial<PageVisibilityConfig>;
    return {
      hidden: normalizeHidden(parsed?.hidden),
      updatedAt:
        typeof parsed?.updatedAt === "string"
          ? parsed.updatedAt
          : defaultConfig().updatedAt,
    };
  } catch {
    return defaultConfig();
  }
}

export async function writePageVisibilityConfig(
  next: Pick<PageVisibilityConfig, "hidden">
): Promise<PageVisibilityConfig> {
  const file = dataFilePath();
  const dir = path.dirname(file);
  await fs.mkdir(dir, { recursive: true });
  const config: PageVisibilityConfig = {
    hidden: normalizeHidden(next.hidden),
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(file, JSON.stringify(config, null, 2), "utf8");
  return config;
}

export const PAGE_VISIBILITY_KEYS = PAGE_KEYS;

