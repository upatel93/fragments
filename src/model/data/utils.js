/* global Buffer */
const sharp = require('sharp');
const markdownIt = require('markdown-it')();
const contentType = require('content-type');

/**
 * Checks if a conversion is possible from the original type to the requested type.
 * @param {string} originalType - The original type of the fragment.
 * @param {string} requestedType - The requested type for the conversion.
 * @returns {boolean} Returns true if the conversion is possible, false otherwise.
 */
module.exports.isConversionPossible = (originalType, requestedType) => {
  // Dictionary mapping original types to valid conversion extensions
  const conversions = {
    'text/plain': ['txt'],
    'text/markdown': ['md', 'html', 'txt'],
    'text/html': ['html', 'txt'],
    'application/json': ['json', 'txt'],
    'image/png': ['png', 'jpg', 'jpeg', 'webp', 'gif'],
    'image/jpeg': ['png', 'jpg', 'jpeg', 'webp', 'gif'],
    'image/webp': ['png', 'jpg', 'jpeg', 'webp', 'gif'],
    'image/gif': ['png', 'jpg', 'jpeg', 'webp', 'gif'],
  };

  // Check if the original type and requested type are defined and not null
  if (originalType && requestedType) {
    // Check if the original type exists and if the requested type is valid for the original type
    if (
      Object.prototype.hasOwnProperty.call(conversions, originalType.toLowerCase()) &&
      conversions[originalType.toLowerCase()].includes(requestedType.toLowerCase())
    ) {
      return true; // Conversion is possible
    }
  }

  return false; // Conversion is not possible
};

/**
 * Separates an identifier string with an extension into its constituent parts,
 * namely the ID, extension, and media type.
 *
 * @param {string} idWithExtension - The identifier string with an extension that needs to be separated into ID, extension, and media type.
 * @returns {Object} An object with the ID, extension, and media type as properties.
 */
module.exports.separateIdExtensionAndMediaType = (idWithExtension) => {
  // Check if the input is null or undefined
  if (idWithExtension === null || idWithExtension === undefined) {
    return {
      id: String(idWithExtension),
      extension: '',
      mediaType: '',
    };
  }

  // Map extensions to media types
  var mediaTypeMap = {
    txt: 'text/plain',
    md: 'text/markdown',
    html: 'text/html',
    json: 'application/json',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    gif: 'image/gif',
  };

  // Find the last occurrence of a dot (.)
  var lastDotIndex = idWithExtension.lastIndexOf('.');
  if (lastDotIndex !== -1) {
    // Extract the ID and extension using substring
    var id = idWithExtension.substring(0, lastDotIndex);
    var extension = idWithExtension.substring(lastDotIndex + 1);

    // Determine the media type based on the extension
    var mediaType = mediaTypeMap[extension] || '';

    return {
      id: id,
      extension: extension,
      mediaType: mediaType,
    };
  } else {
    // If there is no dot, consider the entire input as the ID
    return {
      id: idWithExtension,
      extension: '',
      mediaType: '',
    };
  }
};

/**
 * Checks if an identifier string has an extension.
 *
 * @param {string} id - The identifier string to check for an extension.
 * @returns {boolean} A boolean value indicating whether the identifier has an extension.
 * @example
 * var id = "4dcc65b6-9d57-453a-bd3a-63c107a51698.html";
 * var hasExtension = hasExtension(id);
 * console.log("Has extension:", hasExtension);
 * // Output:
 * // Has extension: true
 */
module.exports.hasExtension = (id) => {
  if (id === null || id === undefined) {
    return false;
  }

  var lastDotIndex = id.lastIndexOf('.');
  return lastDotIndex !== -1 && lastDotIndex < id.length - 1;
};

/**
 * Set's the fragment's data in the database
 * @param {Buffer} data
 * @returns string
 */
module.exports.rawJSONtoTextPlain = (rawData) => {
  return rawData.toString('utf8');
};

/**
 * Converts a fragment from Markdown to HTML.
 * @param {Buffer|string} rawData - The raw binary data of the fragment.
 * @returns {string} - The converted HTML.
 */
function convertMarkdownToHTML(rawData) {
  const markdownData = rawData instanceof Buffer ? rawData.toString() : rawData;
  return markdownIt.render(markdownData);
}

/**
 * Converts a fragment from HTML or Markdown to plain text.
 * @param {Buffer|string} rawData - The raw binary data of the fragment.
 * @param {string} fromType - The type of the fragment to convert from.
 * @returns {string} - The converted plain text.
 */
function convertToPlainText(rawData, fromType) {
  let data = rawData instanceof Buffer ? rawData.toString() : rawData;
  if (fromType === 'text/html') {
    return data.replace(/<[^>]+>/g, '');
  } else if (fromType === 'text/markdown') {
    return markdownIt.render(data).replace(/<[^>]+>/g, '');
  }
}

/**
 * Converts a fragment from JSON to plain text.
 * @param {Buffer|string} rawData - The raw binary data of the fragment.
 * @returns {string} - The converted plain text.
 * @throws {Error} - Throws an error if the conversion fails.
 */
function convertJSONToText(rawData) {
  try {
    const jsonData = JSON.parse(rawData);
    return JSON.stringify(jsonData, null, 2);
  } catch (error) {
    throw new Error('Failed to convert JSON to plain text');
  }
}

/**
 * Converts a fragment from one image format to another.
 * @param {Buffer} rawData - The raw binary data of the fragment.
 * @param {string} toExt - The extension representing the desired conversion type.
 * @returns {Buffer} - The converted image buffer.
 */
async function convertImageFormat(rawData, toExt) {
  const image = sharp(rawData);
  image.toFormat(toExt);
  return await image.toBuffer();
}

/**
 * Converts a fragment from one type to another based on the provided extension.
 * @param {Buffer|string} rawBinaryData - The raw binary data of the fragment.
 * @param {string} fromType - The type of the fragment to convert from.
 * @param {string} toExt - The extension representing the desired conversion type.
 * @returns {Buffer|string|null} - The converted data, or null if the conversion fails.
 * @throws {Error} - Throws an error if the conversion is not supported or encounters an error.
 */
module.exports.convertFragment = async (rawBinaryData, fromType, toExt, toType) => {
  if (fromType === 'text/markdown' && toExt === 'html') {
    return convertMarkdownToHTML(rawBinaryData);
  } else if ((fromType === 'text/html' || fromType === 'text/markdown') && toExt === 'txt') {
    return convertToPlainText(rawBinaryData, fromType);
  } else if (fromType === 'application/json' && toExt === 'txt') {
    return convertJSONToText(rawBinaryData);
  } else if (
    fromType.startsWith('image/') &&
    ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(toExt)
  ) {
    return await convertImageFormat(rawBinaryData, toExt);
  } else if (fromType === toType) {
    return rawBinaryData;
  } else {
    throw new Error('Unsupported conversion');
  }
};

module.exports.validateContentType = async (reqBody, contentTypeHeader) => {
  const { type } = contentType.parse(contentTypeHeader);

  if (type === 'application/json') {
    JSON.parse(reqBody);
    return;
  } else if (type.includes('image')) {
    await sharp(reqBody).metadata();
    return;
  } else if (type === 'text/html' || type === 'text/plain' || type === 'text/markdown') {
    return;
  } else {
    throw new Error('Unsupported content type');
  }
};
