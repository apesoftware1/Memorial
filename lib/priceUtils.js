/**
 * Utility functions for price formatting
 */

/**
 * Format price with spaces between thousands and hundreds
 * @param {number|string} price - The price to format
 * @returns {string} - Formatted price string (e.g., "R 8 500", "R 87 000")
 */
export const formatPrice = (price) => {
  if (!price) return 'R0';
  
  // Parse the price - handle both string and number formats
  let priceNum = 0;
  if (typeof price === 'number') {
    priceNum = price;
  } else if (typeof price === 'string') {
    priceNum = parseFloat(price.replace(/[^\d.]/g, '')) || 0;
  }
  
  // Format with South African locale and replace commas with spaces
  return `R${priceNum.toLocaleString('en-ZA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).replace(/,/g, ' ')}`;
};

/**
 * Parse price string to number for calculations
 * @param {string|number} priceStr - The price string to parse
 * @returns {number} - Parsed price as number
 */
export const parsePrice = (priceStr) => {
  if (!priceStr) return 0;
  
  // Handle different data types
  if (typeof priceStr === 'number') return priceStr;
  if (typeof priceStr === 'string') {
    return Number(priceStr.replace(/[^\d]/g, ''));
  }
  
  // If it's an object or other type, try to convert to string first
  try {
    const str = String(priceStr);
    return Number(str.replace(/[^\d]/g, ''));
  } catch (error) {
    console.warn('Failed to parse price:', priceStr, error);
    return 0;
  }
};