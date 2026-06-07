import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { resolveImageUrl, uploadPostImage } from "@/lib/images";
import { cn } from "@/lib/utils";
import { ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  className?: string;
};

const ImageUploadField = ({ id, label, value, onChange, folder = "featured", className }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const previewUrl = resolveImageUrl(value);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh.");
      return;
    }

    setUploading(true);
    try {
      onChange(await uploadPostImage(file, folder));
      toast.success("Đã tải ảnh lên.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Tải ảnh thất bại.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <Input
          id={id}
          placeholder="https://... hoặc tải ảnh lên"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
        </Button>
      </div>
      {previewUrl && (
        <img src={previewUrl} alt="Xem trước" className="h-24 w-auto rounded border border-border object-cover" />
      )}
    </div>
  );
};

export default ImageUploadField;
