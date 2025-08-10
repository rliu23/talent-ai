import React, { useState, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  label?: string;
  placeholder?: string;
  values: string[];
  onChange: (values: string[]) => void;
  suggestions?: string[];
}

const TagInput: React.FC<TagInputProps> = ({ label, placeholder, values, onChange, suggestions = [] }) => {
  const [input, setInput] = useState("");

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (!t) return;
    if (values.includes(t)) return;
    onChange([...values, t]);
    setInput("");
  };

  const removeTag = (tag: string) => {
    onChange(values.filter((v) => v !== tag));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && values.length) {
      onChange(values.slice(0, -1));
    }
  };

  return (
    <div>
      {label && <label className="mb-2 block text-sm font-medium text-foreground">{label}</label>}
      <div className={cn("flex flex-wrap items-center gap-2 rounded-md border border-input bg-background px-2 py-2")}
      >
        {values.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground">
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              className="rounded-full p-0.5 hover:bg-accent"
              onClick={() => removeTag(tag)}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="border-0 focus-visible:ring-0 flex-1 min-w-[10rem]"
        />
      </div>
      {suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => addTag(s)}
              className="text-xs rounded-full border border-input px-2 py-1 hover:bg-accent hover:text-accent-foreground"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagInput;
