import { useMemo } from "react";
import DOMPurify from "dompurify";

import type { ReaderPreferences } from "../db/settings";

type ReaderContentProps = {
  title?: string;
  url?: string;
  contentHtml?: string;
  preferences: ReaderPreferences;
};

function ReaderContent({
  title,
  url,
  contentHtml,
  preferences,
}: ReaderContentProps) {
  const sanitizedHtml = useMemo(
    () => DOMPurify.sanitize(contentHtml ?? "", { USE_PROFILES: { html: true } }),
    [contentHtml],
  );

  return (
    <article
      className={`reader${preferences.darkMode ? " reader--dark" : ""}`}
      style={{ maxWidth: `${preferences.lineWidth}ch` }}
    >
      <header className="reader__header">
        <h1>{title ?? "Untitled article"}</h1>
        {url ? (
          <a
            className="reader__url"
            href={url}
            target="_blank"
            rel="noreferrer"
          >
            {url}
          </a>
        ) : null}
      </header>
      <div className="reader__content">
        {contentHtml ? (
          <div
            className="reader__body"
            style={{ fontSize: `${preferences.fontSize}rem` }}
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />
        ) : (
          <p className="reader__empty">No content saved for this article yet.</p>
        )}
      </div>
    </article>
  );
}

export default ReaderContent;
