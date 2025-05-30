"use client"

import { useState } from "react"
import { Info, X } from "lucide-react"

const faqData = [
  {
    question: "How much does a Tombstone cost?",
    answer:
      "The cost of a tombstone in South Africa can range from R4,000 to R40,000 or more, depending on the size, material, and complexity of the design. Basic tombstones might fall within the R8,000 - R15,000 range, while premium or custom designs can cost significantly more. The final price will depend on various factors, with material and design being the most important factors that will impact the overall budget.",
  },
  {
    question: "How do I find a Tombstone Manufacturer?",
    answer:
      "You can find a tombstone manufacturer by using our search tool. Simply enter your location and preferences to see a list of manufacturers in your area.",
  },
  {
    question: "What materials are used to make a Tombstone?",
    answer:
      "Common materials used for tombstones include granite, marble, sandstone, limestone, and bronze. Granite is the most popular due to its durability and resistance to weathering.",
  },
  {
    question: "What Design elements do I look for?",
    answer:
      "Consider design elements such as shape, size, color, engravings, religious symbols, and personalized features that reflect the personality of your loved one.",
  },
  {
    question: "How long does a Tombstone take to be made?",
    answer:
      "The production time for a tombstone typically ranges from 4-12 weeks, depending on the complexity of the design, material availability, and customization requirements.",
  },
  {
    question: "Can I add personal photos, engravings or special designs?",
    answer:
      "Yes, most manufacturers offer personalization options including photo engravings, custom text, special designs, and even QR codes linking to memorial websites.",
  },
  {
    question: "Are there ways whereby I can finance a Tombstone?",
    answer:
      "Many manufacturers offer payment plans, and there are also funeral policies and insurance options that can cover tombstone costs. Some manufacturers may offer layaway plans or installment options.",
  },
];

// FAQ tooltip component
const FaqTooltip = ({ faq, index, activeTooltip, setActiveTooltip }) => {
  return (
    <div className="relative">
      <button
        className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 text-sm flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 group w-full justify-between text-left"
        onClick={() => setActiveTooltip(activeTooltip === index ? null : index)}
        aria-expanded={activeTooltip === index}
        style={{
          clipPath: 'polygon(0% 0%, 97% 0%, 100% 50%, 97% 100%, 0% 100%)',
        }}
      >
        <span className="flex items-center">
          {index === 0 && <span className="mr-1">→</span>}
          {faq.question}
        </span>
        <Info className="h-3 w-3 opacity-70 flex-shrink-0" />
      </button>

      {activeTooltip === index && (
        <div className="absolute z-50 mt-2 w-72 bg-white rounded-md shadow-lg border border-gray-200 p-3 text-sm text-gray-700 animate-slide-in">
          <div className="flex justify-between items-start mb-1">
            <h4 className="font-bold text-gray-900">{faq.question}</h4>
            <button onClick={() => setActiveTooltip(null)} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p>{faq.answer}</p>
        </div>
      )}
    </div>
  );
};

export default function FaqSection() {
  const [activeTooltip, setActiveTooltip] = useState(null);

  return (
    <section className="bg-white py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-gray-50 rounded-lg p-4 sm:p-8 shadow-sm">
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4">
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                Finding a fitting Tribute for your Loved One can be a daunting, difficult and potentially very expensive. With so many variables to consider we will make this job easier!
              </p>
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                Simply use our Easy-to-Use search bar to find a Tombstone Supplier who fits all the criteria you need
              </p>
              <p className="text-gray-700 text-base sm:text-lg font-medium">
                Do you have questions like:
              </p>
            </div>

            {/* FAQ Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {faqData.map((faq, index) => (
                <FaqTooltip
                  key={index}
                  faq={faq}
                  index={index}
                  activeTooltip={activeTooltip}
                  setActiveTooltip={setActiveTooltip}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 