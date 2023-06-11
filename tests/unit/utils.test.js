/* global Buffer */

const { isConversionPossible, hasExtension, separateIdExtensionAndMediaType, rawJSONtoTextPlain } = require('../../src/model/data/utils');

describe('isConversionPossible', () => {
  test('should return true for valid conversion', () => {
    const originalType = 'text/plain';
    const requestedType = 'txt';
    const conversionPossible = isConversionPossible(originalType, requestedType);
    expect(conversionPossible).toBe(true);
  });

  test('should return false for invalid conversion', () => {
    const originalType = 'text/plain';
    const requestedType = 'pdf';
    const conversionPossible = isConversionPossible(originalType, requestedType);
    expect(conversionPossible).toBe(false);
  });

  test('should be case-insensitive for original type', () => {
    const originalType = 'Text/Plain';
    const requestedType = 'txt';
    const conversionPossible = isConversionPossible(originalType, requestedType);
    expect(conversionPossible).toBe(true);
  });

  test('should be case-insensitive for requested type', () => {
    const originalType = 'text/plain';
    const requestedType = 'TXT';
    const conversionPossible = isConversionPossible(originalType, requestedType);
    expect(conversionPossible).toBe(true);
  });

  test('should handle unknown original type', () => {
    const originalType = 'application/xml';
    const requestedType = 'json';
    const conversionPossible = isConversionPossible(originalType, requestedType);
    expect(conversionPossible).toBe(false);
  });

  test('should handle null original type', () => {
    const originalType = null;
    const requestedType = 'txt';
    const conversionPossible = isConversionPossible(originalType, requestedType);
    expect(conversionPossible).toBe(false);
  });

  test('should handle undefined original type', () => {
    const originalType = undefined;
    const requestedType = 'txt';
    const conversionPossible = isConversionPossible(originalType, requestedType);
    expect(conversionPossible).toBe(false);
  });

  test('should handle null requested type', () => {
    const originalType = 'text/plain';
    const requestedType = null;
    const conversionPossible = isConversionPossible(originalType, requestedType);
    expect(conversionPossible).toBe(false);
  });

  test('should handle undefined requested type', () => {
    const originalType = 'text/plain';
    const requestedType = undefined;
    const conversionPossible = isConversionPossible(originalType, requestedType);
    expect(conversionPossible).toBe(false);
  });

  test('should handle valid conversion with multiple valid extensions', () => {
    const originalType = 'text/markdown';
    const requestedType = 'html';
    const conversionPossible = isConversionPossible(originalType, requestedType);
    expect(conversionPossible).toBe(true);
  });

  test('should handle invalid conversion with multiple valid extensions', () => {
    const originalType = 'text/markdown';
    const requestedType = 'pdf';
    const conversionPossible = isConversionPossible(originalType, requestedType);
    expect(conversionPossible).toBe(false);
  });

  test('should handle invalid conversion with long original type and requested type', () => {
    const originalType = 'application/json' + 'a'.repeat(255);
    const requestedType = 'pdf' + 'a'.repeat(255);
    const conversionPossible = isConversionPossible(originalType, requestedType);
    expect(conversionPossible).toBe(false);
  });
});



describe('separateIdExtensionAndMediaType', () => {
  it('should separate ID, extension, and media type when extension is present', () => {
    const supportedMediaTypes = {
      'txt': 'text/plain',
      'md': 'text/markdown',
      'html': 'text/html',
      'json': 'application/json',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'webp': 'image/webp',
      'gif': 'image/gif',
    };
  
    for (const extension in supportedMediaTypes) {
      const idWithExtension = `4dcc65b6-9d57-453a-bd3a-63c107a51698.${extension}`;
      const expectedMediaType = supportedMediaTypes[extension];
  
      const result = separateIdExtensionAndMediaType(idWithExtension);
  
      expect(result.id).toBe('4dcc65b6-9d57-453a-bd3a-63c107a51698');
      expect(result.extension).toBe(extension);
      expect(result.mediaType).toBe(expectedMediaType);
    }
  });
  

  it('should consider entire input as ID when no extension is present', () => {
    const idWithExtension = '4dcc65b6-9d57-453a-bd3a-63c107a51698';
    const result = separateIdExtensionAndMediaType(idWithExtension);

    expect(result.id).toBe('4dcc65b6-9d57-453a-bd3a-63c107a51698');
    expect(result.extension).toBe('');
    expect(result.mediaType).toBe('');
  });

  it('should handle null or undefined input', () => {
    let idWithExtension = null;
    let result = separateIdExtensionAndMediaType(idWithExtension);

    expect(result.id).toBe('null');
    expect(result.extension).toBe('');
    expect(result.mediaType).toBe('');

    idWithExtension = undefined;
    result = separateIdExtensionAndMediaType(idWithExtension);

    expect(result.id).toBe('undefined');
    expect(result.extension).toBe('');
    expect(result.mediaType).toBe('');
  });
});


