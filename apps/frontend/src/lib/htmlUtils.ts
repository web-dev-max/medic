/**
 * Sanitize HTML content to prevent XSS attacks
 * Removes dangerous elements and attributes while preserving safe HTML structure
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';

  let sanitized = html;

  // Remove javascript: URLs from href and src attributes
  sanitized = sanitized.replace(/href\s*=\s*['"]?javascript:/gi, 'href="#"');
  sanitized = sanitized.replace(/src\s*=\s*['"]?javascript:/gi, 'src="#"');
  
  // Remove on* event handlers (onclick, onerror, onload, etc.)
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*"[^"]*"/gi, '');
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*'[^']*'/gi, '');
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove style attributes to prevent CSS-based attacks
  sanitized = sanitized.replace(/\s+style\s*=\s*"[^"]*"/gi, '');
  sanitized = sanitized.replace(/\s+style\s*=\s*'[^']*'/gi, '');

  return sanitized;
}

/**
 * Parse HTML content and return sanitized string for dangerouslySetInnerHTML
 */
export function parseHtmlContent(html: string): { __html: string } {
  return { __html: sanitizeHtml(html) };
}

/**
 * CSS styles that reproduce the exact design of React components (InfoSection, InfoCard, etc.)
 * These styles are injected once and applied to .html-content container
 */
