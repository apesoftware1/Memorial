// Category icon map for Category Selection (Advert Creator)
export const CATEGORY_ICON_MAP = {
  SINGLE: "/last_icons/MainCatergories_Icons_X6_AdvertCreator_Icons/MainCatergories_Icons_X6_AdvertCreator_Icons/Single.svg",
  DOUBLE: "/last_icons/MainCatergories_Icons_X6_AdvertCreator_Icons/MainCatergories_Icons_X6_AdvertCreator_Icons/MainCatergories_AdvertCreator_Icons_2_Double.svg",
  CHILD: "/last_icons/MainCatergories_Icons_X6_AdvertCreator_Icons/MainCatergories_Icons_X6_AdvertCreator_Icons/MainCatergories_AdvertCreator_Icons_3_Child.svg",
  HEAD: "/last_icons/MainCatergories_Icons_X6_AdvertCreator_Icons/MainCatergories_Icons_X6_AdvertCreator_Icons/MainCatergories_AdvertCreator_Icons_4_Head.svg",
  PLAQUES: "/last_icons/MainCatergories_Icons_X6_AdvertCreator_Icons/MainCatergories_Icons_X6_AdvertCreator_Icons/MainCatergories_AdvertCreator_Icons_5-Plaques.svg",
  CREMATION: "/last_icons/MainCatergories_Icons_X6_AdvertCreator_Icons/MainCatergories_Icons_X6_AdvertCreator_Icons/MainCatergories_AdvertCreator_Icons_6_Cremation.svg",
};

export const MANUFACTURING_LEAD_TIME_OPTIONS = [1, 2, 3, 7, 10, 14, 21];

export const formatManufacturingLeadTimeText = (days) => {
  if (days === 1) return "X1 WORKING DAY AFTER POP (Proof of Payment)";
  return `X${days} WORKING DAYS AFTER POP (Proof of Payment)`;
};

const BASE_ICON_PATH = "/last_icons";

