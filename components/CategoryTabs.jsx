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
    <div className="w-full md:max-w-lg overflow-hidden py-0">
      <div className="flex overflow-x-auto hide-scrollbar h-[56px]">
        {categories.map((item, index) => (
          <div
            key={index}
            className={`flex-1 min-w-[80px] text-center cursor-pointer transition-colors whitespace-nowrap overflow-hidden text-ellipsis h-full flex flex-col justify-center items-center ${index < categories.length - 1 ? 'border-r border-black' : ''} ${selectedCategory === item.name ? "bg-[#005D77] text-[#D4AF37] font-bold border-b-0 border-[#005D77]" : "bg-[#2E2E30] text-[#D4AF37] hover:text-[#E6E7E8]"}`}
            onClick={() => setSelectedCategory(item.name)}
            style={{ height: '100%' }}
          >
            <div className="flex flex-col items-center justify-center h-full w-full">
              <Image
                src={item.icon}
                alt={`${item.name} icon`}
                width={item.name === 'FAMILY' ? 32 : 24}
                height={item.name === 'FAMILY' ? 32 : 24}
                className={item.name === 'FAMILY' ? "h-7 w-8" : "h-6 w-8 mb-1"}
              />
              <span className="text-[0.7rem] leading-tight w-full">{item.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs; 