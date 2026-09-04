import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface LegalSection {
  title: string;
  paragraphs?: React.ReactNode[];
  items?: React.ReactNode[];
}

interface LegalPageProps {
  badge: string;
  title: string;
  description: string;
  lastUpdated: string;
  icon: LucideIcon;
  sections: LegalSection[];
}

export function LegalPage({
  badge,
  title,
  description,
  lastUpdated,
  icon: Icon,
  sections,
}: LegalPageProps) {
  return (
    <div className="flex flex-col">
      <section className="hero-gradient relative overflow-hidden py-20 md:py-28">
        <div className="decorative-dots absolute inset-0 opacity-5" />
        <div className="absolute right-10 top-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute bottom-10 left-20 h-48 w-48 rounded-full bg-secondary/20 blur-3xl" />
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-6 border-white/20 bg-white/10 px-4 py-2 text-white backdrop-blur-sm">
              <Icon className="mr-2 h-4 w-4" />
              {badge}
            </Badge>
            <h1 className="mb-6 font-display text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-white/70 md:text-xl">
              {description}
            </p>
            <p className="mt-6 text-sm text-white/55">Last updated: {lastUpdated}</p>
          </div>
        </div>
      </section>

      <section className="bg-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <article className="glass-card mx-auto max-w-4xl rounded-2xl border border-border/60 bg-card p-6 shadow-sm md:p-10 lg:p-12">
            <div className="space-y-10">
              {sections.map((section) => (
                <section key={section.title} className="scroll-mt-24">
                  <h2 className="mb-4 font-display text-2xl font-bold text-foreground md:text-3xl">
                    {section.title}
                  </h2>
                  {section.paragraphs?.map((paragraph, index) => (
                    <p
                      key={index}
                      className="mb-4 leading-relaxed text-muted-foreground last:mb-0"
                    >
                      {paragraph}
                    </p>
                  ))}
                  {section.items && (
                    <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground marker:text-primary">
                      {section.items.map((item, index) => (
                        <li key={index} className="pl-1 leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}