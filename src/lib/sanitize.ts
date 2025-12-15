import { QuestionValidation } from './types';

/**
 * Check if the input looks like gibberish/random characters
 * Returns true if the text appears to be nonsensical
 */
export function isGibberishInput(text: string): boolean {
  if (!text || text.trim().length < 3) return true;
  
  const trimmed = text.trim();
  
  // Check for mostly random characters (low vowel ratio)
  const vowels = trimmed.toLowerCase().match(/[aeiou]/g);
  const vowelRatio = vowels ? vowels.length / trimmed.length : 0;
  
  // Very short inputs with no vowels are likely gibberish
  if (trimmed.length < 10 && vowelRatio < 0.1) return true;
  
  // Longer text should have at least some vowels (allow for acronyms etc.)
  if (trimmed.length >= 10 && vowelRatio < 0.08) return true;
  
  // Check for excessive repeated patterns (like "asdfasdfasdf" or "aaaaaa")
  const hasRepeatedPattern = /(.{2,})\1{2,}/.test(trimmed.toLowerCase());
  if (hasRepeatedPattern) return true;
  
  // Check for keyboard mashing patterns (common sequences)
  const keyboardPatterns = /^[asdfghjkl]+$|^[qwertyuiop]+$|^[zxcvbnm]+$/i;
  if (keyboardPatterns.test(trimmed.replace(/\s/g, ''))) return true;
  
  // Check for single repeated character
  if (/^(.)\1+$/.test(trimmed.replace(/\s/g, ''))) return true;
  
  // Check if it's mostly consonant clusters (unusual in real words)
  const words = trimmed.split(/\s+/);
  const gibberishWords = words.filter(word => {
    if (word.length < 4) return false;
    // Count consonant clusters of 4+ in a row
    const hasLongConsonantCluster = /[bcdfghjklmnpqrstvwxyz]{4,}/i.test(word);
    return hasLongConsonantCluster;
  });
  
  // If more than half of longer words have unusual consonant clusters
  const longerWords = words.filter(w => w.length >= 4);
  if (longerWords.length > 0 && gibberishWords.length / longerWords.length > 0.5) return true;
  
  return false;
}

/**
 * Validate that text is meaningful (not gibberish)
 * Returns error message if invalid, null if valid
 */
export function validateMeaningfulInput(text: string): string | null {
  if (isGibberishInput(text)) {
    return 'Please provide a meaningful response. Your input appears to be random characters.';
  }
  return null;
}

/**
 * Sanitize text to prevent markdown/HTML injection
 * Escapes characters that could break markdown formatting or inject HTML
 */
export function sanitizeMarkdown(text: string): string {
  return text
    // Remove null bytes
    .replace(/\0/g, '')
    // Escape markdown formatting characters
    .replace(/([*_`#\[\]<>\\])/g, '\\$1')
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Normalize whitespace (collapse multiple spaces, trim)
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Sanitize project name specifically
 * More restrictive than general markdown sanitization
 */
export function sanitizeProjectName(name: string): string {
  return name
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove markdown/HTML special chars entirely (don't escape, just remove)
    .replace(/[*_`#\[\]<>\\|~^]/g, '')
    // Remove control characters
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Validate text against validation rules
 * Returns error message if invalid, null if valid
 */
export function validateAnswer(
  text: string,
  validation?: QuestionValidation
): string | null {
  if (!validation) return null;

  const trimmed = text.trim();

  if (validation.minLength && trimmed.length < validation.minLength) {
    return `Must be at least ${validation.minLength} characters`;
  }

  if (validation.maxLength && trimmed.length > validation.maxLength) {
    return `Must be ${validation.maxLength} characters or less`;
  }

  if (validation.pattern && !validation.pattern.test(trimmed)) {
    return validation.patternMessage || 'Invalid format';
  }

  return null;
}

/**
 * Apply sanitization if required by validation rules
 */
export function applySanitization(
  text: string,
  validation?: QuestionValidation,
  questionId?: number
): string {
  if (!validation?.sanitize) return text;

  // Use project name sanitization for Q1
  if (questionId === 1) {
    return sanitizeProjectName(text);
  }

  return sanitizeMarkdown(text);
}
