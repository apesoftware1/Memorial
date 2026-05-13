import fs from "node:fs/promises"
import path from "node:path"

export type CompanySpecialOfferVisibilityConfig = {
  hiddenCompanyDocumentIds: string[]
  updatedAt: string
}

const dataFilePath = () =>
  path.join(process.cwd(), ".data", "company-special-offer-visibility.json")

const defaultConfig = (): CompanySpecialOfferVisibilityConfig => ({
  hiddenCompanyDocumentIds: [],
  updatedAt: new Date(0).toISOString(),
})

const normalizeIds = (ids: unknown): string[] => {
  const arr = Array.isArray(ids) ? ids : []
  const unique = new Set<string>()
  for (const item of arr) {
    if (typeof item !== "string") continue
    const v = item.trim()
    if (!v) continue
    unique.add(v)
  }
  return Array.from(unique.values())
}

export async function readCompanySpecialOfferVisibilityConfig(): Promise<CompanySpecialOfferVisibilityConfig> {
  const file = dataFilePath()
  try {
    const raw = await fs.readFile(file, "utf8")
    const parsed = JSON.parse(raw) as Partial<CompanySpecialOfferVisibilityConfig>
    return {
      hiddenCompanyDocumentIds: normalizeIds(parsed?.hiddenCompanyDocumentIds),
      updatedAt:
        typeof parsed?.updatedAt === "string"
          ? parsed.updatedAt
          : defaultConfig().updatedAt,
    }
  } catch {
    return defaultConfig()
  }
}

export async function writeCompanySpecialOfferVisibilityConfig(
  next: Pick<CompanySpecialOfferVisibilityConfig, "hiddenCompanyDocumentIds">
): Promise<CompanySpecialOfferVisibilityConfig> {
  const file = dataFilePath()
  const dir = path.dirname(file)
  await fs.mkdir(dir, { recursive: true })
  const config: CompanySpecialOfferVisibilityConfig = {
    hiddenCompanyDocumentIds: normalizeIds(next.hiddenCompanyDocumentIds),
    updatedAt: new Date().toISOString(),
  }
  await fs.writeFile(file, JSON.stringify(config, null, 2), "utf8")
  return config
}
