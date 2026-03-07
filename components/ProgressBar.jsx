import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * ProgressBar Component
 * Displays a modal overlay with a progress bar, spinner, and status text.
 * 
 * @param {boolean} isVisible - Whether the overlay is shown
 * @param {number} current - Current progress count
 * @param {number} total - Total items to process
 * @param {string} title - Title of the operation (default: "Processing...")
 * @param {string} description - Description text (default: "Please wait while we process your request.")
 */
const ProgressBar = ({ 
  isVisible, 
  current, 
  total, 
  title = "Processing...", 
  description = "Please wait while we process your request." 
}) => {
  if (!isVisible) return null;

  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 shadow-xl w-80 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#D4AF37] mx-auto mb-4" />
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-gray-500 mb-2">{description}</p>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
          <div 
            className="bg-[#D4AF37] h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <p className="text-sm font-medium text-gray-600">
          {current} / {total}
        </p>
      </div>
    </div>
  );
};

export default ProgressBar;
