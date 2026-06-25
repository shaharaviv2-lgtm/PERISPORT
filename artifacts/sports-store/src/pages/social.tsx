import { useListSocialLinks, getListSocialLinksQueryKey } from "@workspace/api-client-react";
import { ExternalLink, Users } from "lucide-react";

export default function Social() {
  const { data: links, isLoading } = useListSocialLinks({
    query: { queryKey: getListSocialLinksQueryKey() }
  });

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-20 px-4 relative overflow-hidden">
      {/* Background glitch effect */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-12 text-center">
        
        {/* Header */}
        <div className="space-y-6">
          <div className="w-24 h-24 mx-auto mb-8 flex items-center justify-center drop-shadow-[0_0_20px_rgba(234,179,8,0.4)]">
            <img src="/images/logo.png" alt="PERI" className="w-full h-full object-contain" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight glitch-hover" data-text="PERI_NETWORK">
            PERI_NETWORK
          </h1>
          <p className="font-mono text-muted-foreground text-sm uppercase tracking-widest">
            // התחבר אלינו
          </p>
        </div>

        {/* Links */}
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 w-full bg-card border border-border animate-pulse rounded-none" />
            ))
          ) : (
            links?.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-5 bg-card border border-border hover:border-primary hover:bg-card/80 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-10 h-10 bg-background border border-border flex items-center justify-center group-hover:border-primary/50 transition-colors">
                    <span className="font-display font-bold text-lg uppercase leading-none">
                      {link.platform.charAt(0)}
                    </span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-display font-bold text-lg uppercase tracking-wider group-hover:text-primary transition-colors">
                      {link.platform}
                    </h3>
                    <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground mt-1">
                      <span className="text-foreground">@{link.handle}</span>
                      {link.followerCount && (
                        <>
                          <span className="w-1 h-1 bg-border rounded-full" />
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {link.followerCount}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:scale-110 group-hover:-translate-y-1 transition-all relative z-10" />
              </a>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-border/50">
          <div className="flex items-center justify-center gap-2 font-mono text-xs text-muted-foreground uppercase tracking-widest">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            חיבור מאובטח
          </div>
        </div>

      </div>
    </div>
  );
}
