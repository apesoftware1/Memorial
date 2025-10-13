export function hasAtLeastSevenDecimalPlaces(latitude, longitude) {
  const checkDecimals = (num) => {
    if (typeof num !== 'number' || isNaN(num)) return false;

    const str = num.toString();

    // Check if there's a decimal part
    if (!str.includes('.')) return false;

    const decimalPart = str.split('.')[1];
    return decimalPart.length >= 7; // ✅ Must have at least 7 decimal places
  };

  return checkDecimals(latitude) && checkDecimals(longitude);
}