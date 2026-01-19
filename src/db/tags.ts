import { v4 as uuidv4 } from "uuid";

import { db, type ArticleTag, type Tag } from "./index";

const nowIso = () => new Date().toISOString();

const normalizeTagNames = (tags: string[]): string[] => {
  const normalized = tags
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

  return Array.from(new Set(normalized));
};

export const getOrCreateTag = async (name: string): Promise<Tag> => {
  const existing = await db.tags.where("name").equals(name).first();
  if (existing) {
    return existing;
  }

  const tag: Tag = {
    id: uuidv4(),
    name,
    created_at: nowIso(),
  };

  await db.tags.add(tag);
  return tag;
};

export const addTagsToArticle = async (
  articleId: string,
  tags: string[],
): Promise<ArticleTag[]> => {
  const normalized = normalizeTagNames(tags);
  if (normalized.length === 0) {
    return [];
  }

  return db.transaction("rw", db.tags, db.article_tags, async () => {
    const existingTags = await db.tags
      .where("name")
      .anyOf(normalized)
      .toArray();
    const existingMap = new Map(
      existingTags.map((tag) => [tag.name, tag]),
    );

    const tagsToCreate = normalized.filter((name) => !existingMap.has(name));
    const createdTags: Tag[] = tagsToCreate.map((name) => ({
      id: uuidv4(),
      name,
      created_at: nowIso(),
    }));

    if (createdTags.length > 0) {
      await db.tags.bulkAdd(createdTags);
      createdTags.forEach((tag) => {
        existingMap.set(tag.name, tag);
      });
    }

    const articleTags: ArticleTag[] = normalized.map((name) => ({
      id: uuidv4(),
      article_id: articleId,
      tag_id: existingMap.get(name)!.id,
    }));

    await db.article_tags.bulkAdd(articleTags);
    return articleTags;
  });
};
