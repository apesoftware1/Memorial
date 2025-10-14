"use client"; 
 
import React, { useEffect } from "react"; 
import Image from "next/image"; 
import { X, ChevronLeft, ChevronRight } from "lucide-react"; 

export default function ImageModal({ 
  isOpen, 
  onClose, 
  imageSrc, 
  imageAlt, 
  images, 
  currentIndex, 
  onNavigate, 
}) { 
  const showNavigation = images && images.length > 1; 

  // Handle key navigation 
  useEffect(() => { 
    const handleKeyDown = (e) => { 
      if (e.key === "Escape") onClose(); 
      else if (e.key === "ArrowLeft" && showNavigation) 
        handlePrevious(); 
      else if (e.key === "ArrowRight" && showNavigation) 
        handleNext(); 
    }; 

    if (isOpen) { 
      document.addEventListener("keydown", handleKeyDown); 
      document.body.style.overflow = "hidden"; 
    } else { 
      document.body.style.overflow = "auto"; 
    } 

    return () => { 
      document.removeEventListener("keydown", handleKeyDown); 
      document.body.style.overflow = "auto"; 
    }; 
  }, [isOpen]); 

  const handleBackdropClick = (e) => { 
    if (e.target === e.currentTarget) onClose(); 
  }; 

  const handlePrevious = () => { 
    if (!showNavigation) return; 
    const newIndex = 
      currentIndex > 0 ? currentIndex - 1 : images.length - 1; 
    onNavigate(newIndex); 
  }; 

  const handleNext = () => { 
    if (!showNavigation) return; 
    const newIndex = 
      currentIndex < images.length - 1 ? currentIndex + 1 : 0; 
    onNavigate(newIndex); 
  }; 

  return ( 
    <div 
      onClick={handleBackdropClick} 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md transition-opacity duration-300 ${ 
        isOpen ? "opacity-100 visible" : "opacity-0 invisible" 
      }`} 
    > 
      {/* Close button */} 
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 z-10 group p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-white/40 hover:scale-110 transition-all duration-300 ease-out shadow-lg hover:shadow-xl" 
        aria-label="Close modal" 
      > 
        <X size={24} className="transition-transform duration-200 group-hover:rotate-90" /> 
      </button> 

      {/* Navigation Arrows */} 
      {showNavigation && ( 
        <> 
          <button 
            onClick={handlePrevious} 
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 group p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-white/40 hover:scale-110 transition-all duration-300 ease-out shadow-lg hover:shadow-xl" 
            aria-label="Previous image" 
          > 
            <ChevronLeft 
              size={28} 
              className="transition-transform duration-200 group-hover:-translate-x-0.5" 
            /> 
          </button> 

          <button 
            onClick={handleNext} 
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 group p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-white/40 hover:scale-110 transition-all duration-300 ease-out shadow-lg hover:shadow-xl" 
            aria-label="Next image" 
          > 
            <ChevronRight 
              size={28} 
              className="transition-transform duration-200 group-hover:translate-x-0.5" 
            /> 
          </button> 
        </> 
      )} 

      {/* Image Counter */} 
      {showNavigation && ( 
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium shadow-lg"> 
          {currentIndex + 1} / {images.length} 
        </div> 
      )} 

      {/* Image Container with Scale/Fade Animation */} 
      <div 
        className={`relative max-w-[90vw] max-h-[90vh] transition-all duration-500 ease-out ${ 
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0" 
        }`} 
      > 
        <div className="relative w-[90vw] h-[90vh] flex items-center justify-center"> 
          <Image 
            src={imageSrc || "/placeholder.svg"} 
            alt={imageAlt || "Product image"} 
            fill 
            className="object-contain rounded-lg transition-opacity duration-300" 
            sizes="90vw" 
            priority 
          /> 
        </div> 
      </div> 
    </div> 
  ); 
}