export const HTML_STYLES = `
  /* ==========================================================================
     Container
     ========================================================================== */
  .html-content {
    @apply space-y-8;
  }

  /* ==========================================================================
     Headings
     ========================================================================== */
  .html-content h1 {
    @apply mb-4 text-3xl font-bold text-text-primary md:text-4xl lg:text-5xl;
  }
  
  .html-content h2 {
    @apply mb-4 text-xl font-bold text-text-primary md:text-2xl;
  }
  
  .html-content h3 {
    @apply mb-3 text-lg font-semibold text-text-primary;
  }
  
  .html-content h4,
  .html-content h5,
  .html-content h6 {
    @apply mb-2 font-semibold text-text-primary;
  }
  
  /* ==========================================================================
     Paragraphs
     ========================================================================== */
  .html-content p {
    @apply mb-4 text-text-secondary;
  }
  
  .html-content p:last-child {
    @apply mb-0;
  }
  
  /* ==========================================================================
     Links
     ========================================================================== */
  .html-content a {
    @apply text-primary hover:text-primary-dark underline;
  }
  
  /* ==========================================================================
     Bold and emphasis
     ========================================================================== */
  .html-content strong {
    @apply font-semibold text-text-primary;
  }
  
  .html-content em {
    @apply italic;
  }
  
  /* ==========================================================================
     Unordered lists (InfoList / InfoListItem)
     Reproduces: green dot markers with flex layout
     ========================================================================== */
  .html-content ul {
    @apply space-y-2 pl-5;
    list-style: none;
  }
  
  .html-content ul li {
    @apply flex items-start gap-2 text-text-secondary;
    position: relative;
  }
  
  /* Green dot marker */
  .html-content ul li::before {
    @apply mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary content-[''];
  }
  
  /* ==========================================================================
     Ordered lists (InfoNumberedList)
     Reproduces: numbered circles with primary background
     ========================================================================== */
  .html-content ol {
    @apply space-y-3 pl-0;
    list-style: none;
    counter-reset: item-counter;
  }
  
  .html-content ol li {
    @apply flex items-start gap-3 text-text-secondary;
    counter-increment: item-counter;
  }
  
  /* Numbered circle */
  .html-content ol li::before {
    @apply flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white content: '[' counter(item-counter) ']';
    margin-top: 0;
  }
  
  /* Hide default number, show custom circle */
  .html-content ol li::marker {
    @apply text-transparent;
    content: none;
  }
  
  /* ==========================================================================
     Info Section wrapper
     Reproduces: rounded-xl border bg-white p-6 shadow-sm md:p-8
     ========================================================================== */
  .html-content .info-section {
    @apply rounded-xl border border-border bg-white p-6 shadow-sm md:p-8;
  }
  
  .html-content .info-section h2 {
    @apply mb-0;
  }
  
  /* Icon placeholder for info section */
  .html-content .info-section::before {
    @apply mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary;
    content: '🛡';
    font-size: 1.25rem;
  }
  
  /* ==========================================================================
     Info Card
     Reproduces: rounded-xl border p-6 shadow-sm
     ========================================================================== */
  .html-content .info-card {
    @apply rounded-xl border border-border bg-white p-6 shadow-sm;
  }
  
  .html-content .info-card h3 {
    @apply mb-3 text-lg font-semibold text-text-primary;
  }
  
  /* ==========================================================================
     Highlight Box
     Reproduces: rounded-lg bg-primary-light/50 p-4
     ========================================================================== */
  .html-content .highlight-box {
    @apply rounded-lg bg-primary-light/50 p-4 text-sm text-text-primary md:text-base;
  }
  
  .html-content .highlight-box p {
    @apply mb-0;
  }
  
  /* ==========================================================================
     Warning Box
     Reproduces: rounded-lg bg-warning/10 border border-warning/30 p-4
     ========================================================================== */
  .html-content .warning-box {
    @apply rounded-lg border border-warning/30 bg-warning/10 p-4;
  }
  
  /* ==========================================================================
     Grid layouts
     Reproduces: responsive grid from React components
     ========================================================================== */
  .html-content .grid {
    display: grid;
    gap: 1rem;
  }
  
  .html-content .grid-2 {
    grid-template-columns: repeat(1, 1fr);
  }
  
  @media (min-width: 640px) {
    .html-content .grid-2 {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  .html-content .grid-3 {
    grid-template-columns: repeat(1, 1fr);
  }
  
  @media (min-width: 640px) {
    .html-content .grid-3 {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (min-width: 1024px) {
    .html-content .grid-3 {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  .html-content .grid-4 {
    grid-template-columns: repeat(1, 1fr);
  }
  
  @media (min-width: 640px) {
    .html-content .grid-4 {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (min-width: 1024px) {
    .html-content .grid-4 {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  
  /* ==========================================================================
     Tables
     ========================================================================== */
  .html-content table {
    @apply w-full rounded-xl border border-border overflow-hidden;
  }
  
  .html-content th {
    @apply bg-background-alt px-4 py-3 text-left text-sm font-semibold text-text-primary;
  }
  
  .html-content td {
    @apply px-4 py-3 text-sm text-text-secondary border-t border-border;
  }
  
  /* ==========================================================================
     Blockquotes
     ========================================================================== */
  .html-content blockquote {
    @apply border-l-4 border-primary pl-4 italic text-text-secondary;
  }
  
  /* ==========================================================================
     Horizontal rule
     ========================================================================== */
  .html-content hr {
    @apply my-8 border-border;
  }
  
  /* ==========================================================================
     Images
     ========================================================================== */
  .html-content img {
    @apply max-w-full h-auto rounded-xl;
  }
  
  /* ==========================================================================
     Code
     ========================================================================== */
  .html-content code {
    @apply rounded bg-background-alt px-2 py-1 text-sm;
  }
  
  .html-content pre {
    @apply rounded bg-background-alt p-4 overflow-x-auto;
  }
  
  .html-content pre code {
    @apply bg-none p-0;
  }
  
  /* ==========================================================================
     Spacing utilities (commonly used in admin HTML)
     ========================================================================== */
  .html-content .mb-2 { margin-bottom: 0.5rem; }
  .html-content .mb-4 { margin-bottom: 1rem; }
  .html-content .mb-6 { margin-bottom: 1.5rem; }
  .html-content .mb-8 { margin-bottom: 2rem; }
  .html-content .mt-4 { margin-top: 1rem; }
  .html-content .mt-6 { margin-top: 1.5rem; }
  .html-content .mt-8 { margin-top: 2rem; }
  .html-content .space-y-4 > * + * { margin-top: 1rem; }
  .html-content .space-y-8 > * + * { margin-top: 2rem; }
  .html-content .text-center { text-align: center; }
  .html-content .font-bold { font-weight: 700; }
  .html-content .font-semibold { font-weight: 600; }
  .html-content .text-2xl { font-size: 1.5rem; }
  .html-content .text-xl { font-size: 1.25rem; }
  .html-content .text-sm { font-size: 0.875rem; }
  .html-content .text-primary { color: var(--primary, #16a34a); }
  .html-content .text-text-secondary { color: var(--text-secondary, #6b7280); }
  .html-content .text-text-muted { color: var(--text-muted, #9ca3af); }
  .html-content .text-warning { color: var(--warning, #f59e0b); }
`;
