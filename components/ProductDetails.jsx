import React from "react";
import Image from "next/image";
import { Cross, Gem, Camera } from "lucide-react";
import PropTypes from "prop-types";

export default function ProductDetails({ productDetails, icons, getFirstValue }) {
  const { stoneTypeIcon, headStyleIcon, slabStyleIcon, colourIcon, customIcon } = icons || {};

  // Function to fix icon paths that might contain "last icons" instead of "last_icons"
  const fixIconPath = (iconPath) => {
    if (!iconPath) return null;
    return iconPath.replace("/last icons/", "/last_icons/");
  };

  // Map common color names to swatch colors
  const colorToHex = (name = "") => {
    const key = name.toLowerCase();
    const map = {
      "black": "#000000",
      "white": "#ffffff",
      "grey-light": "#d1d5db",
      "gray-light": "#d1d5db",
      "grey-dark": "#6b7280",
      "gray-dark": "#6b7280",
      "blue": "#3b82f6",
      "green": "#10b981",
      "red": "#ef4444",
      "maroon": "#7f1d1d",
      "pearl": "#f9fafb",
    };
    return map[key] || "#d1d5db";
  };

  return (
    <div className="border-y border-gray-200 py-2 mb-4">
      <div className="flex flex-wrap gap-2 text-sm text-gray-700">
        {/* Head Style */}
        {getFirstValue(productDetails.style) && (
          <div className="flex items-center border border-gray-300 rounded px-3 py-1.5 font-medium bg-white">
            <span>Head Style:</span>
            {icons?.headStyleIcon ? (
              <Image src={fixIconPath(icons.headStyleIcon)} alt="HeadStyleIcon" width={16} height={16} className="mx-2" />
            ) : (
              <Cross size={16} className="text-gray-500 mx-2" />
            )}
            <span className="font-bold">{getFirstValue(productDetails.style)}</span>
          </div>
        )}

        {/* Slab Style */}
        {Array.isArray(productDetails.slabStyle) && productDetails.slabStyle.length > 0 && (
          <div className="flex items-center border border-gray-300 rounded px-3 py-1.5 font-medium bg-white">
            <span>Slab Style:</span>
            {icons?.slabStyleIcon ? (
              <Image src={fixIconPath(icons.slabStyleIcon)} alt="SlabStyleIcon" width={16} height={16} className="mx-2" />
            ) : (
              <Gem size={16} className="text-gray-500 mx-2" />
            )}
            <span className="font-bold">{getFirstValue(productDetails.slabStyle)}</span>
          </div>
        )}

        {/* Colour */}
        {getFirstValue(productDetails.color) && (
          <div className="flex items-center border border-gray-300 rounded px-3 py-1.5 font-medium bg-white">
            <span>Colour:</span>
            {icons?.colourIcon ? (
              <Image src={fixIconPath(icons.colourIcon)} alt="ColourIcon" width={16} height={16} className="mx-2" />
            ) : (
              <Gem size={16} className="text-gray-500 mx-2" />
            )}
            <span className="font-bold">{getFirstValue(productDetails.color)}</span>
          </div>
        )}

        {/* Customisation */}
        {getFirstValue(productDetails.customization) && (
          <div className="flex items-center border border-gray-300 rounded px-3 py-1.5 font-medium bg-white">
            <span>Customisation:</span>
            {icons?.customIcon ? (
              <Image src={fixIconPath(icons.customIcon)} alt="CustomisationIcon" width={16} height={16} className="mx-2" />
            ) : (
              <Camera size={16} className="text-gray-500 mx-2" />
            )}
            <span className="font-bold">{getFirstValue(productDetails.customization)}</span>
          </div>
        )}

        {/* Stone Type (if used) */}
        {getFirstValue(productDetails.stoneType) && (
          <div className="flex items-center border border-gray-300 rounded px-3 py-1.5 font-medium bg-white">
            <span>Stone Type:</span>
            {icons?.stoneTypeIcon ? (
              <Image src={fixIconPath(icons.stoneTypeIcon)} alt="StoneTypeIcon" width={16} height={16} className="mx-2" />
            ) : (
              <Gem size={16} className="text-gray-500 mx-2" />
            )}
            <span className="font-bold">{getFirstValue(productDetails.stoneType)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

ProductDetails.propTypes = {
  productDetails: PropTypes.object.isRequired,
  icons: PropTypes.shape({
    stoneTypeIcon: PropTypes.string,
    headStyleIcon: PropTypes.string,
    slabStyleIcon: PropTypes.string,
    colourIcon: PropTypes.string,
    customIcon: PropTypes.string,
  }).isRequired,
  getFirstValue: PropTypes.func.isRequired,
  getAllValues: PropTypes.func.isRequired,
}