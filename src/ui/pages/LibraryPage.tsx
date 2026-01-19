import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { listArticles } from "../../db/articles";
import type { Article } from "../../db";

const getHostname = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const formatSavedDate = (savedAt: string) => {
  const date = new Date(savedAt);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

function LibraryPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  useEffect(() => {
    let isMounted = true;
    const loadArticles = async () => {
      setStatus("loading");
      try {
        const items = await listArticles();
        if (isMounted) {
          setArticles(items);
          setStatus("idle");
        }
      } catch {
        if (isMounted) {
          setStatus("error");
        }
      }
    };

    loadArticles();
    return () => {
      isMounted = false;
    };
  }, []);

  const emptyMessage = useMemo(() => {
    if (status === "loading") {
      return "Loading your saved articles...";
    }
    if (status === "error") {
      return "Unable to load your library right now.";
    }
    return "Import your Pocket archive to start reading offline.";
  }, [status]);

  const statusMessage = useMemo(() => {
    if (status === "loading" || status === "error") {
      return emptyMessage;
    }
    return `${articles.length} article${articles.length === 1 ? "" : "s"} saved`;
  }, [articles.length, emptyMessage, status]);

  return (
    <section className="page">
      <h2 className="page__title">Library</h2>
      <p className="page__status">{statusMessage}</p>
      {articles.length > 0 ? (
        <ul className="library-list">
          {articles.map((article) => (
            <li key={article.id} className="library-item">
              <Link className="library-item__link" to={`/reader/${article.id}`}>
                <div className="library-item__header">
                  <span
                    className={`library-item__status ${
                      article.is_read ? "is-read" : "is-unread"
                    }`}
                  >
                    {article.is_read ? "Read" : "Unread"}
                  </span>
                  <h3 className="library-item__title">
                    {article.title || "Untitled article"}
                  </h3>
                </div>
                <div className="library-item__meta">
                  <span>{getHostname(article.url)}</span>
                  <span>Saved {formatSavedDate(article.saved_at)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      {articles.length === 0 && status === "idle" ? (
        <p className="page__status">{emptyMessage}</p>
      ) : null}
    </section>
  );
}

export default LibraryPage;
