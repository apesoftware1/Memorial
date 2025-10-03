"use client"

import { useState, useEffect } from "react"
import { Plus, Minus } from "lucide-react"

const faqData = [
  {
    question: "HOW MUCH DOES A TOMBSTONE COST?",
    answer:
      "The cost of a tombstone in South Africa can range from R4,000 to R40,000 or more, depending on the size, material, and complexity of the design. Basic tombstones might fall within the R8,000 - R15,000 range, while premium or custom designs can cost significantly more. The final price will depend on various factors, with material and design being the most important factors that will impact the overall budget.",
  },
  {
    question: "HOW DO I FIND A TOMBSTONE MANUFACTURER?",
    answer:
      "You can find a tombstone manufacturer by using our search tool. Simply enter your location and preferences to see a list of manufacturers in your area.",
  },
  {
    question: "WHAT MATERIALS ARE USED TO MAKE A TOMBSTONE?",
    answer:
      "Common materials used for tombstones include granite, marble, sandstone, limestone, and bronze. Granite is the most popular due to its durability and resistance to weathering.",
  },
  {
    question: "WHAT DESIGN ELEMENTS DO I LOOK FOR?",
    answer:
      "Consider design elements such as shape, size, color, engravings, religious symbols, and personalized features that reflect the personality of your loved one.",
  },
  {
    question: "HOW LONG DOES A TOMBSTONE TAKE TO BE MADE?",
    answer:
      "The production time for a tombstone typically ranges from 4-12 weeks, depending on the complexity of the design, material availability, and customization requirements.",
  },
  {
    question: "CAN I ADD PERSONAL PHOTOS, ENGRAVINGS OR SPECIAL DESIGNS?",
    answer:
      "Yes, most manufacturers offer personalization options including photo engravings, custom text, special designs, and even QR codes linking to memorial websites.",
  },
  {
    question: "ARE THERE WAYS WHEREBY I CAN FINANCE A TOMBSTONE?",
    answer:
      "Many manufacturers offer payment plans, and there are also funeral policies and insurance options that can cover tombstone costs. Some manufacturers may offer layaway plans or installment options.",
  },
];

export default function ResponsiveFaqSection() {
  const [openIndex, setOpenIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Function to check if the screen width is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check on initial load
    checkMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);
    
    // Clean up event listener
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Render mobile or desktop version based on screen size
  return (
    <div className={`w-full bg-white ${isMobile ? 'overflow-x-hidden max-w-[100vw]' : '-mx-[100vw] px-[100vw]'}`}>
      {/* Empty div for spacing - reduced height */}
      <div className="h-2"></div>
      
      <section className="w-full min-h-0 flex items-start justify-center pt-2 pb-4 mb-0">
        <div className={`${isMobile ? 'w-full' : 'container mx-auto'} pb-0 mb-4 mt-2`}>
          {/* Heading */}
          <div className={`mb-6 mt-2 ${isMobile ? 'px-4' : ''}`}>
            <h2 className={`text-[#D4AF37] font-bold uppercase text-base ${isMobile ? 'whitespace-normal break-words' : 'whitespace-nowrap'}`} style={{letterSpacing: "0.5px"}}>
              Do you have any questions about buying a tombstone for your loved one?
            </h2>
          </div>
          {/* FAQ List */}
          <div className="relative w-full">
            {/* Top border */}
            <div className={isMobile ? 'h-px bg-[#e0e0e0] w-[calc(100%-32px)] mx-auto' : 'h-px bg-[#e0e0e0] md:w-[900px]'}></div>
            {faqData.map((faq, idx) => (
              <div key={idx} className="group relative w-full">
                <button
                  className={`${isMobile ? 'w-full' : 'md:w-[900px]'} flex items-center py-3 ${isMobile ? 'px-4' : 'md:px-0'} text-left focus:outline-none transition-colors relative ${openIndex === idx ? "bg-[#f9f9f9]" : ""}`}
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  aria-expanded={openIndex === idx}
                >
                  <span className={`font-bold text-[#0b4c5f] text-base uppercase tracking-tight ${isMobile ? 'break-words' : 'md:whitespace-nowrap'}`}>
                    {faq.question}
                  </span>
                  <span className="ml-auto flex-shrink-0 flex items-center">
                    {openIndex === idx ? (
                      <Minus className="w-5 h-5 text-[#0b4c5f]" />
                    ) : (
                      <Plus className="w-5 h-5 text-[#0b4c5f]" />
                    )}
                  </span>
                </button>
                {openIndex === idx && (
                  <div className={`py-2 ${isMobile ? 'px-4' : 'md:px-0'} ${isMobile ? 'w-full' : 'md:w-[900px]'}`}>
                    <div className={`bg-[#f9f9f9] rounded ${isMobile ? 'p-3' : 'p-4'} text-[#0b4c5f] text-base font-normal leading-relaxed w-full`}>
                      {faq.answer}
                    </div>
                  </div>
                )}
                {/* Divider under each question, except last */}
                {idx < faqData.length - 1 && (
                  <div className={isMobile ? 'h-px bg-[#e0e0e0] w-[calc(100%-32px)] mx-auto' : 'h-px bg-[#e0e0e0] md:w-[900px]'}></div>
                )}
              </div>
            ))}
            {/* Bottom border */}
            <div className={isMobile ? 'h-px bg-[#e0e0e0] w-[calc(100%-32px)] mx-auto' : 'h-px bg-[#e0e0e0] md:w-[900px]'}></div>
          </div>
        </div>
      </section>
    </div>
  );
}