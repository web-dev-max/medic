'use client';

import React, { useEffect, useRef } from 'react';
import { parseHtmlContent, HTML_STYLES } from '@/lib/htmlUtils';

interface StyledHtmlContentProps {
  html: string;
  className?: string;
}

/**
 * Component for rendering sanitized HTML content with applied styles
 * that match the React component design system
 */
export function StyledHtmlContent({ html, className }: StyledHtmlContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stylesInjectedRef = useRef(false);

  useEffect(() => {
    // Inject styles once
    if (!stylesInjectedRef.current) {
      const styleId = 'html-content-styles';
      if (!document.getElementById(styleId)) {
        const styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.textContent = HTML_STYLES;
        document.head.appendChild(styleElement);
      }
      stylesInjectedRef.current = true;
    }
  }, []);

  if (!html) return null;

  return (
    <div
      ref={containerRef}
      className={`html-content ${className || ''}`}
      dangerouslySetInnerHTML={parseHtmlContent(html)}
    />
  );
}
