import React from "react";
import Link from "next/link";
import Image from "next/image";
import PropTypes from "prop-types";
import { FavoriteButton } from "./favorite-button";

export default function SocialShare({ socialLinks, product }) {
  return (
    <div className="flex flex-col items-center">
      <div className="border border-gray-200 rounded p-4 mb-6 bg-white shadow-sm w-full md:max-w-xs">
        <div className="mb-4">
          <FavoriteButton product={product} size="md" />
        </div>
        <hr className="my-4 border-gray-200" />
        <h3 className="text-sm font-medium mb-2">Share with Friends</h3>
        <div className="flex space-x-2">
          <Link href={socialLinks?.facebook || "#"}>
            <Image
              src="/new files/newIcons/Social Media Icons/Advert Set-Up-03.svg"
              alt="Facebook"
              width={40}
              height={40}
            />
          </Link>
          <Link href={socialLinks?.whatsapp || "#"}>
            <Image
              src="/new files/newIcons/Social Media Icons/Advert Set-Up-04.svg"
              alt="WhatsApp"
              width={40}
              height={40}
            />
          </Link>
          <Link href={socialLinks?.x || "#"}>
            <Image
              src="/new files/newIcons/Social Media Icons/Advert Set-Up-05.svg"
              alt="Twitter/X"
              width={40}
              height={40}
            />
          </Link>
          <Link href={socialLinks?.messenger || "#"}>
            <Image
              src="/new files/newIcons/Social Media Icons/Advert Set-Up-06.svg"
              alt="Messenger"
              width={40}
              height={40}
            />
          </Link>
          <Link href={socialLinks?.instagram || "#"}>
            <Image
              src="/new files/newIcons/Social Media Icons/Advert Set-Up-07.svg"
              alt="Instagram"
              width={40}
              height={40}
            />
          </Link>
        </div>
      </div>
    </div>
  );
}

SocialShare.propTypes = {
  socialLinks: PropTypes.object,
  product: PropTypes.object.isRequired,
};