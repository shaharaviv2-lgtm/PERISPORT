export default function About() {
  return (
    <div className="min-h-screen bg-background flex flex-col w-full pt-16 pb-24">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl space-y-24">
        
        {/* Header */}
        <div className="space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-border bg-card font-mono text-xs uppercase tracking-widest text-primary mb-6">
            <span className="w-2 h-2 bg-primary animate-pulse" />
            מידע סווג
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold uppercase tracking-tighter">
            נולד במגרש. <br/>
            <span className="text-muted-foreground">נבנה לרחוב.</span>
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
              <strong>PERI Sport</strong> לא נוצרה כדי להתאים. אנחנו קיימים בצומת שבין דרישות ביצועים קשוחות ותקנים אסתטיים ללא פשרות.
            </p>
            <p>
              רוב ביגוד הספורט מכריח בחירה: להיראות טוב או לבצע טוב. אנחנו דחינו את הבינאריות הזו. כל פריט ציוד שאנחנו מעצבים עובר בדיקות עומס קפדניות לפני שהוא מגיע לשולחן העיצוב. אם הוא לא מקצר שניות בריצה, לא מחזיק תחת עומסים כבדים, או לא נושם בצורה מושלמת — הוא פשוט לא נוצר.
            </p>
          </div>
        </div>

        <div className="w-full h-[1px] bg-border" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-start">
          <div className="md:col-span-4 md:sticky md:top-32">
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight">הנדסה</h2>
            <div className="w-12 h-1 bg-primary mt-4" />
          </div>
          <div className="md:col-span-8 prose prose-invert prose-p:font-mono prose-p:text-muted-foreground prose-p:leading-relaxed prose-strong:text-foreground prose-strong:font-display prose-strong:font-bold prose-strong:uppercase">
            <p>
              החומרים שלנו מגיעים מקבלני ביטחון ומעבדות טקסטיל מתקדמות. אנו משתמשים בחוטי פחמן לחוזק מבני ובתרכובות ייחודיות לניהול לחות שמגיבות דינמית לטמפרטורת גוף הליבה.
            </p>
            <p>
              האסתטיקה — קשוחה, חדה, כהה — היא תוצר לוואי של הפילוסופיה שלנו. <strong>אפס עודף. השפעה מקסימלית.</strong> אנחנו לא משתמשים בניאון לקישוט — אנחנו משתמשים בו לנראות. אנחנו לא לובשים שחור כדי להסתתר — הצבע הזה סופג חום ביעילות באימוני הבוקר המוקדמים. הצורה עוקבת אחרי הפונקציה, בצורה קיצונית.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
