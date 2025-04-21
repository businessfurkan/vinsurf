/**
 * Safely access properties of potentially undefined objects
 * This utility helps prevent "Cannot read properties of undefined" errors
 */

/**
 * Safely get a property from an object with a fallback value
 * @param {Object} obj - The object to access
 * @param {String} path - The property path (e.g., 'user.profile.name')
 * @param {*} defaultValue - Default value if property doesn't exist
 * @returns {*} The property value or default value
 */
export const safeGet = (obj, path, defaultValue = undefined) => {
  if (!obj || !path) return defaultValue;
  
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === null || result === undefined || typeof result !== 'object') {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result === undefined ? defaultValue : result;
};

/**
 * Safely get a color property from yksData with proper formatting
 * @param {Object} yksData - The yksData object
 * @param {String} subject - The subject key
 * @param {String} property - The property to access (e.g., 'color')
 * @param {String} suffix - Optional suffix to add (e.g., '15' for opacity)
 * @param {String} defaultColor - Default color if not found
 * @returns {String} The formatted color string
 */
export const safeColor = (yksData, subject, property = 'color', suffix = '', defaultColor = '#4285F4') => {
  if (!yksData || !subject) return defaultColor + suffix;
  
  const subjectData = yksData[subject];
  if (!subjectData) return defaultColor + suffix;
  
  const color = subjectData[property];
  return color ? color + suffix : defaultColor + suffix;
};

/**
 * Safely access array length
 * @param {Array} arr - The array to check
 * @returns {Number} The array length or 0
 */
export const safeLength = (arr) => {
  return Array.isArray(arr) ? arr.length : 0;
};

/**
 * Safely map over an array with proper checks
 * @param {Array} arr - The array to map
 * @param {Function} callback - The mapping function
 * @returns {Array} The mapped array or empty array
 */
export const safeMap = (arr, callback) => {
  if (!Array.isArray(arr)) return [];
  return arr.map(callback);
};

export default {
  safeGet,
  safeColor,
  safeLength,
  safeMap
};
