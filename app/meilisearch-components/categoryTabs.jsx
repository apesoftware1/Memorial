// "use client"

// import Link from 'next/link'
// import Image from 'next/image'
// import { desiredOrder } from "@/lib/categories"

// export default function CategoryTabs({ categories, activeTab, setActiveTab }) {
//   const sortedCategories = desiredOrder
//     .map(name => categories.find(cat => cat.name && cat.name.toUpperCase() === name))
//     .filter(Boolean);

//   return (
//     <div className="w-full md:max-w-lg overflow-hidden py-0">
//       <div className="flex overflow-x-auto hide-scrollbar h-[56px]">
//         {sortedCategories.map((item, index) => (
//           <div
//             key={index}
//             className={`flex-1 min-w-[80px] text-center cursor-pointer transition-colors whitespace-nowrap overflow-hidden text-ellipsis h-full flex flex-col justify-center items-center ${index < sortedCategories.length - 1 && activeTab !== index ? 'border-r border-black' : ''} ${activeTab === index ? "bg-[#005D77] font-bold" : "bg-[#2E2E30] hover:text-[#E6E7E8]"}`}
//             onClick={() => setActiveTab(index)}
//             style={{
//               height: '100%',
//               ...(activeTab !== index ? {
//                 boxShadow: 'inset 20px 0 32px -8px rgba(0, 0, 0, 0.25), inset 0 -16px 32px -4px rgba(20, 10, 10, 0.18)'
//               } : {})
//             }}
//           >
//             <div className="flex flex-col items-center justify-center h-full w-full">
//               <div className="flex flex-col items-center justify-center h-[32px] w-full">
//                 <Image
//                   src={item.name === 'SINGLE' ? '/final-icons/single.svg' : item.icon}
//                   alt={`${item.name} icon`}
//                   width={item.name === 'SINGLE' ? 44 : 32}
//                   height={24}
//                   className={`object-contain ${item.name === 'SINGLE' ? 'mb-0' : 'mb-[-6px]'} mx-auto`}
//                 />
//               </div>
//               <span
//                 className="text-[0.7rem] leading-tight w-full text-center"
//                 style={{ color: '#D1D3D4' }}
//               >
//                 {item.name}
//               </span>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }