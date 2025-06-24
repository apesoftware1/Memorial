"use client"

import Image from "next/image"
import '../app/globals.css'

const CategoryTabs = ({
  selectedCategory,
  setSelectedCategory,
}) => {
  const categories = [
    { name: "FULL", icon: "/final-icons/tombstones.svg" },
    { name: "PREMIUM", icon: "/final-icons/premium.svg" },
    { name: "FAMILY", icon: "/final-icons/family.svg" },
    { name: "CHILD", icon: "/final-icons/child.svg" },
    { name: "HEAD", icon: "/final-icons/head.svg" },
    { name: "CREMATION", icon: "/final-icons/cremation.svg" },
  ];

  // Default to 'FULL' if selectedCategory is not set
  const activeCategory = selectedCategory || 'FULL';

  return (
    <div className="w-full md:max-w-lg overflow-hidden py-0">
      <div className="flex overflow-x-auto hide-scrollbar h-[56px]">
        {categories.map((item, index) => (
          <div
            key={index}
            className={`flex-1 min-w-[80px] text-center cursor-pointer transition-colors whitespace-nowrap overflow-hidden text-ellipsis h-full flex flex-col justify-center items-center ${index < categories.length - 1 && activeCategory !== item.name ? 'border-r border-black' : ''} ${activeCategory === item.name ? "bg-[#005D77] font-bold" : "bg-[#2E2E30] hover:text-[#E6E7E8]"}`}
            onClick={() => setSelectedCategory(item.name)}
            style={{
              height: '100%',
              ...(activeCategory !== item.name ? {
                boxShadow: 'inset 20px 0 32px -8px rgba(0, 0, 0, 0.25), inset 0 -16px 32px -4px rgba(20, 10, 10, 0.18)'
              } : {})
            }}
          >
            <div className="flex flex-col items-center justify-center h-full w-full">
              <Image
                src={item.icon}
                alt={`${item.name} icon`}
                width={32}
                height={32}
                className="object-contain mb-[0px] mx-auto"
              />
              <span
                className="text-[0.7rem] leading-tight w-full"
                style={{ color: '#D1D3D4' }}
              >
                {item.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs; 