import { Readability } from "@mozilla/readability";
import DOMPurify from "dompurify";

import type { ParseStatus } from "../db";

export type ParsedArticleContent = {
  content_html: string;
  content_text: string;
  parse_status: ParseStatus;
};

const sanitizeHtml = (html: string): string =>
  DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });

const buildFallbackContent = (document: Document, rawHtml: string) => {
  const contentText = document.body?.textContent?.trim() ?? "";

  return {
    content_html: sanitizeHtml(rawHtml),
    content_text: contentText,
    parse_status: "partial" as const,
  };
};

export const parseArticleHtml = (html: string): ParsedArticleContent => {
  const parser = new DOMParser();
  const document = parser.parseFromString(html, "text/html");

  try {
    const readability = new Readability(document);
    const parsed = readability.parse();
    const contentHtml = parsed?.content?.trim() ?? "";

    if (contentHtml.length > 0) {
      return {
        content_html: sanitizeHtml(contentHtml),
        content_text: parsed?.textContent?.trim() ?? "",
        parse_status: "success",
      };
    }
  } catch (error) {
    return buildFallbackContent(document, html);
  }

  return buildFallbackContent(document, html);
};
