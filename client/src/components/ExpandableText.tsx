import { useState } from "react";
import { cn } from "@/lib/utils";

interface ExpandableTextProps {
  text: string;
  className?: string;
  lines?: 2 | 3;
}

export function ExpandableText({
  text,
  className,
  lines = 2,
}: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={className}>
      <p className={cn(
        "leading-relaxed",
        !expanded && (lines === 3 ? "line-clamp-3" : "line-clamp-2"),
      )}>
        {text}
      </p>
      <button
        type="button"
        className="mt-1 text-xs font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
      >
        {expanded ? "Show less" : "Read more"}
      </button>
    </div>
  );
}