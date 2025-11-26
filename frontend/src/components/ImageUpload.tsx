import { useRef } from "react";
import type { ChangeEvent } from "react";

interface ImageUploadProps {
  image: File | null;
  onImageChange: (file: File | null) => void;
}

export default function ImageUpload({ image, onImageChange }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageChange(file);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-gray-100 rounded-3xl aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors relative overflow-hidden"
    >
      {image ? (
        <img
          src={URL.createObjectURL(image)}
          alt="Preview"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <>
          {/* Icône assiette avec couverts */}
          <div className="relative w-40 h-40 mb-4">
            <svg
              className="w-full h-full text-gray-300"
              viewBox="0 0 200 200"
              fill="none"
            >
              {/* Assiette */}
              <circle
                cx="100"
                cy="100"
                r="60"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="100"
                cy="100"
                r="45"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              
              {/* Fourchette gauche */}
              <path
                d="M 40 60 L 40 140 M 30 60 L 30 90 M 50 60 L 50 90 M 30 90 L 50 90"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
              />
              
              {/* Couteau droit */}
              <path
                d="M 160 60 L 160 140 M 160 60 L 170 70 L 160 80"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <p className="text-gray-400 text-sm">
            insérer une image (jpg, jpeg, png...)
          </p>
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
