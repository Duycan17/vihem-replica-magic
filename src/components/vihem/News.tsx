import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getPublishedPosts } from "@/lib/posts";
import PostImage from "@/components/vihem/PostImage";

const News = () => {
  const { data: posts = [] } = useQuery({
    queryKey: ["published-posts"],
    queryFn: getPublishedPosts,
    select: (data) => data.slice(0, 4),
  });

  if (posts.length === 0) return null;

  return (
    <section className="py-14 bg-secondary">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-brand">TIN TỨC</h2>
          <div className="w-20 h-1 bg-brand mx-auto mt-3" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {posts.map((n) => (
            <article key={n.slug} className="bg-card rounded-lg overflow-hidden shadow hover:shadow-xl transition-all border border-border">
              <div className="aspect-video overflow-hidden bg-background">
                {n.img && (
                  <PostImage
                    src={n.img}
                    alt={n.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-foreground hover:text-brand line-clamp-2">{n.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{n.excerpt}</p>
                <Link to={`/tin-tuc/${n.slug}`} className="inline-block mt-3 text-sm font-semibold text-brand hover:text-brand-dark">Đọc thêm →</Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default News;
