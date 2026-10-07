/**
 * Sanitize HTML content from legacy Joomla/VirtueMart
 * Removes inline styles and potentially dangerous attributes while preserving structure
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  let sanitized = html;

  // Remove inline styles (style="...")
  sanitized = sanitized.replace(/style="[^"]*"/gi, '');
  
  // Remove on* event handlers (onclick, onmouseover, etc.)
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*"[^"]*"/gi, '');
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*'[^']*'/gi, '');

  return sanitized;
}

/**
 * Parse HTML content and return sanitized string for dangerouslySetInnerHTML
 */
export function parseHtmlContent(html: string): { __html: string } {
  return { __html: sanitizeHtml(html) };
}
