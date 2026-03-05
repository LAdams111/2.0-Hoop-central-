/**
 * Height/weight conversion for DB storage (cm, kg) and display (ft-in, lbs).
 * Use at ingest: convert scraped "6-7" and 285 lbs → height_cm, weight_kg.
 * Use on website: convert height_cm, weight_kg → "6-7" and lbs for display.
 */

/** 1 inch = 2.54 cm; 1 foot = 12 inches */
const INCHES_PER_FT = 12;
const CM_PER_INCH = 2.54;
/** 1 lb ≈ 0.453592 kg */
const KG_PER_LB = 0.453592;

/**
 * Convert feet-inches string to centimeters (for DB storage).
 * @param {string} ftIn - e.g. "6-7", "6-0", "5-11"
 * @returns {number|null} cm, or null if invalid
 */
function ftInToCm(ftIn) {
  if (ftIn == null || typeof ftIn !== "string") return null;
  const m = ftIn.trim().match(/^(\d+)-(\d{1,2})$/);
  if (!m) return null;
  const feet = parseInt(m[1], 10);
  const inches = parseInt(m[2], 10);
  if (inches >= 12) return null;
  const totalInches = feet * INCHES_PER_FT + inches;
  return Math.round(totalInches * CM_PER_INCH);
}

/**
 * Convert pounds to kilograms (for DB storage).
 * @param {number|string} lbs
 * @returns {number|null} kg, or null if invalid
 */
function lbsToKg(lbs) {
  if (lbs == null || lbs === "") return null;
  const n = typeof lbs === "string" ? parseInt(String(lbs).replace(/,/g, ""), 10) : lbs;
  if (Number.isNaN(n)) return null;
  return Math.round(n * KG_PER_LB);
}

/**
 * Convert centimeters to feet-inches string (for display on website).
 * @param {number} cm
 * @returns {string|null} e.g. "6-7", or null if invalid
 */
function cmToFtIn(cm) {
  if (cm == null || Number.isNaN(cm)) return null;
  const totalInches = cm / CM_PER_INCH;
  const feet = Math.floor(totalInches / INCHES_PER_FT);
  const inches = Math.round(totalInches % INCHES_PER_FT);
  if (inches === 12) return `${feet + 1}-0`;
  return `${feet}-${inches}`;
}

/**
 * Convert kilograms to pounds (for display on website).
 * @param {number} kg
 * @returns {number|null} lbs, or null if invalid
 */
function kgToLbs(kg) {
  if (kg == null || Number.isNaN(kg)) return null;
  return Math.round(kg / KG_PER_LB);
}

module.exports = {
  ftInToCm,
  lbsToKg,
  cmToFtIn,
  kgToLbs,
};
