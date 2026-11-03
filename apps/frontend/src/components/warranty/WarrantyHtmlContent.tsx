'use client';

import React, { useEffect, useState } from 'react';
import { InfoSection, InfoCard, InfoList, InfoListItem, InfoNumberedList, HighlightBox } from '@/components/ui/InfoPage';
import { Shield, FileText, AlertTriangle } from 'lucide-react';
import { Loading } from '@/components/ui/Loading';

interface ParsedSection {
  title: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

/**
 * Parse HTML content from admin and render as React components
 * This ensures exact visual match with static fallback
 */
export function WarrantyHtmlContent({ html }: { html: string }) {
  const [sections, setSections] = useState<ParsedSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (html && html.trim()) {
      const parsed = parseHtmlToSections(html);
      setSections(parsed);
    }
    setIsLoading(false);
  }, [html]);

  if (isLoading) {
    return <Loading text="Загрузка контента..." />;
  }

  if (!html || !html.trim()) return null;

  return (
    <div className="space-y-8">
      {sections.map((section, index) => {
        // Determine icon based on section title
        let icon = section.icon;
        if (!icon) {
          const titleLower = section.title.toLowerCase();
          if (titleLower.includes('гарантийн') || titleLower.includes('включает')) {
            icon = <Shield className="h-5 w-5 text-primary" />;
          } else if (titleLower.includes('срок') || titleLower.includes('порядок') || titleLower.includes('документ')) {
            icon = <FileText className="h-5 w-5 text-primary" />;
          } else if (titleLower.includes('не распростран')) {
            icon = <AlertTriangle className="h-5 w-5 text-warning" />;
          }
        }

        return (
          <React.Fragment key={index}>
            {section.title ? (
              <InfoSection title={section.title} icon={icon}>
                {section.content}
              </InfoSection>
            ) : (
              <>{section.content}</>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/**
 * Parse HTML string into structured sections
 */
function parseHtmlToSections(html: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const body = doc.body;

  let currentSection: ParsedSection = { title: '', content: null };
  let hasContent = false;

  const children = Array.from(body.childNodes);

  for (let i = 0; i < children.length; i++) {
    const node = children[i];

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();
      const className = element.className || '';
      const text = element.textContent?.trim() || '';

      // h2 starts a new section
      if (tagName === 'h2') {
        // Save previous section if it has content
        if (hasContent) {
          sections.push(currentSection);
        }

        // Start new section
        currentSection = { title: text, content: null };
        hasContent = false;
        continue;
      }

      // Skip h1
      if (tagName === 'h1') continue;

      // Parse content based on tag and class
      const parsed = parseNode(element, tagName, className);

      if (parsed) {
        if (!hasContent) {
          currentSection.content = parsed;
          hasContent = true;
        } else if (Array.isArray(currentSection.content)) {
          currentSection.content.push(parsed);
        } else {
          currentSection.content = [currentSection.content, parsed];
        }
      }
    }
  }

  // Save last section
  if (hasContent) {
    sections.push(currentSection);
  }

  return sections;
}

/**
 * Parse a single HTML node into React element
 */
function parseNode(element: Element, tagName: string, className: string): React.ReactNode {
  const text = element.textContent?.trim() || '';

  // Unordered list
  if (tagName === 'ul') {
    const items: React.ReactNode[] = [];
    element.querySelectorAll('li').forEach((li) => {
      items.push(
        <InfoListItem key={Math.random()}>{li.textContent}</InfoListItem>
      );
    });
    return <InfoList key={Math.random()}>{items}</InfoList>;
  }

  // Ordered list
  if (tagName === 'ol') {
    const items: React.ReactNode[] = [];
    element.querySelectorAll('li').forEach((li) => {
      items.push(
        <span key={Math.random()}>{li.textContent}</span>
      );
    });
    return <InfoNumberedList key={Math.random()}>{items}</InfoNumberedList>;
  }

  // Info card
  if (tagName === 'div' && className.includes('info-card')) {
    const titleEl = element.querySelector('h3');
    const title = titleEl?.textContent || '';
    
    // Get card content (all children except h3)
    const cardContent: React.ReactNode[] = [];
    element.childNodes.forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const childEl = child as Element;
        if (childEl.tagName.toLowerCase() !== 'h3') {
          const parsed = parseNode(childEl, childEl.tagName.toLowerCase(), childEl.className || '');
          if (parsed) cardContent.push(parsed);
        }
      }
    });

    return (
      <InfoCard key={Math.random()} title={title}>
        {cardContent}
      </InfoCard>
    );
  }

  // Grid container
  if (tagName === 'div' && className.includes('grid')) {
    const gridItems: React.ReactNode[] = [];
    element.querySelectorAll(':scope > div').forEach((div) => {
      const parsed = parseNode(div, 'div', div.className || '');
      if (parsed) gridItems.push(parsed);
    });
    
    return (
      <div key={Math.random()} className="grid gap-4 sm:grid-cols-2">
        {gridItems}
      </div>
    );
  }

  // Highlight box
  if (tagName === 'div' && className.includes('highlight-box')) {
    const content: React.ReactNode[] = [];
    element.childNodes.forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const childEl = child as Element;
        const parsed = parseNode(childEl, childEl.tagName.toLowerCase(), childEl.className || '');
        if (parsed) content.push(parsed);
      }
    });

    return (
      <HighlightBox key={Math.random()}>
        <p className="flex items-start gap-2">
          <span className="shrink-0 text-xl">📞</span>
          <span>{content}</span>
        </p>
      </HighlightBox>
    );
  }

  // Paragraph
  if (tagName === 'p') {
    return <p key={Math.random()} className="text-text-secondary">{text}</p>;
  }

  // Default: return text
  return text;
}
