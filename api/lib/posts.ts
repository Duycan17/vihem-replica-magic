export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  img: string | null;
  published: boolean;
  date: string | null;
  created_at: string;
  updated_at: string;
};

export type PostInsert = {
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  img?: string | null;
  published?: boolean;
  date?: string | null;
};

export type PostUpdate = Partial<PostInsert>;
