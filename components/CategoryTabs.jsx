"use client"

import Image from "next/image"

const CategoryTabs = ({
  selectedCategory,
  setSelectedCategory,
}) => {
  const categories = [
    { name: "TOMBSTONES", icon: "/MainMenu_Icons_Tombstone.svg" },
    { name: "PREMIUM", icon: "/MainMenu_Icons_Premium.svg" },
    { name: "FAMILY", icon: "/MainMenu_Icons_family.svg" },
    { name: "CHILD", icon: "/MainMenu_Icons_Child.svg" },
    { name: "HEAD", icon: "/MainMenu_Icons_Head.svg" },
    { name: "CREMATION", icon: "/MainMenu_Icons_Cremation.svg" },
  ];

  return (
    <div className="w-full md:max-w-lg bg-[#1a2238] overflow-hidden">
      <div className="flex overflow-x-auto hide-scrollbar">
        {categories.map((item, index) => (
          <div
            key={index}
            className={`flex-1 min-w-[80px] text-center py-2 cursor-pointer transition-colors whitespace-nowrap overflow-hidden text-ellipsis ${index < categories.length - 1 ? 'border-r border-[#D4AF37]' : ''} ${selectedCategory === item.name ? "bg-[#333] text-[#D4AF37] font-bold" : "text-[#D4AF37]"}`}
            onClick={() => setSelectedCategory(item.name)}
          >
            <div
              className={`flex flex-col items-center justify-center h-full`}
            >
              <Image
                src={item.icon}
                alt={`${item.name} icon`}
                width={16}
                height={16}
                className="h-4 w-4 mb-1"
              />
              <span className="text-[0.65rem] leading-tight">{item.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs; 