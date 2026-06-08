import type { Post, PostInsert, PostUpdate } from "@/types/posts";

export type { Post, PostInsert, PostUpdate };

const apiFetch = async (path: string, init?: RequestInit) => {
  const res = await fetch(path, init);
  if (res.status === 204) return null;

  const text = await res.text();
  if (!text) {
    throw new Error(res.ok ? "Empty response from server" : `Request failed (${res.status})`);
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Invalid response from server (${res.status})`);
  }

  if (!res.ok) {
    const err = data as { error?: string; message?: string };
    throw new Error(err.error ?? err.message ?? "Request failed");
  }
  return data;
};

export const getPosts = async (): Promise<Post[]> =>
  apiFetch("/api/cms/posts") as Promise<Post[]>;

export const getPublishedPosts = async (): Promise<Post[]> =>
  apiFetch("/api/posts") as Promise<Post[]>;

export const getPostBySlug = async (slug: string): Promise<Post | null> => {
  try {
    return (await apiFetch(`/api/posts/by-slug/${encodeURIComponent(slug)}`)) as Post;
  } catch {
    return null;
  }
};

export const getPostById = async (id: string): Promise<Post | null> => {
  try {
    return (await apiFetch(`/api/cms/posts/${id}`)) as Post;
  } catch {
    return null;
  }
};

export const createPost = async (post: PostInsert): Promise<Post> =>
  apiFetch("/api/cms/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(post),
  }) as Promise<Post>;

export const updatePost = async (id: string, post: PostUpdate): Promise<Post> =>
  apiFetch(`/api/cms/posts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(post),
  }) as Promise<Post>;

export const deletePost = async (id: string): Promise<void> => {
  await apiFetch(`/api/cms/posts/${id}`, { method: "DELETE" });
};

export const savePostImageMetadata = async (input: {
  objectKey: string;
  fileUrl: string;
  folder: string;
  contentType?: string;
}): Promise<void> => {
  await apiFetch("/api/cms/images", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
};
