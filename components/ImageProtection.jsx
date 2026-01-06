"use client";

import { useEffect } from "react";

export default function ImageProtection() {
  useEffect(() => {
    // Prevent right-click context menu on images
    const handleContextMenu = (e) => {
      // Check if target or any parent is an image or has background image
      let target = e.target;
      // Traverse up up to 3 levels to find an image, in case of overlays
      let depth = 0;
      while (target && target !== document.body && depth < 3) {
        // Check for IMG tag
        if (target.tagName === 'IMG') {
          e.preventDefault();
          return false;
        }
        
        // Check for background image
        const style = window.getComputedStyle(target);
        if (style && style.backgroundImage && style.backgroundImage !== 'none') {
           e.preventDefault();
           return false;
        }

        target = target.parentElement;
        depth++;
      }
    };

    // Prevent drag and drop of images
    const handleDragStart = (e) => {
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
        return false;
      }
    };
    
    // Use capture=true to intercept events before they bubble
    document.addEventListener("contextmenu", handleContextMenu, { capture: true });
    document.addEventListener("dragstart", handleDragStart, { capture: true });

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu, { capture: true });
      document.removeEventListener("dragstart", handleDragStart, { capture: true });
    };
  }, []);

  return null;
}

