import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/vihem/Layout";
import PageHero from "@/components/vihem/PageHero";
import { Link } from "react-router-dom";
import { getPublishedPosts } from "@/lib/supabase-posts";
import { Calendar } from "lucide-react";

const TinTuc = () => {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["published-posts"],
    queryFn: getPublishedPosts,
  });

  return (
    <Layout>
      <PageHero title="Tin tức" crumbs={[{ label: "Tin tức" }]} />
      <section className="py-12 container">
        {isLoading ? (
          <p className="text-muted-foreground">Đang tải...</p>
        ) : posts.length === 0 ? (
          <p className="text-muted-foreground">Chưa có bài viết nào.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((n) => (
              <article key={n.slug} className="bg-card rounded-lg overflow-hidden border border-border hover:shadow-xl transition-all">
                <Link to={`/tin-tuc/${n.slug}`} className="block aspect-video bg-secondary overflow-hidden">
                  {n.img && (
                    <img src={n.img} alt={n.title} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  )}
                </Link>
                <div className="p-5">
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> {n.date}</p>
                  <h3 className="mt-2 font-bold text-foreground hover:text-brand line-clamp-2">
                    <Link to={`/tin-tuc/${n.slug}`}>{n.title}</Link>
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{n.excerpt}</p>
                  <Link to={`/tin-tuc/${n.slug}`} className="inline-block mt-3 text-sm font-semibold text-brand hover:text-brand-dark">Đọc thêm →</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default TinTuc;
