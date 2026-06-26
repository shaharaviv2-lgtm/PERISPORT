import { Instagram, MessageCircle } from "lucide-react";
import { useEffect } from "react";

const socials = [
  {
    label: "Instagram",
    handle: "@perisport",
    href: "https://instagram.com/perisport",
    icon: <Instagram className="w-6 h-6" />,
  },
  {
    label: "WhatsApp",
    handle: "שלח הודעה",
    href: "https://wa.me/972555737400",
    icon: <MessageCircle className="w-6 h-6" />,
  },
  {
    label: "TikTok",
    handle: "@perisport",
    href: "https://tiktok.com/@perisport",
    icon: <span className="font-mono text-sm font-bold">TK</span>,
  },
];

export default function Contact() {
  useEffect(() => {
    document.title = "צור קשר | PERI Sport";
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center w-full pt-16 pb-24 px-4">
      <h1 className="font-display text-5xl md:text-6xl font-bold uppercase tracking-tighter mb-4 text-center">
        צור קשר
      </h1>
      <p className="font-mono text-muted-foreground uppercase tracking-widest text-sm mb-16 text-center">
        // עקבו אחרינו ברשתות
      </p>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        {socials.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-5 border border-border bg-card p-5 hover:border-primary hover:bg-primary/5 transition-all"
          >
            <div className="w-12 h-12 border border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 transition-all flex-shrink-0 text-foreground">
              {s.icon}
            </div>
            <div>
              <p className="font-display font-bold uppercase tracking-wider text-lg leading-tight">{s.label}</p>
              <p className="font-mono text-xs text-muted-foreground">{s.handle}</p>
            </div>
            <div className="mr-auto w-8 h-8 border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-primary-foreground transition-all font-mono text-xs">
              ←
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
