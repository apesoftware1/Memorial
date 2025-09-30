import React from "react";
import Image from "next/image";
import { Clock } from "lucide-react";
import PropTypes from "prop-types";

export default function ProductDescription({ description, additionalDetails, getAllValues }) {
  return (
    <div className="border border-gray-200 rounded p-4 mb-6 bg-white shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-bold uppercase mb-2">Tombstone Description</h2>
        <p className="text-sm text-gray-700 mb-0">{description}</p>
      </div>

      <div className="mb-0">
        <h2 className="text-lg font-bold uppercase mb-0">Additional Tombstone Details</h2>
        <div className="space-y-0 text-sm text-gray-800">
          {getAllValues(additionalDetails.transportAndInstallation).length > 0 && (
            <div>
              <div className="flex items-center gap-3 font-bold text-gray-700">
                <Image
                  src="/last_icons/Addional_ProductInfo_Icons/Additional_Icons_Transport.svg"
                  alt="Transport & Installation"
                  width={42}
                  height={42}
                  className="shrink-0"
                />
                <span className="text-base">Transport and Installation</span>
              </div>
              <ul className="mt-0 text-bold-20 space-y-0 ml-[54px]">
                {getAllValues(additionalDetails.transportAndInstallation).map((detail, i) => (
                  <li key={i} className="pl-2 relative leading-snug">
                    <span className="absolute left-0 top-0 text-gray-700">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {getAllValues(additionalDetails.foundationOptions).length > 0 && (
            <div>
              <div className="flex items-center gap-3 font-bold text-gray-700">
                <Image
                  src="/last_icons/Addional_ProductInfo_Icons/Additional_Icons_Foundations.svg"
                  alt="Foundation Options"
                  width={42}
                  height={42}
                  className="shrink-0"
                />
                <span className="text-base">Foundation Options</span>
              </div>
              <ul className="mt-0 space-y-0 ml-[54px]">
                {getAllValues(additionalDetails.foundationOptions).map((detail, i) => (
                  <li key={i} className="pl-2 relative leading-snug">
                    <span className="absolute left-0 top-0 text-gray-700">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {getAllValues(additionalDetails.warrantyOrGuarantee).length > 0 && (
            <div>
              <div className="flex items-center gap-3 font-bold text-gray-700">
                <Image
                  src="/last_icons/Addional_ProductInfo_Icons/Additional_Icons_WarrentyGuarantee.svg"
                  alt="Warranty / Guarantee"
                  width={42}
                  height={42}
                  className="shrink-0"
                />
                <span className="text-base">Warranty/Guarantee</span>
              </div>
              <ul className="mt-0 space-y-0 ml-[54px]">
                {getAllValues(additionalDetails.warrantyOrGuarantee).map((detail, i) => (
                  <li key={i} className="pl-2 relative leading-snug">
                    <span className="absolute left-0 top-0 text-gray-700">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {getAllValues(additionalDetails.manufacturingLeadTime).length > 0 && (
            <div>
              <div className="flex items-center gap-3 font-bold text-gray-700">
                <Clock size={28} className="text-gray-700 shrink-0" />
                <span>Manufacturing Lead Time</span>
              </div>
              <ul className="mt-1 space-y-1">
                {getAllValues(additionalDetails.manufacturingLeadTime).map((detail, i) => (
                  <li key={i} className="pl-4 relative leading-tight">
                    <span className="absolute left-0 top-0 text-gray-700">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

ProductDescription.propTypes = {
  description: PropTypes.string,
  additionalDetails: PropTypes.object.isRequired,
  getAllValues: PropTypes.func.isRequired,
};