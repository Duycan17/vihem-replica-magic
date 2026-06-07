import { resolveImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";

type Props = {
  src: string | null | undefined;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
};

const PostImage = ({ src, alt, className, loading = "lazy" }: Props) => {
  const url = resolveImageUrl(src);
  if (!url) return null;

  return <img src={url} alt={alt} loading={loading} className={cn(className)} />;
};

export default PostImage;
