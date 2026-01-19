import { useEffect, useState, type FormEvent } from "react";

import { createTag, deleteTag, listTags } from "../../db/tags";
import type { Tag } from "../../db";

function SettingsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const loadTags = async () => {
    const items = await listTags();
    setTags(items);
  };

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        const items = await listTags();
        if (isActive) {
          setTags(items);
        }
      } catch {
        if (isActive) {
          setError("Unable to load tags.");
          setStatus("error");
        }
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, []);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("saving");
    setError(null);

    try {
      const created = await createTag(newTagName);
      if (!created) {
        setError("Enter a tag name to add.");
        setStatus("idle");
        return;
      }
      await loadTags();
      setNewTagName("");
      setStatus("idle");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to create tag.",
      );
      setStatus("error");
    }
  };

  const handleDelete = async (tag: Tag) => {
    setStatus("saving");
    setError(null);

    try {
      await deleteTag(tag.id);
      await loadTags();
      setStatus("idle");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to delete tag.",
      );
      setStatus("error");
    }
  };

  return (
    <section className="page">
      <h2>Settings</h2>
      <section className="tag-settings">
        <div className="tag-settings__header">
          <h3>Manage tags</h3>
          <p>Create and remove tags stored on this device.</p>
        </div>
        <form className="tag-settings__form" onSubmit={handleCreate}>
          <label htmlFor="settings-new-tag">New tag</label>
          <div className="tag-settings__input">
            <input
              id="settings-new-tag"
              type="text"
              value={newTagName}
              onChange={(event) => setNewTagName(event.target.value)}
              placeholder="Add a tag name"
            />
            <button type="submit" disabled={status === "saving"}>
              Create
            </button>
          </div>
        </form>
        {error ? (
          <p className="tag-settings__error" role="alert">
            {error}
          </p>
        ) : null}
        {tags.length === 0 ? (
          <p className="tag-settings__empty">No tags yet.</p>
        ) : (
          <ul className="tag-settings__list">
            {tags.map((tag) => (
              <li key={tag.id} className="tag-settings__item">
                <span>{tag.name}</span>
                <button
                  type="button"
                  onClick={() => handleDelete(tag)}
                  disabled={status === "saving"}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}

export default SettingsPage;
