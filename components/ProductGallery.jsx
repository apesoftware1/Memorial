import React, { useState } from "react";
import Image from "next/image";
import { FavoriteButton } from "./favorite-button";
import ImageModal from "./ImageModal";
import PropTypes from "prop-types";

export default function ProductGallery({
  images,
  selectedIndex,
  onSelect,
  productTitle,
  favoriteProduct,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleNavigate = (newIndex) => {
    onSelect(newIndex);
  };

  return (
    <>
      <div 
        className="relative w-full h-[400px] overflow-hidden mb-2 px-2 sm:px-0 cursor-pointer" 
        onClick={handleImageClick}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      >
        <Image
          src={images[selectedIndex] || "/placeholder.svg"}
          alt={productTitle}
          fill
          className="object-contain hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, 700px"
        />
        <div className="absolute top-3 right-3 z-10">
          {favoriteProduct && (
            <FavoriteButton 
              product={{
                id: favoriteProduct.id || favoriteProduct.documentId || "",
                title: favoriteProduct.title || "",
                price: favoriteProduct.price || "",
                description: favoriteProduct.description || "",
                image: images[0] || "/placeholder.jpg",
                company: {
                  name: favoriteProduct.company?.name || "",
                  location: favoriteProduct.company?.location || ""
                },
                badge: favoriteProduct.badge || ""
              }}
              size="md"
            />
          )}
        </div>
        {/* Hover overlay to indicate clickability */}
        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black/50 text-white px-3 py-1 rounded text-sm">
            Click to enlarge
          </div>
        </div>
      </div>
      
      <ImageModal
         isOpen={isModalOpen}
         onClose={handleCloseModal}
         imageSrc={images[selectedIndex] || "/placeholder.svg"}
         imageAlt={productTitle}
         images={images}
         currentIndex={selectedIndex}
         onNavigate={handleNavigate}
       />
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-1 mb-4 px-2 sm:px-0">
        {images.map((image, index) => (
          <div
            key={index}
            className={`relative h-16 w-full border cursor-pointer border-gray-200 ${
              selectedIndex === index ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={() => onSelect(index)}
          >
            <Image
              src={image || "/placeholder.svg"}
              alt={`Thumbnail ${index + 1}`}
              fill
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </>
  );
}

ProductGallery.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedIndex: PropTypes.number.isRequired,
  onSelect: PropTypes.func.isRequired,
  productTitle: PropTypes.string.isRequired,
  favoriteProduct: PropTypes.object.isRequired,
};