export const ICON_PATHS = {
  color: {
    "Black": `${BASE_ICON_PATH}/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Black.svg`,
    "Blue": `${BASE_ICON_PATH}/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Blue.svg`,
    "Green": `${BASE_ICON_PATH}/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Green.svg`,
    "Grey-Dark": `${BASE_ICON_PATH}/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Grey-Dark.svg`,
    "Grey-Light": `${BASE_ICON_PATH}/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Grey-Light.svg`,
    "Maroon": `${BASE_ICON_PATH}/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Maroon.svg`,
    "Pearl": `${BASE_ICON_PATH}/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Pearl.svg`,
    "Red": `${BASE_ICON_PATH}/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Red.svg`,
    "White": `${BASE_ICON_PATH}/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_White.svg`,
    "Mixed": `${BASE_ICON_PATH}/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Mixed.svg`,
    "Gold": `${BASE_ICON_PATH}/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Gold.svg`,
    "Yellow": `${BASE_ICON_PATH}/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Yellow.svg`,
    "Pink": `${BASE_ICON_PATH}/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Pink.svg`,
  },
  style: {
    "Christian Cross": `${BASE_ICON_PATH}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_ChristianCross.svg`,
    "Heart": `${BASE_ICON_PATH}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Heart.svg`,
    "Bible": `${BASE_ICON_PATH}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Bible.svg`,
    "Pillars": `${BASE_ICON_PATH}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Pillars.svg`,
    "Traditional African": `${BASE_ICON_PATH}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_TraditionalAfrican.svg`,
    "Abstract": `${BASE_ICON_PATH}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Abstract.svg`,
    "Praying Hands": `${BASE_ICON_PATH}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_PrayingHands.svg`,
    "Scroll": `${BASE_ICON_PATH}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Scroll.svg`,
    "Angel": `${BASE_ICON_PATH}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Angel.svg`,
    "Mausoleum": `${BASE_ICON_PATH}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Mausolean.svg`,
    "Obelisk": `${BASE_ICON_PATH}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Obelisk.svg`,
    "Plain": `${BASE_ICON_PATH}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Plain.svg`,
    "Teddy Bear": `${BASE_ICON_PATH}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_TeddyBear.svg`,
    "Butterfly": `${BASE_ICON_PATH}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Butterfly.svg`,
    "Car": `${BASE_ICON_PATH}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Car.svg`,
    "Bike": `${BASE_ICON_PATH}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Bike.svg`,
    "Sports": `${BASE_ICON_PATH}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Sport.svg`,
    "Wave": `${BASE_ICON_PATH}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Wave.svg`,
    "Church": `${BASE_ICON_PATH}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Church.svg`,
    "House": `${BASE_ICON_PATH}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_House.svg`,
    "Square": `${BASE_ICON_PATH}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Square.svg`,
    "Organic": `${BASE_ICON_PATH}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Organic.svg`,
    "Arch": `${BASE_ICON_PATH}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Arch.svg`,
    "Cathedral": "/Icons&Lay-By2026/7%20MAy/Head%20Styles/Cathedral_Black_Icon.svg",
    "Disney": "/Icons&Lay-By2026/7%20MAy/Head%20Styles/Disney_Black_Icon.svg",
  },
  overallStyle: {
    Traditional: "/Icons&Lay-By2026/Style-DropDown-Icons/traditional.svg",
    Modern: "/Icons&Lay-By2026/Style-DropDown-Icons/modern.svg",
    Simple: "/Icons&Lay-By2026/Style-DropDown-Icons/simple.svg",
    Decorative: "/Icons&Lay-By2026/Style-DropDown-Icons/decorative.svg",
    Religious: "/Icons&Lay-By2026/Style-DropDown-Icons/religious.svg",
    Premium: "/Icons&Lay-By2026/Style-DropDown-Icons/premium.svg",
    "Traditional African Style": "/Icons&Lay-By2026/Style-DropDown-Icons/Traditional-african-style.svg",
  },
  stoneType: {
    "Biodegradable": `${BASE_ICON_PATH}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Stone.svg`,
    "Brass": `${BASE_ICON_PATH}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Brass.svg`,
    "Ceramic/Porcelain": `${BASE_ICON_PATH}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Ceramic_Porcelain.svg`,
    "Composite": `${BASE_ICON_PATH}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Composite.svg`,
    "Concrete": `${BASE_ICON_PATH}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Concrete.svg`,
    "Copper": `${BASE_ICON_PATH}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Brass.svg`,
    "Glass": `${BASE_ICON_PATH}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Glass.svg`,
    "Granite": `${BASE_ICON_PATH}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Granite.svg`,
    "Granite Stones": "/Icons&Lay-By2026/Material-DropDown-Icons/granite-stones.svg",
    "Limestone": `${BASE_ICON_PATH}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Limestone.svg`,
    "Marble": `${BASE_ICON_PATH}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Marble.svg`,
    "Perspex": `${BASE_ICON_PATH}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Glass.svg`,
    "Quartzite": `${BASE_ICON_PATH}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Stone.svg`,
    "Sandstone": `${BASE_ICON_PATH}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Sandstone.svg`,
    "Slate": `${BASE_ICON_PATH}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Slate.svg`,
    "Steel": `${BASE_ICON_PATH}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Steel.svg`,
    "Stone": `${BASE_ICON_PATH}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Stone.svg`,
    "Tile": `${BASE_ICON_PATH}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Stone.svg`,
    "Wood": `${BASE_ICON_PATH}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Wood.svg`,
    "Zimbabwe Black": "/Icons&Lay-By2026/7%20MAy/Stone%20Type/ZimBlack_Black_Icon.svg",
    "Zimbabwe Red": "/Icons&Lay-By2026/7%20MAy/Stone%20Type/ZimRed_Black_Icon.svg",
  },
  slabStyle: {
    "Curved Slab": "/Icons&Lay-By2026/7%20MAy/Slab%20Styles/Slab_Black_Curved.svg",
    "Frame with Infill": "/Icons&Lay-By2026/7%20MAy/Slab%20Styles/Slab_Black_FrameWithInfill.svg",
    "Full Slab": "/Icons&Lay-By2026/7%20MAy/Slab%20Styles/Slab_Black_FullSlab.svg",
    "Glass Slab": "/Icons&Lay-By2026/7%20MAy/Slab%20Styles/Slab_Black_Glass.svg",
    "Half Slab": "/Icons&Lay-By2026/7%20MAy/Slab%20Styles/Slab_Black_HalfSlab.svg",
    "Stepped Slab": "/Icons&Lay-By2026/7%20MAy/Slab%20Styles/Slab_Black_Stepped.svg",
    "Tiled Slab": "/Icons&Lay-By2026/7%20MAy/Slab%20Styles/Slab_Black_Tiled.svg",
    "Double": `${BASE_ICON_PATH}/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_Double.svg`,
  },
  customization: {
    "Bronze/Stainless Plaques": `${BASE_ICON_PATH}/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_Bronze_Stainless Plaque.svg`,
    "Ceramic Photo Plaques": `${BASE_ICON_PATH}/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_CeramicPhotoPlaque.svg`,
    "Flower Vases": `${BASE_ICON_PATH}/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_FlowerVase.svg`,
    "Gold Lettering": `${BASE_ICON_PATH}/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_GoldLettering.svg`,
    "Inlaid Glass": `${BASE_ICON_PATH}/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_InlaidGlass.svg`,
    "Photo Laser-Edging": `${BASE_ICON_PATH}/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_PhotoLaserEdginhg.svg`,
    "QR Code": `${BASE_ICON_PATH}/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_QR Code.svg`,
  },
  culture: {
    "Christian": `${BASE_ICON_PATH}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_ChristianCross.svg`,
    "Jewish": `${BASE_ICON_PATH}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Plain.svg`,
    "Islamic": `${BASE_ICON_PATH}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Plain.svg`,
    "Buddhist": `${BASE_ICON_PATH}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Plain.svg`,
    "Hindu": `${BASE_ICON_PATH}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Plain.svg`,
    "Secular": `${BASE_ICON_PATH}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Plain.svg`,
    "African": `${BASE_ICON_PATH}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_TraditionalAfrican.svg`,
    "Other": `${BASE_ICON_PATH}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Plain.svg`,
  }
};

