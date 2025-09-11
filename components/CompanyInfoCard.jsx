import React from "react";
import Image from "next/image";
import PropTypes from "prop-types";

export default function CompanyInfoCard({ logo, rating, operatingHours, companyName }) {
  return (
    <div className="text-center mb-4">
      <div className="flex justify-center mb-2">
        <div className="relative h-32 w-64">
          <Image
            src={logo}
            alt={companyName || "Manufacturer Logo"}
            fill
            className="object-contain"
          />
        </div>
      </div>
      <div className="text-xs text-blue-500">Current Google Rating: {rating} out of 5</div>

      <div className="mt-4">
        <div className="grid grid-cols-2 gap-1 text-sm">
          <div className="font-medium">Monday to Friday</div>
          <div>{operatingHours?.monToFri || "N/A"}</div>
          <div className="font-medium">Saturday</div>
          <div>{operatingHours?.saturday || "N/A"}</div>
          <div className="font-medium">Sunday</div>
          <div>{operatingHours?.sunday || "N/A"}</div>
          <div className="font-medium">Public Holiday</div>
          <div>{operatingHours?.publicHoliday || "N/A"}</div>
        </div>
      </div>
    </div>
  );
}

CompanyInfoCard.propTypes = {
  logo: PropTypes.string.isRequired,
  rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  operatingHours: PropTypes.object,
  companyName: PropTypes.string,
};