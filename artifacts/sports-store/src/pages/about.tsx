export default function About() {
  return (
    <div className="min-h-screen bg-background flex flex-col w-full pt-16 pb-24">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl space-y-24">
        
        {/* Header */}
        <div className="space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-border bg-card font-mono text-xs uppercase tracking-widest text-primary mb-6">
            <span className="w-2 h-2 bg-primary animate-pulse" />
            Classified Intel
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold uppercase tracking-tighter">
            Born on the track. <br/>
            <span className="text-muted-foreground">Built for the street.</span>
          </h1>
        </div>

        {/* Image Break */}
        <div className="aspect-[21/9] w-full bg-muted relative overflow-hidden border border-border">
          <img 
            src="/images/category-footwear.png" 
            alt="PERI Culture" 
            className="w-full h-full object-cover mix-blend-luminosity opacity-80"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(10,10,12,0.8))]" />
          <div className="absolute bottom-6 left-6 font-mono text-xs text-primary uppercase tracking-widest">
            // Initial Prototype Testing, 2023
          </div>
        </div>

        {/* Story Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-start">
          <div className="md:col-span-4 md:sticky md:top-32">
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight">The Directive</h2>
            <div className="w-12 h-1 bg-primary mt-4" />
          </div>
          <div className="md:col-span-8 prose prose-invert prose-p:font-mono prose-p:text-muted-foreground prose-p:leading-relaxed prose-strong:text-foreground prose-strong:font-display prose-strong:font-bold prose-strong:uppercase">
            <p>
              <strong>PERI Sport</strong> was not created to fit in. We exist at the intersection of brutal performance demands and uncompromising aesthetic standards. 
            </p>
            <p>
              Most athletic wear forces a choice: look good or perform well. We rejected that binary. Every piece of gear we design undergoes rigorous stress testing before it ever sees a mood board. If it doesn't shave seconds off a sprint, hold up under heavy loads, or breathe perfectly during high-output intervals, it doesn't get made.
            </p>
          </div>
        </div>

        <div className="w-full h-[1px] bg-border" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-start">
          <div className="md:col-span-4 md:sticky md:top-32">
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight">Engineering</h2>
            <div className="w-12 h-1 bg-primary mt-4" />
          </div>
          <div className="md:col-span-8 prose prose-invert prose-p:font-mono prose-p:text-muted-foreground prose-p:leading-relaxed prose-strong:text-foreground prose-strong:font-display prose-strong:font-bold prose-strong:uppercase">
            <p>
              Our materials are sourced from military contractors and advanced textile labs. We employ carbon-infused threading for structural integrity and proprietary moisture-wicking compounds that react dynamically to core body temperature.
            </p>
            <p>
              The aesthetic—stark, sharp, dark—is a byproduct of our philosophy. <strong>Zero excess. High impact.</strong> We don't use neon for decoration; we use it for visibility. We don't use black to be stealthy; we use it because it absorbs heat efficiently during early morning training. Form follows function, violently.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