export const STYLE_OPTIONS = [
  'Christian Cross','Heart','Bible','Pillars','Traditional African','Abstract',
  'Praying Hands','Scroll','Angel','Mausoleum','Obelisk','Cathedral','Disney','Plain','Teddy Bear','Butterfly','Car','Bike','Sports',
  'Wave','Church','House','Square','Organic','Arch',
];

export const OVERALL_STYLE_OPTIONS = [
  "Traditional",
  "Modern",
  "Simple",
  "Decorative",
  "Religious",
  "Premium",
  "Traditional African Style",
];

export const SLAB_STYLE_OPTIONS = [
  'Curved Slab','Frame with Infill','Full Slab','Glass Slab','Half Slab','Stepped Slab','Tiled Slab','Double',
];

export const COLOR_OPTIONS = [
  'Black','Blue','Green','Grey-Dark','Grey-Light','Maroon','Pearl','Red','White','Mixed',
  'Gold','Yellow','Pink',
];

export const STONE_TYPE_OPTIONS = [
  'Biodegradable','Brass','Ceramic/Porcelain','Composite','Concrete','Copper','Glass','Granite',
  'Granite Stones',
  'Zimbabwe Black','Zimbabwe Red',
  'Limestone','Marble','Perspex','Quartzite','Sandstone','Slate','Steel','Stone','Tile','Wood',
];

export const CUSTOMIZATION_OPTIONS = [
  'Bronze/Stainless Plaques','Ceramic Photo Plaques','Flower Vases','Gold Lettering','Inlaid Glass','Photo Laser-Edging','QR Code',
];

export const TRANSPORT_OPTIONS = [
  "FREE TRANSPORT AND INSTALLATION WITHIN 5KM OF FACTORY",
  "FREE TRANSPORT AND INSTALLATION WITHIN 20KM OF FACTORY",
  "FREE TRANSPORT AND INSTALLATION WITHIN 50KM OF FACTORY",
  "FREE TRANSPORT AND INSTALLATION WITHIN 100KM OF FACTORY",
  "FREE TRANSPORT AND INSTALLATION",
  "DISCOUNTED TRANSPORT AND INSTALLATION COST INCLUDED IN SALE",
  "FINAL TRANSPORT AND INSTALLATION COST TO BE CONFIRMED BY MANUFACTURER",
];

export const FOUNDATION_OPTIONS = [
  "NO FOUNDATION COSTS INCLUDED IN PRICE",
  "GRAVESITE CLEARING COST NOT INCLUDED IN PRICE",
  "GRAVESITE CLEARING COST INCLUDED IN PRICE",
  "CEMENT FOUNDATION COST NOT INCLUDED IN PRICE",
  "CEMENT FOUNDATION COST INCLUDED IN PRICE",
  "BRICK FOUNDATION COST NOT INCLUDED IN PRICE",
  "BRICK FOUNDATION COST INCLUDED IN PRICE",
  "X1 LAYER BRICK FOUNDATION COST INCLUDED IN PRICE",
  "X2 LAYER BRICK FOUNDATION COST INCLUDED IN PRICE",
  "X3 LAYER BRICK FOUNDATION COST INCLUDED IN PRICE",
];

export const WARRANTY_OPTIONS = [
  "1 YEAR MANUFACTURES GUARANTEE",
  "1 YEAR MANUFACTURES WARRANTY",
  "5   YEAR MANUFACTURES WARRANTY",
  "5   YEAR MANUFACTURES GUARANTEE",
  "10 YEAR MANUFACTURES WARRANTY",
  "10 YEAR MANUFACTURES GUARANTEE",
  "15 YEAR MANUFACTURES WARRANTY",
  "15 YEAR MANUFACTURES GUARANTEE",
  "20 YEAR MANUFACTURES WARRANTY",
  "20 YEAR MANUFACTURES GUARANTEE",
  "LIFETIME MANUFACTURERS WARRANTY",
  "LIFETIME MANUFACTURERS GUARANTEE",
];

export const INSTALLATION_GUARANTEE_OPTIONS = [
  "1 YEAR INSTALLATION GUARANTEE",
];
