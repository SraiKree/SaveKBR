/**
 * Validation utilities for report data
 */

/**
 * Validates GPS coordinates
 * @param {number} lat - Latitude value
 * @param {number} lng - Longitude value
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateCoordinates(lat, lng) {
  const errors = [];

  // Check if values are numbers
  if (typeof lat !== 'number' || isNaN(lat)) {
    errors.push('Latitude must be a valid number');
  }
  if (typeof lng !== 'number' || isNaN(lng)) {
    errors.push('Longitude must be a valid number');
  }

  // Check latitude range (-90 to 90)
  if (typeof lat === 'number' && !isNaN(lat)) {
    if (lat < -90 || lat > 90) {
      errors.push('Latitude must be between -90 and 90');
    }
  }

  // Check longitude range (-180 to 180)
  if (typeof lng === 'number' && !isNaN(lng)) {
    if (lng < -180 || lng > 180) {
      errors.push('Longitude must be between -180 and 180');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates reporter name
 * @param {string} name - Reporter name
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateReporterName(name) {
  const errors = [];

  if (typeof name !== 'string') {
    errors.push('Reporter name must be a string');
  } else {
    if (name.trim().length === 0) {
      errors.push('Reporter name cannot be empty');
    }
    if (name.length > 100) {
      errors.push('Reporter name must not exceed 100 characters');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates report description
 * @param {string} description - Report description
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateDescription(description) {
  const errors = [];

  if (typeof description !== 'string') {
    errors.push('Description must be a string');
  } else {
    if (description.trim().length === 0) {
      errors.push('Description cannot be empty');
    }
    if (description.length > 500) {
      errors.push('Description must not exceed 500 characters');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates photo array
 * @param {File[]} photos - Array of photo files
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validatePhotos(photos) {
  const errors = [];

  if (!Array.isArray(photos)) {
    errors.push('Photos must be an array');
    return { valid: false, errors };
  }

  if (photos.length < 1) {
    errors.push('At least one photo is required');
  }

  if (photos.length > 3) {
    errors.push('Maximum 3 photos allowed');
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  photos.forEach((photo, index) => {
    if (!validTypes.includes(photo.type)) {
      errors.push(`Photo ${index + 1}: Invalid file type. Must be JPEG, PNG, or WebP`);
    }
    if (photo.size > maxSize) {
      errors.push(`Photo ${index + 1}: File size exceeds 5MB limit`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitizes text input to prevent XSS and injection attacks
 * @param {string} input - Text input to sanitize
 * @returns {string} Sanitized text
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  
  // Remove HTML tags and script content
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}
