import { useRef } from "react";

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TextEditor({ value, onChange }: TextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Donnez une description de la recette..."
        className="w-full min-h-48 p-4 text-gray-700 focus:outline-none resize-none"
      />
    </div>
  );
}
