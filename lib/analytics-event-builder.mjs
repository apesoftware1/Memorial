export function buildAnalyticsEventData({
  eventType,
  listingDocumentId,
  options,
  context,
}) {
  const opts = options && typeof options === "object" ? options : {};
  const ctx = context && typeof context === "object" ? context : {};

  const today = (() => {
    try {
      return new Date().toISOString().split("T")[0];
    } catch {
      return null;
    }
  })();

  const pickNonEmpty = (v) => {
    const s = typeof v === "string" ? v.trim() : "";
    return s ? s : null;
  };

  const pagePath =
    typeof opts.pagePath === "string"
      ? opts.pagePath
      : typeof ctx.pagePath === "string"
        ? ctx.pagePath
        : null;
  const pageUrl =
    typeof opts.pageUrl === "string"
      ? opts.pageUrl
      : typeof ctx.pageUrl === "string"
        ? ctx.pageUrl
        : null;
  const referrer =
    typeof opts.referrer === "string"
      ? opts.referrer
      : typeof ctx.referrer === "string"
        ? ctx.referrer
        : null;

  const utmSource = pickNonEmpty(opts.utmSource ?? ctx.utmSource);
  const utmMedium = pickNonEmpty(opts.utmMedium ?? ctx.utmMedium);
  const utmCampaign = pickNonEmpty(opts.utmCampaign ?? ctx.utmCampaign);
  const utmTerm = pickNonEmpty(opts.utmTerm ?? ctx.utmTerm);

  const deviceType = pickNonEmpty(opts.deviceType ?? ctx.deviceType);
  const userAgent = pickNonEmpty(opts.userAgent ?? ctx.userAgent);
  const sessionId = pickNonEmpty(opts.sessionId ?? ctx.sessionId);

  const searchQuery = pickNonEmpty(opts.searchQuery);
  const metadata = opts.metadata && typeof opts.metadata === "object" ? opts.metadata : null;

  const data = {
    eventType,
    timestamp: today,
    pagePath,
    pageUrl,
    referrer,
    utmSource,
    utmMedium,
    utmCampaign,
    utmTerm,
    deviceType,
    userAgent,
    sessionId,
    searchQuery,
    metadata,
  };

  const isWebsiteEvent =
    eventType === "page_view" || eventType === "search" || eventType === "filter_apply";

  if (listingDocumentId && !isWebsiteEvent) {
    data.listing = { connect: [{ documentId: listingDocumentId }] };
  }

  return data;
}

