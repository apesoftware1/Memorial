import Image from "next/image";
import Link from "next/link";
import { Star, MapPin } from "lucide-react";
// Removed: import { getManufacturerSlug } from "@/lib/data";

const ManufacturerCard = ({ manufacturer }) => {

  const profileUrl = `/manufacturers/manufacturers-Profile-Page/${manufacturer.documentId}`;
  return (
    <div className="bg-[#fafbfc] border border-gray-200 shadow-sm hover:shadow-md transition-shadow mb-6 w-full max-w-2xl ml-0 mr-auto p-6 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 min-h-[200px]">
      {/* Logo */}
      
      <div className="relative flex-shrink-0 flex items-center justify-center w-full h-44 sm:w-56 sm:h-36 bg-white border border-gray-100 mb-2 sm:mb-0">
        <Link href={profileUrl} prefetch={false} aria-label={`View ${manufacturer.name} profile`}>
          <Image
            src={manufacturer.logoUrl}
            alt={manufacturer.name}
            fill
            className="object-contain"
          />
        </Link>
      </div>
      {/* Content */}
      <div className="flex-1 min-w-0 w-full">
        <div className="flex flex-col gap-0">
          <Link href={profileUrl} prefetch={false} className="font-bold text-gray-900 text-base sm:text-lg truncate" aria-label={`View ${manufacturer.name} profile`}>
            {manufacturer.name}
          </Link>
          <div className="flex items-center text-xs sm:text-sm text-gray-600 mt-1">
            <Star className="h-4 w-4 text-blue-400 mr-1" />
            <span className="font-semibold text-blue-500 mr-1">{manufacturer.rating}</span>
            <span className="text-gray-500">(15 reviews)</span>
            <span className="ml-1 text-blue-400 cursor-pointer" title="More info">&#9432;</span>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-gray-700 mt-1 truncate">{manufacturer.description}</p>
        <div className="flex flex-col gap-1 mt-3">
          <Link href="#" className="text-blue-600 font-semibold text-xs sm:text-sm hover:underline">
            {manufacturer.listings?.length} Tombstones Listed
          </Link>
          <div className="flex items-center text-gray-500 text-xs mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{manufacturer.location} • {manufacturer.distance}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManufacturerCard; 