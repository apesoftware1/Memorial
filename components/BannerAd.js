import Link from 'next/link'
import Image from 'next/image'

const BannerAd = ({
  bannerAd, // can be a string URL or an object with fields
  mobileImageSrc,
  desktopImageSrc,
  link,
  alt,
  mobileContainerClasses = "w-full h-24",
  desktopContainerClasses = "max-w-4xl h-24"
}) => {
  // Normalize any incoming src to a safe non-empty string URL or null
  const normalizeSrc = (input) => {
    if (!input) return null;
    if (typeof input === 'string') {
      const trimmed = input.trim();
      return trimmed.length ? trimmed : null;
    }
    if (typeof input === 'object') {
      const candidate = input.url || input.desktopImageSrc || input.mobileImageSrc || input.imageSrc;
      if (typeof candidate === 'string') {
        const trimmed = candidate.trim();
        return trimmed.length ? trimmed : null;
      }
    }
    return null;
  };

  const resolvedMobileSrc =
    normalizeSrc(mobileImageSrc) || normalizeSrc(bannerAd);

  const resolvedDesktopSrc =
    normalizeSrc(desktopImageSrc) || normalizeSrc(bannerAd);

  const resolvedHref =
    link ||
    (typeof bannerAd === 'string' ? "https://ads.google.com" : bannerAd?.link || "https://ads.google.com");

  const resolvedAlt =
    alt ||
    (typeof bannerAd === 'string' ? "Banner Ad" : bannerAd?.alt || "Banner Ad");

  // If no valid src for either viewport, render nothing to avoid Next/Image errors
  if (!resolvedMobileSrc && !resolvedDesktopSrc) {
    return null;
  }

  return (
    <div className="w-full mx-auto my-6 border border-gray-300 rounded overflow-hidden">
      <Link href={resolvedHref} target="_blank" rel="noopener noreferrer">
        {/* Desktop Banner */}
        <div className={`hidden md:flex relative bg-gray-100 items-center justify-center ${desktopContainerClasses}`}>
          {resolvedDesktopSrc ? (
            <Image src={resolvedDesktopSrc} alt={resolvedAlt} fill className="object-cover" unoptimized />
          ) : (
            <p className="text-gray-500 text-sm">Desktop Banner Ad (Animated Gif - Linked)</p>
          )}
          <div className="absolute top-1 right-1 bg-gray-200 px-1 text-xs text-gray-500 rounded">Ad</div>
        </div>

        {/* Mobile Banner */}
        <div className={`block md:hidden relative bg-gray-100 flex items-center justify-center ${mobileContainerClasses}`}>
          {resolvedMobileSrc ? (
            <Image src={resolvedMobileSrc} alt={resolvedAlt} fill className="object-contain" unoptimized />
          ) : (
            <p className="text-gray-500 text-sm">Mobile Banner Ad (Animated Gif - Linked)</p>
          )}
          <div className="absolute top-1 right-1 bg-gray-200 px-1 text-xs text-gray-500 rounded">Ad</div>
        </div>
      </Link>
    </div>
  )
}

export default BannerAd