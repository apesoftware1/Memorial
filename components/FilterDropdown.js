"use client"

import { ChevronDown, Check, Square } from "lucide-react"
import { useRef } from "react"
import Image from "next/image"

// Helper function to fix icon paths
const fixIconPath = (path) => {
  if (!path) return path;
  // Replace any instances of spaces or incorrect formatting in paths
  let fixedPath = path;
  
  // Remove port number if present (like :3000)
  fixedPath = fixedPath.replace(/:\d+\//, '/');
  
  // Ensure path starts with a slash
  if (!fixedPath.startsWith('/')) {
    fixedPath = '/' + fixedPath;
  }
  
  // Fix common path issues
  fixedPath = fixedPath
    .replace('/last icons/', '/last_icons/')
    .replace('/Adv_vpe_Icon_', '/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_')
    .replace('%20', '')
    .replace('/public/', '/')
    .replace('//', '/');
  
  // Fix nested directory structure issues
  if (fixedPath.includes('/AdvertCreator_StoneType_Icons/')) {
    fixedPath = fixedPath.replace('/AdvertCreator_StoneType_Icons/', '/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/');
  }
  
  if (fixedPath.includes('/AdvertCreator_Head_Style_Icons/')) {
    fixedPath = fixedPath.replace('/AdvertCreator_Head_Style_Icons/', '/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/');
  }
  
  if (fixedPath.includes('/AdvertCreator_SlabStyle_Icons/')) {
    fixedPath = fixedPath.replace('/AdvertCreator_SlabStyle_Icons/', '/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/');
  }
  
  if (fixedPath.includes('/AdvertCreator_Icons_Customisation_Icons/')) {
    fixedPath = fixedPath.replace('/AdvertCreator_Icons_Customisation_Icons/', '/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/');
  }
  
  if (fixedPath.includes('/AdvertCreator_Colour_Icons/')) {
    // Make sure color icons always point to the correct subdirectory
    if (!fixedPath.includes('/6_Colour_Icons/')) {
      fixedPath = fixedPath.replace('/AdvertCreator_Colour_Icons/', '/AdvertCreator_Colour_Icons/6_Colour_Icons/');
    }
  }
    
  return fixedPath;
}

const bodyTypeIcons = {
  "Full Tombstone": "/MainMenu_Icons_Tombstone.svg",
  "Headstone": "/MainMenu_Icons_Head.svg",
  "Double Headstone": "/MainMenu_Icons_Double.svg",
  "Cremation Memorial": "/MainMenu_Icons_Cremation.svg",
  "Family Monument": "/MainMenu_Icons_Family.svg",
  "Child Memorial": "/MainMenu_Icons_Child.svg",
  "Custom Design": "/MainMenu_Icons_Premium.svg"
}

// Icons: Head Style (pre-encoded paths for consistent rendering)
const headStyleIcons = {
  "Christian Cross": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_ChristianCross.svg",
  "Heart": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Heart.svg",
  "Bible": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Bible.svg",
  "Pillars": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Pillars.svg",
  "Traditional African": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_TraditionalAfrican.svg",
  "Abstract": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Abstract.svg",
  "Praying Hands": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_PrayingHands.svg",
  "Scroll": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Scroll.svg",
  "Angel": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Angel.svg",
  "Mausoleum": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Mausolean.svg",
  "Obelisk": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Obelisk.svg",
  "Plain": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Plain.svg",
  "Teddy Bear": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_TeddyBear.svg",
  "Butterfly": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Butterfly.svg",
  "Car": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Car.svg",
  "Bike": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Bike.svg",
  "Sports": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Sport.svg"
}

// Icons: Slab Style (pre-encoded paths for consistent rendering)
// For the slabStyleIcons object
const slabStyleIcons = {
  "Curved Slab": "/last_icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_CurvedSlab.svg",
  "Frame with Infill": "/last_icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_FramewithInfill.svg",
  "Full Slab": "/last_icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_FullSlab.svg",
  "Glass Slab": "/last_icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_GlassSlab.svg",
  "Half Slab": "/last_icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_HalfSlab.svg",
  "Stepped Slab": "/last_icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_Stepped.svg",
  "Tiled Slab": "/last_icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_Tiled.svg",
}

// Icons: Stone Type (pre-encoded paths for consistent rendering)
const stoneTypeIcons = {
  "Biodegradable": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Biodegradable.svg",
  "Brass": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Brass.svg",
  "Ceramic/Porcelain": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Ceramic_Porcelain.svg",
  "Composite": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Composite.svg",
  "Concrete": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Concrete.svg",
  "Copper": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Copper.svg",
  "Glass": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Glass.svg",
  "Granite": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Granite.svg",
  "Limestone": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Limestone.svg",
  "Marble": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Marble.svg",
  "Perspex": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Perspex.svg",
  "Quartzite": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Quartzite.svg",
  "Sandstone": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Sandstone.svg",
  "Slate": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Slate.svg",
  "Steel": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Steel.svg",
  "Stone": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Stone.svg",
  "Tile": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Tile.svg",
  "Wood": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Wood.svg",
}

// Icons: Colour
const colourIcons = {
  "Black": "/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Black.svg",
  "Blue": "/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Blue.svg",
  "Green": "/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Green.svg",
  "Grey-Dark": "/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Grey-Dark.svg",
  "Grey-Light": "/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Grey-Light.svg",
  "Maroon": "/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Maroon.svg",
  "Pearl": "/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Pearl.svg",
  "Red": "/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Red.svg",
  "White": "/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_White.svg",
  "Mixed": "/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Mixed.svg"
}

// Icons: Customisation (pre-encoded paths for consistent rendering)
const customIcons = {
  "Bronze_Stainless Plaques": "/last_icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_Bronze_Stainless_Plaque.svg",
  "Ceramic Photo Plaques": "/last_icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_CeramicPhotoPlaque.svg",
  "Flower Vases": "/last_icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_FlowerVase.svg",
  "Gold Lettering": "/last_icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_GoldLettering.svg",
  "Inlaid Glass": "/last_icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_InlaidGlass.svg",
  "Photo Laser-Edging": "/last_icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_PhotoLaserEdginhg.svg",
  "QR Code": "/last_icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_QRCode.svg",
}

export default function FilterDropdown({
  name,
  label,
  options,
  openDropdown,
  toggleDropdown,
  selectOption,
  filters,
  dropdownRefs
}) {
  const SORTED_MENUS = new Set(["style", "slabStyle", "stoneType", "colour", "custom"]);
  const displayOptions = SORTED_MENUS.has(name)
    ? [...options].sort((a, b) => {
        // Always keep "Any" at the top
        if (a === "Any") return -1;
        if (b === "Any") return 1;
        return a.localeCompare(b, undefined, { sensitivity: "base" });
      })
    : options;

  // Get icon src from pre-encoded paths
  const getIconSrc = (menuName, option) => {
    let iconPath = null;
    if (menuName === "bodyType" && bodyTypeIcons[option]) iconPath = bodyTypeIcons[option];
    if (menuName === "style" && headStyleIcons[option]) iconPath = headStyleIcons[option];
    if (menuName === "slabStyle" && slabStyleIcons[option]) iconPath = slabStyleIcons[option];
    if (menuName === "stoneType" && stoneTypeIcons[option]) iconPath = stoneTypeIcons[option];
    if (menuName === "custom" && customIcons[option]) iconPath = customIcons[option];
    if (menuName === "colour" && colourIcons[option]) iconPath = colourIcons[option];
    
    // Apply path fixing to ensure correct format
    const fixedPath = iconPath ? fixIconPath(iconPath) : null;
    
    // Debug log to verify path
    console.log("ICON SOURCE:", option, fixedPath);
    
    return fixedPath;
  };

  return (
    <div className="relative w-full" ref={(el) => (dropdownRefs.current[name] = el)}>
      <button
        onClick={() => toggleDropdown(name)}
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-white bg-[#0D7C99] hover:bg-[#0D7C99]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0D7C99] h-9 shadow"
        style={{ borderRadius: '2px' }}
        aria-expanded={openDropdown === name}
        aria-haspopup="true"
      >
        <span>{filters[name] || label}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${openDropdown === name ? "transform rotate-180" : ""}`}
        />
      </button>

      {openDropdown === name && (
        <div
          className="absolute left-0 top-full z-[300] mt-1 w-full bg-[#2E2E30] shadow-lg border border-gray-700"
          style={{ borderRadius: '2px' }}
        >
          <ul className="py-1 max-h-60 overflow-auto" role="menu" aria-orientation="vertical">
            {displayOptions.map((option, index) => {
              const iconSrc = getIconSrc(name, option);
              return (
                <li
                  key={index}
                  onClick={() => selectOption(name, option)}
                  className="px-3 py-2 text-sm text-gray-300 hover:bg-[#111111] hover:text-[#D4AF37] transition-colors flex justify-between items-center cursor-pointer"
                  role="menuitem"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 flex items-center justify-center">
                      {option === 'Any' ? (
                        <Square className="h-5 w-5 text-gray-300" aria-hidden="true" />
                      ) : (
                        <img
                          src={iconSrc || '/placeholder.svg'}
                          alt={`${option} icon`}
                          width={20}
                          height={20}
                          className="h-5 w-5 object-contain inline-block visible opacity-100"
                          style={{ 
                            display: 'block',
                            filter: name === 'colour' || name === 'slabStyle' ? 'none' : 'brightness(0) invert(0.9)'
                          }}
                          onError={(e) => {
                            console.log(`Failed to load icon: ${iconSrc}`);
                            
                            // Special handling for color icons
                            if (name === 'colour') {
                              const colorPath = `/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_${option}.svg`;
                              console.log(`Trying color fallback: ${colorPath}`);
                              
                              const testImg = new Image();
                              testImg.onload = () => {
                                e.currentTarget.src = colorPath;
                              };
                              testImg.onerror = () => {
                                e.currentTarget.src = '/placeholder.svg';
                              };
                              testImg.src = colorPath;
                            } else {
                              // Try direct path as fallback for other icon types
                              const directPath = `/last_icons/${name === 'style' ? 'AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons' : 
                                                 name === 'slabStyle' ? 'AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons' : 
                                                 name === 'stoneType' ? 'AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons' : 
                                                 name === 'custom' ? 'AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons' : 
                                                 ''}/AdvertCreator_${name === 'style' ? 'HeadStyle' : name === 'slabStyle' ? 'SlabStyle' : name === 'stoneType' ? 'StoneType' : 'Customisation'}_Icon_${option.replace(/\s+/g, '')}.svg`;
                              
                              // Try the direct path first
                              const testImg = new Image();
                              testImg.onload = () => {
                                e.currentTarget.src = directPath;
                              };
                              testImg.onerror = () => {
                                e.currentTarget.src = '/placeholder.svg';
                              };
                              testImg.src = directPath;
                            }
                          }}
                          key={`${name}-${option}-${Math.random()}`}
                        />
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                  {filters[name] === option && <Check className="h-4 w-4 text-green-500" />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}