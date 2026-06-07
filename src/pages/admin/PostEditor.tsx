import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPostById, createPost, updatePost } from "@/lib/posts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import RichEditor from "@/components/admin/RichEditor";
import ImageUploadField from "@/components/admin/ImageUploadField";

const schema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  slug: z.string().min(1, "Slug không được để trống").regex(/^[a-z0-9-]+$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang"),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  img: z.string().optional(),
  date: z.string().optional(),
  published: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const todayDate = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const PostEditor = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", id],
    queryFn: () => getPostById(id!),
    enabled: !isNew,
  });

  const { register, handleSubmit, setValue, watch, reset, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { published: false, date: todayDate() },
  });

  useEffect(() => {
    if (post) {
      reset({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt ?? "",
        content: post.content ?? "",
        img: post.img ?? "",
        date: post.date ?? todayDate(),
        published: post.published,
      });
    }
  }, [post, reset]);

  const title = watch("title");
  useEffect(() => {
    if (isNew && title) {
      setValue("slug", slugify(title), { shouldValidate: false });
    }
  }, [title, isNew, setValue]);

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = {
        title: values.title,
        slug: values.slug,
        excerpt: values.excerpt || null,
        content: values.content || null,
        img: values.img || null,
        date: values.date || null,
        published: values.published,
      };
      return isNew ? createPost(payload) : updatePost(id!, payload);
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      queryClient.invalidateQueries({ queryKey: ["published-posts"] });
      toast.success(isNew ? "Đã tạo bài viết." : "Đã cập nhật bài viết.");
      if (isNew) navigate(`/admin/posts/${saved.id}`);
    },
    onError: (err: Error) => toast.error(err.message || "Lưu thất bại."),
  });

  if (!isNew && isLoading) return <p className="text-muted-foreground">Đang tải...</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">{isNew ? "Tạo bài mới" : "Chỉnh sửa bài viết"}</h1>
      <form onSubmit={handleSubmit((v) => saveMutation.mutate(v))} className="space-y-5">
        <div className="space-y-1">
          <Label htmlFor="title">Tiêu đề *</Label>
          <Input id="title" {...register("title")} />
          {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="slug">Slug *</Label>
          <Input id="slug" {...register("slug")} />
          {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="date">Ngày đăng</Label>
            <Input id="date" placeholder="dd/mm/yyyy" {...register("date")} />
          </div>
          <ImageUploadField
            id="img"
            label="Ảnh đại diện"
            value={watch("img") ?? ""}
            onChange={(url) => setValue("img", url, { shouldDirty: true })}
            folder="featured"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="excerpt">Tóm tắt</Label>
          <Textarea id="excerpt" rows={3} {...register("excerpt")} />
        </div>

        <div className="space-y-1">
          <Label>Nội dung</Label>
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <RichEditor value={field.value ?? ""} onChange={field.onChange} />
            )}
          />
        </div>

        <div className="flex items-center gap-3">
          <Switch
            id="published"
            checked={watch("published")}
            onCheckedChange={(v) => setValue("published", v)}
          />
          <Label htmlFor="published">Đăng bài</Label>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Đang lưu..." : "Lưu"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/admin")}>
            Hủy
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PostEditor;
