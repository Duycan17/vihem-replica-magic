import type { Post, PostInsert, PostUpdate } from "./posts.js";
import { getSql } from "./db.js";

export type { PostInsert, PostUpdate };

const DEFAULT_PILLAR = "tin-tuc";

type DbPost = {
  id: string;
  slug: string;
  pillar: string;
  title: string;
  description: string;
  author: string;
  body: string;
  body_format: string;
  publish_date: string | null;
  last_modified: string | null;
  featured_image_src: string;
  featured_image_alt: string;
  tags: string[] | null;
  focus_keyword: string | null;
  noindex: boolean;
  toc: boolean;
  status: string;
  created_at: string;
  updated_at: string;
};

const formatDisplayDate = (value: string | null): string | null => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const parseDisplayDate = (value: string | null | undefined): string | null => {
  if (!value?.trim()) return null;
  const match = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  return new Date(Number(year), Number(month) - 1, Number(day)).toISOString();
};

export const toPost = (row: DbPost): Post => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  excerpt: row.description || null,
  content: row.body || null,
  img: row.featured_image_src || null,
  published: row.status === "published",
  date: formatDisplayDate(row.publish_date),
  created_at: row.created_at,
  updated_at: row.updated_at,
});

export const listAllPosts = async (): Promise<Post[]> => {
  const sql = getSql();
  const rows = await sql`SELECT * FROM posts ORDER BY created_at DESC`;
  return rows.map((row) => toPost(row as DbPost));
};

export const listPublishedPosts = async (): Promise<Post[]> => {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM posts WHERE status = 'published' ORDER BY publish_date DESC NULLS LAST, created_at DESC
  `;
  return rows.map((row) => toPost(row as DbPost));
};

export const getPostById = async (id: string): Promise<Post | null> => {
  const sql = getSql();
  const rows = await sql`SELECT * FROM posts WHERE id = ${id} LIMIT 1`;
  return rows[0] ? toPost(rows[0] as DbPost) : null;
};

export const getPublishedPostBySlug = async (slug: string): Promise<Post | null> => {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM posts WHERE slug = ${slug} AND status = 'published' LIMIT 1
  `;
  return rows[0] ? toPost(rows[0] as DbPost) : null;
};

export const createPost = async (post: PostInsert): Promise<Post> => {
  const sql = getSql();
  const status = post.published ? "published" : "draft";
  const publishDate = parseDisplayDate(post.date) ?? (post.published ? new Date().toISOString() : null);
  const rows = await sql`
    INSERT INTO posts (
      pillar, slug, title, description, body, body_format,
      featured_image_src, status, publish_date
    )
    VALUES (
      ${DEFAULT_PILLAR},
      ${post.slug},
      ${post.title},
      ${post.excerpt ?? ""},
      ${post.content ?? ""},
      'html',
      ${post.img ?? ""},
      ${status},
      ${publishDate}
    )
    RETURNING *
  `;
  return toPost(rows[0] as DbPost);
};

export const updatePost = async (id: string, post: PostUpdate): Promise<Post | null> => {
  const sql = getSql();
  const existing = await getPostById(id);
  if (!existing) return null;

  const published = post.published !== undefined ? post.published : existing.published;
  const status = published ? "published" : "draft";
  const publishDate =
    post.date !== undefined
      ? parseDisplayDate(post.date)
      : published && !existing.published
        ? new Date().toISOString()
        : parseDisplayDate(existing.date);

  const rows = await sql`
    UPDATE posts SET
      title = ${post.title ?? existing.title},
      slug = ${post.slug ?? existing.slug},
      description = ${post.excerpt !== undefined ? (post.excerpt ?? "") : (existing.excerpt ?? "")},
      body = ${post.content !== undefined ? (post.content ?? "") : (existing.content ?? "")},
      featured_image_src = ${post.img !== undefined ? (post.img ?? "") : (existing.img ?? "")},
      status = ${status},
      publish_date = ${publishDate},
      updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0] ? toPost(rows[0] as DbPost) : null;
};

export const deletePost = async (id: string): Promise<boolean> => {
  const sql = getSql();
  const rows = await sql`DELETE FROM posts WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
};

export const savePostImageMetadata = async (input: {
  objectKey: string;
  fileUrl: string;
  folder: string;
  contentType?: string | null;
}): Promise<void> => {
  const sql = getSql();
  await sql`
    INSERT INTO post_images (object_key, file_url, folder, content_type)
    VALUES (${input.objectKey}, ${input.fileUrl}, ${input.folder}, ${input.contentType ?? null})
    ON CONFLICT (object_key) DO NOTHING
  `;
};
