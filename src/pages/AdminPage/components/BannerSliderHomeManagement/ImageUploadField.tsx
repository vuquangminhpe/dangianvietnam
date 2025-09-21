import React, { useState, useRef } from "react";
import { Upload, Trash2, Image as ImageIcon, AlertTriangle, Loader } from "lucide-react";
import mediasApi from "../../../../apis/medias.api";

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  value,
  onChange,
  label = "Banner Image",
  required = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith("image/")) {
      return "Please select an image file";
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return "Image size must be less than 10MB";
    }

    // Check file format
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return "Only JPEG, JPG, PNG, and WebP formats are supported";
    }

    return null;
  };

  const handleFileUpload = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const response = await mediasApi.uploadImages(file);

      if (response.data.result && response.data.result.length > 0) {
        const uploadedUrl = response.data.result[0].url;
        onChange(uploadedUrl);
      } else {
        throw new Error("No URL returned from upload");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleRemoveImage = () => {
    onChange("");
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setError(null);
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
        <ImageIcon size={16} />
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${
          dragOver
            ? "border-orange-400 bg-orange-500/10"
            : value
            ? "border-green-500/50 bg-green-500/5"
            : "border-slate-600 hover:border-slate-500"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {uploading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader size={32} className="animate-spin text-orange-400 mb-3" />
            <p className="text-slate-400">Uploading image...</p>
          </div>
        ) : value ? (
          <div className="space-y-4">
            {/* Image Preview */}
            <div className="relative w-full h-40 rounded-lg overflow-hidden bg-slate-700">
              <img
                src={value}
                alt="Banner preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder-image.jpg";
                }}
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                title="Remove image"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* URL Display */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Image URL:</label>
              <input
                type="url"
                value={value}
                onChange={handleUrlChange}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                placeholder="Or paste image URL directly"
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Upload size={32} className="mx-auto text-slate-400 mb-3" />
            <p className="text-slate-300 mb-2">Drop image here or click to upload</p>
            <p className="text-sm text-slate-500 mb-4">
              Supports JPEG, PNG, WebP • Max 10MB
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              Choose File
            </button>

            {/* Manual URL Input */}
            <div className="mt-4 pt-4 border-t border-slate-600">
              <p className="text-xs text-slate-400 mb-2">Or paste image URL:</p>
              <input
                type="url"
                value={value}
                onChange={handleUrlChange}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded p-3">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {/* Upload Specs */}
      <div className="text-xs text-slate-500">
        <p>• Maximum file size: 10MB</p>
        <p>• Supported formats: JPEG, PNG, WebP</p>
        <p>• Recommended dimensions: 1920x1080 or higher</p>
      </div>
    </div>
  );
};