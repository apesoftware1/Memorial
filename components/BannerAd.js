import Link from 'next/link'
import Image from 'next/image'

const BannerAd = ({ mobileImageSrc, desktopImageSrc, mobileContainerClasses = "w-full h-24", desktopContainerClasses = "max-w-4xl h-24" }) => {
  return (
    <div className="w-full mx-auto my-6 border border-gray-300 rounded overflow-hidden">
      <Link href="https://ads.google.com" target="_blank" rel="noopener noreferrer">
        {/* Desktop Banner */}
        <div className={`hidden md:flex relative bg-gray-100 items-center justify-center ${desktopContainerClasses}`}>
          {desktopImageSrc ? (
            <Image src={desktopImageSrc} alt="Banner Ad" fill className="object-cover" />
          ) : (
            <p className="text-gray-500 text-sm">Desktop Banner Ad (Animated Gif - Linked to Google Ads)</p>
          )}
          <div className="absolute top-1 right-1 bg-gray-200 px-1 text-xs text-gray-500 rounded">Ad</div>
        </div>

        {/* Mobile Banner */}
        <div className={`block md:hidden relative bg-gray-100 flex items-center justify-center ${mobileContainerClasses}`}>
          {mobileImageSrc ? (
            <Image src={mobileImageSrc} alt="Mobile Banner Ad" fill className="object-contain" />
          ) : (
            <p className="text-gray-500 text-sm">Mobile Banner Ad (Animated Gif - Linked to Google Ads)</p>
          )}
          <div className="absolute top-1 right-1 bg-gray-200 px-1 text-xs text-gray-500 rounded">Ad</div>
        </div>
      </Link>
    </div>
  )
}

export default BannerAd 