import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/vihem/Layout";
import PageHero from "@/components/vihem/PageHero";
import { getPostBySlug, getPublishedPosts } from "@/lib/posts";
import { resolveContentImages } from "@/lib/images";
import PostImage from "@/components/vihem/PostImage";
import { Calendar } from "lucide-react";

const NewsDetail = () => {
  const { slug = "" } = useParams();

  const { data: post, isLoading } = useQuery({
    queryKey: ["post-slug", slug],
    queryFn: () => getPostBySlug(slug),
    enabled: !!slug,
  });

  const { data: allPosts = [] } = useQuery({
    queryKey: ["published-posts"],
    queryFn: getPublishedPosts,
  });

  if (isLoading) return <Layout><div className="container py-20 text-center">Đang tải...</div></Layout>;
  if (!post) return <Layout><div className="container py-20 text-center">Không tìm thấy bài viết</div></Layout>;

  const others = allPosts.filter((x) => x.slug !== slug).slice(0, 3);

  return (
    <Layout>
      <PageHero title={post.title} crumbs={[{ label: "Tin tức", to: "/tin-tuc" }, { label: post.title }]} />
      <section className="py-12 container grid lg:grid-cols-[1fr_320px] gap-10">
        <article>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mb-4">
            <Calendar className="h-4 w-4" /> {post.date}
          </p>
          {post.img && (
            <PostImage src={post.img} alt={post.title} className="w-full rounded-lg mb-6" />
          )}
          <div className="prose prose-neutral max-w-none text-foreground space-y-4 [&_img]:w-full [&_img]:rounded-lg [&_img]:my-4">
            {post.excerpt && <p className="text-lg font-medium">{post.excerpt}</p>}
            {post.content && (
              <div dangerouslySetInnerHTML={{ __html: resolveContentImages(post.content) }} />
            )}
          </div>
        </article>
        <aside>
          <h3 className="font-bold uppercase text-brand border-b-2 border-brand pb-2 mb-4">Bài viết khác</h3>
          <div className="space-y-4">
            {others.map((o) => (
              <Link key={o.slug} to={`/tin-tuc/${o.slug}`} className="flex gap-3 group">
                {o.img && (
                  <PostImage src={o.img} alt={o.title} className="w-20 h-20 object-cover rounded shrink-0" />
                )}
                <div>
                  <h4 className="font-semibold text-sm group-hover:text-brand line-clamp-2">{o.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{o.date}</p>
                </div>
              </Link>
            ))}
          </div>
        </aside>
      </section>
    </Layout>
  );
};

export default NewsDetail;
