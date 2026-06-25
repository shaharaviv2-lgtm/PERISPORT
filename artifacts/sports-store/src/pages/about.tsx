export default function About() {
  return (
    <div className="min-h-screen bg-background flex flex-col w-full pt-16 pb-24">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl space-y-24">
        
        {/* Header */}
        <div className="space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-border bg-card font-mono text-xs uppercase tracking-widest text-primary mb-6">
            <span className="w-2 h-2 bg-primary animate-pulse" />
            PERI SPORT
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold uppercase tracking-tighter">
            גופיות של <br/>
            <span className="text-muted-foreground">אלופים.</span>
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
          <div className="absolute bottom-6 right-6 font-mono text-xs text-primary uppercase tracking-widest">
            // בדיקות אב-טיפוס ראשוניות, 2023
          </div>
        </div>

        {/* Story Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-start">
          <div className="md:col-span-4 md:sticky md:top-32">
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight">המשימה</h2>
            <div className="w-12 h-1 bg-primary mt-4" />
          </div>
          <div className="md:col-span-8 prose prose-invert prose-p:font-mono prose-p:text-muted-foreground prose-p:leading-relaxed prose-strong:text-foreground prose-strong:font-display prose-strong:font-bold prose-strong:uppercase">
            <p>
              <strong>PERI Sport</strong> הוקמה מתוך אהבה אמיתית לכדורגל ולכדורסל. אנחנו מביאים לישראל גופיות ומכנסי ספורט רשמיים של הכוכבים הגדולים ביותר — מרונאלדו ומסי ועד לוקה דונצ'יץ' וליברון ג'יימס.
            </p>
            <p>
              כל גופייה שאנחנו מוכרים היא מקורית, מורשית ומגיעה ישירות מהייצור הרשמי. אנחנו מאמינים שכל פאן ראוי ללבוש את הצבעים של הכוכב שהוא אוהב — ביום המשחק ובכל יום אחר.
            </p>
          </div>
        </div>

        <div className="w-full h-[1px] bg-border" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-start">
          <div className="md:col-span-4 md:sticky md:top-32">
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight">האיכות</h2>
            <div className="w-12 h-1 bg-primary mt-4" />
          </div>
          <div className="md:col-span-8 prose prose-invert prose-p:font-mono prose-p:text-muted-foreground prose-p:leading-relaxed prose-strong:text-foreground prose-strong:font-display prose-strong:font-bold prose-strong:uppercase">
            <p>
              אנחנו עובדים אך ורק עם ספקים מורשים. הגופיות שלנו עשויות מאותם החומרים שהשחקנים עצמם לובשים — <strong>טכנולוגיית DryFit, ניהול לחות מתקדם, תפרים מחוזקים</strong> שעומדים בעומס המשחק האמיתי.
            </p>
            <p>
              כל הזמנה מגיעה עם תעודת מקוריות ואריזה מושקעת. משלוח מהיר לכל הארץ, עם אפשרות החזרה חינם תוך 14 יום. כי כשאתה קונה גופייה, אתה קונה חוויה.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
