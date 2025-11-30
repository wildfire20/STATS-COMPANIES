import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, X, Video, Loader2, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export function VideoUpload({ value, onChange, label = "Video" }: VideoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast({
        title: "Invalid file type",
        description: "Please select a video file (MP4, WebM, MOV, etc.)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Video must be less than 100MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('video', file);

      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      const response = await new Promise<{ url: string; fileName: string }>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            try {
              const error = JSON.parse(xhr.responseText);
              reject(new Error(error.error || 'Upload failed'));
            } catch {
              reject(new Error('Upload failed'));
            }
          }
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.open('POST', '/api/upload/video');
        xhr.send(formData);
      });

      setPreview(response.url);
      onChange(response.url);

      toast({
        title: "Video uploaded",
        description: "Your video has been uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload video",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getVideoSrc = (url: string) => {
    if (url.startsWith('/api/videos/') || url.startsWith('http')) {
      return url;
    }
    return url;
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-col gap-3">
        {preview ? (
          <div className="relative w-full max-w-[300px]">
            <video
              src={getVideoSrc(preview)}
              className="w-full h-40 object-cover rounded-md border bg-black"
              controls
              preload="metadata"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6"
              onClick={handleRemove}
              data-testid="button-remove-video"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="w-full max-w-[300px] h-40 border-2 border-dashed rounded-md flex items-center justify-center bg-muted/30">
            <div className="text-center text-muted-foreground">
              <Video className="h-8 w-8 mx-auto mb-1" />
              <p className="text-xs">No video</p>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="w-full max-w-[300px] space-y-2">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="hidden"
            data-testid="input-video-file"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            data-testid="button-upload-video"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Video
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Supported formats: MP4, WebM, MOV. Max size: 100MB
        </p>
      </div>
    </div>
  );
}
