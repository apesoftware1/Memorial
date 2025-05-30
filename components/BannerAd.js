import Link from 'next/link'

const BannerAd = () => {
  return (
    <div className="max-w-4xl mx-auto my-6 border border-gray-300 rounded overflow-hidden">
      <Link href="https://ads.google.com" target="_blank" rel="noopener noreferrer">
        <div className="relative h-24 bg-gray-100 flex items-center justify-center">
          <p className="text-gray-500 text-sm">Banner Ad (Animated Gif - Linked to Google Ads)</p>
          <div className="absolute top-1 right-1 bg-gray-200 px-1 text-xs text-gray-500 rounded">Ad</div>
        </div>
      </Link>
    </div>
  )
}

export default BannerAd 