import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { archiveArticle, listArticles } from "../../db/articles";
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
  const [filter, setFilter] = useState<"all" | "unread" | "archived">("all");

  useEffect(() => {
    let isMounted = true;
    const loadArticles = async () => {
      setStatus("loading");
      try {
        const items = await listArticles({ includeArchived: true });
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

  const activeArticles = useMemo(
    () => articles.filter((article) => !article.is_archived),
    [articles],
  );

  const archivedArticles = useMemo(
    () => articles.filter((article) => article.is_archived),
    [articles],
  );

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
    if (filter === "archived") {
      return `${archivedArticles.length} archived article${
        archivedArticles.length === 1 ? "" : "s"
      }`;
    }
    return `${activeArticles.length} article${
      activeArticles.length === 1 ? "" : "s"
    } saved`;
  }, [
    activeArticles.length,
    archivedArticles.length,
    emptyMessage,
    filter,
    status,
  ]);

  const filteredArticles = useMemo(() => {
    if (filter === "archived") {
      return archivedArticles;
    }
    if (filter === "unread") {
      return activeArticles.filter((article) => !article.is_read);
    }
    return activeArticles;
  }, [activeArticles, archivedArticles, filter]);

  const filterLabel = useMemo(() => {
    switch (filter) {
      case "unread":
        return "Unread only";
      case "archived":
        return "Archived";
      default:
        return "All articles";
    }
  }, [filter]);

  const handleArchiveToggle = async (article: Article) => {
    const isArchived = article.is_archived === 1;
    const updated = await archiveArticle(article.id, !isArchived);
    setArticles((prev) =>
      prev.map((item) =>
        item.id === article.id
          ? {
              ...item,
              is_archived: updated?.is_archived ?? (isArchived ? 0 : 1),
              updated_at: updated?.updated_at ?? item.updated_at,
            }
          : item,
      ),
    );
  };

  return (
    <section className="page">
      <h2 className="page__title">Library</h2>
      <p className="page__status">{statusMessage}</p>
      {articles.length > 0 ? (
        <div className="library-filters" role="group" aria-label="Library filter">
          <button
            type="button"
            className={`library-filter__button${
              filter === "all" ? " is-active" : ""
            }`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            type="button"
            className={`library-filter__button${
              filter === "unread" ? " is-active" : ""
            }`}
            onClick={() => setFilter("unread")}
          >
            Unread
          </button>
          <button
            type="button"
            className={`library-filter__button${
              filter === "archived" ? " is-active" : ""
            }`}
            onClick={() => setFilter("archived")}
          >
            Archived
          </button>
          <span className="library-filter__label">{filterLabel}</span>
        </div>
      ) : null}
      {filteredArticles.length > 0 ? (
        <ul className="library-list">
          {filteredArticles.map((article) => (
            <li key={article.id} className="library-item">
              <div className="library-item__content">
                <Link className="library-item__link" to={`/reader/${article.id}`}>
                  <div className="library-item__header">
                    <span
                      className={`library-item__status ${
                        article.is_archived
                          ? "is-archived"
                          : article.is_read
                            ? "is-read"
                            : "is-unread"
                      }`}
                    >
                      {article.is_archived
                        ? "Archived"
                        : article.is_read
                          ? "Read"
                          : "Unread"}
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
                <div className="library-item__actions">
                  <button
                    type="button"
                    className="library-item__action"
                    onClick={() => handleArchiveToggle(article)}
                  >
                    {article.is_archived ? "Unarchive" : "Archive"}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      {articles.length === 0 && status === "idle" ? (
        <p className="page__status">{emptyMessage}</p>
      ) : null}
      {articles.length > 0 && filteredArticles.length === 0 && status === "idle"
        ? (
            <p className="page__status">
              {filter === "archived"
                ? "No archived articles yet."
                : filter === "unread"
                  ? "No unread articles yet. Switch back to All to view your library."
                  : "No active articles yet. Switch to Archived to view saved items."}
            </p>
          )
        : null}
    </section>
  );
}

export default LibraryPage;
