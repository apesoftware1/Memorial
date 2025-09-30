"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import PropTypes from "prop-types";
import { FavoriteButton } from "./favorite-button";

export default function SocialShare({ socialLinks, product }) {
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const shareText = product?.title || product?.name || "Check out this memorial on TombstoneFinder";
  const encodedUrl = encodeURIComponent(currentUrl);
  const fbHref = currentUrl ? `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` : "#";
  const waHref = currentUrl
    ? `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${currentUrl}`)}`
    : "#";
  const twHref = currentUrl
    ? `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(shareText)}`
    : "#";

  const messengerAppId = process.env.NEXT_PUBLIC_FB_APP_ID;
  const messengerHref = messengerAppId && currentUrl
    ? `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=${messengerAppId}&redirect_uri=${encodedUrl}`
    : "#";

  const openInNewTab = (shareUrl) => {
    if (!shareUrl) return;
    if (typeof window !== "undefined") {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleShareClick = (e, platform) => {
    const hrefAttr = e.currentTarget.getAttribute("href");
    if (hrefAttr && hrefAttr !== "#") return;
    e.preventDefault();
    const freshUrl = typeof window !== "undefined" ? window.location.href : currentUrl;
    if (!freshUrl) return;
    const enc = encodeURIComponent(freshUrl);
    const tenc = encodeURIComponent(shareText);
    switch (platform) {
      case "facebook":
        openInNewTab(`https://www.facebook.com/sharer/sharer.php?u=${enc}`);
        break;
      case "whatsapp":
        openInNewTab(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${freshUrl}`)}`);
        break;
      case "twitter":
        openInNewTab(`https://twitter.com/intent/tweet?url=${enc}&text=${tenc}`);
        break;
      default:
        break;
    }
  };

  const handleCopy = (e) => {
    e.preventDefault();
    if (!currentUrl) return;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(currentUrl);
      // Simple feedback; can replace with toast if available in project
      alert("Link copied to clipboard");
    }
  };

  const handleWebShare = async (e) => {
    e.preventDefault();
    if (navigator.share && currentUrl) {
      try {
        await navigator.share({ title: shareText, url: currentUrl });
      } catch (err) {
        // User cancelled or share failed; no-op
      }
    } else {
      handleCopy(e);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="border border-gray-200 rounded p-4 mb-6 bg-white shadow-sm w-full md:max-w-xs">
        <div className="mb-4">
          <FavoriteButton product={product} size="md" />
        </div>
        <hr className="my-4 border-gray-200" />
        <h3 className="text-sm font-medium mb-2">Share with Friends</h3>
        <div className="flex space-x-2">
          {/* Facebook */}
          <Link href={fbHref} target="_blank" rel="noopener noreferrer" onClick={(e) => handleShareClick(e, "facebook")}>
            <Image
              src="/new files/newIcons/Social Media Icons/Advert Set-Up-03.svg"
              alt="Facebook"
              width={40}
              height={40}
            />
          </Link>

          {/* WhatsApp */}
          <Link href={waHref} target="_blank" rel="noopener noreferrer" onClick={(e) => handleShareClick(e, "whatsapp")}>
            <Image
              src="/new files/newIcons/Social Media Icons/Advert Set-Up-04.svg"
              alt="WhatsApp"
              width={40}
              height={40}
            />
          </Link>

          {/* Twitter/X */}
          <Link href={twHref} target="_blank" rel="noopener noreferrer" onClick={(e) => handleShareClick(e, "twitter")}>
            <Image
              src="/new files/newIcons/Social Media Icons/Advert Set-Up-05.svg"
              alt="Twitter/X"
              width={40}
              height={40}
            />
          </Link>

          {/* Messenger - uses FB Dialog if app id available, else copies link */}
          {messengerAppId ? (
            <Link href={messengerHref} target="_blank" rel="noopener noreferrer">
              <Image
                src="/new files/newIcons/Social Media Icons/Advert Set-Up-06.svg"
                alt="Messenger"
                width={40}
                height={40}
              />
            </Link>
          ) : (
            <a href="#" onClick={handleCopy} title="Copy link to share in Messenger">
              <Image
                src="/new files/newIcons/Social Media Icons/Advert Set-Up-06.svg"
                alt="Messenger"
                width={40}
                height={40}
              />
            </a>
          )}

          {/* Instagram - no web share intent; use Web Share API or copy link */}
          <a href="#" onClick={handleWebShare} title="Share or copy link for Instagram">
            <Image
              src="/new files/newIcons/Social Media Icons/Advert Set-Up-07.svg"
              alt="Instagram"
              width={40}
              height={40}
            />
          </a>
        </div>
      </div>
    </div>
  );
}

SocialShare.propTypes = {
  socialLinks: PropTypes.object,
  product: PropTypes.object.isRequired,
};