describe('hasExtension', () => {
  test('should return false for empty string', () => {
    const id = '';
    const hasExtensionResult = hasExtension(id);
    expect(hasExtensionResult).toBe(false);
  });

  test('should return false when no extension is present', () => {
    const id = '4dcc65b6-9d57-453a-bd3a-63c107a51698';
    const hasExtensionResult = hasExtension(id);
    expect(hasExtensionResult).toBe(false);
  });

  test('should return true when extension is present', () => {
    const id = '4dcc65b6-9d57-453a-bd3a-63c107a51698.html';
    const hasExtensionResult = hasExtension(id);
    expect(hasExtensionResult).toBe(true);
  });

  test('should return false for null value', () => {
    const id = null;
    const hasExtensionResult = hasExtension(id);
    expect(hasExtensionResult).toBe(false);
  });

  test('should return false for undefined value', () => {
    const id = undefined;
    const hasExtensionResult = hasExtension(id);
    expect(hasExtensionResult).toBe(false);
  });

  test('should return false for long identifier without extension', () => {
    const id = 'a'.repeat(255);
    const hasExtensionResult = hasExtension(id);
    expect(hasExtensionResult).toBe(false);
  });

  test('should return true for long identifier with extension', () => {
    const id = 'a'.repeat(255) + '.html';
    const hasExtensionResult = hasExtension(id);
    expect(hasExtensionResult).toBe(true);
  });

  test('should return false for identical identifier without extension', () => {
    const id = 'abcde';
    const hasExtensionResult = hasExtension(id);
    expect(hasExtensionResult).toBe(false);
  });

  test('should return true for identical identifier with extension', () => {
    const id = 'abcde.html';
    const hasExtensionResult = hasExtension(id);
    expect(hasExtensionResult).toBe(true);
  });

  test('should return false for identifier with the value "null"', () => {
    const id = 'null';
    const hasExtensionResult = hasExtension(id);
    expect(hasExtensionResult).toBe(false);
  });

  test('should return false for identifier with the value "0"', () => {
    const id = '0';
    const hasExtensionResult = hasExtension(id);
    expect(hasExtensionResult).toBe(false);
  });

  test('should return true for identifier with special characters', () => {
    const id = '!@#$%^&*()-_=+.html';
    const hasExtensionResult = hasExtension(id);
    expect(hasExtensionResult).toBe(true);
  });
});

describe('rawJSONtoTextPlain', () => {
  test('should convert raw JSON buffer to text/plain', () => {
    const rawData = Buffer.from('{"name": "John Doe", "age": 30}', 'utf8');

    const result = rawJSONtoTextPlain(rawData);

    expect(result).toBe('{"name": "John Doe", "age": 30}');
  });

  test('should convert empty raw JSON buffer to an empty string', () => {
    const rawData = Buffer.from('', 'utf8');

    const result = rawJSONtoTextPlain(rawData);

    expect(result).toBe('');
  });

  test('should handle special characters and unicode in the raw JSON buffer', () => {
    const rawData = Buffer.from('{"message": "Hello, \\"World\\" \u2665"}', 'utf8');

    const result = rawJSONtoTextPlain(rawData);

    expect(result).toBe('{"message": "Hello, \\"World\\" \u2665"}');
  });
});
