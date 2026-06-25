import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, MapPin, Phone } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, "השם חייב להכיל לפחות 2 תווים"),
  email: z.string().email("כתובת אימייל לא תקינה"),
  subject: z.string().min(2, "נדרש נושא"),
  message: z.string().min(10, "ההודעה חייבת להכיל לפחות 10 תווים"),
});

export default function Contact() {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof contactSchema>) {
    toast({
      title: "ההודעה נשלחה!",
      description: "קיבלנו את הודעתך. צפה לתגובה תוך 24 שעות.",
      className: "border-primary bg-card font-mono rounded-none",
    });
    form.reset();
  }

  return (
    <div className="min-h-screen bg-background flex flex-col w-full pt-16 pb-24">
      <div className="container mx-auto px-4 md:px-6">
        
        <div className="mb-16">
          <h1 className="font-display text-5xl md:text-6xl font-bold uppercase tracking-tighter mb-4">
            צור קשר
          </h1>
          <p className="font-mono text-muted-foreground uppercase tracking-widest text-sm">
            // ערוץ מאובטח פתוח. ממתין לקלט.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          
          {/* Contact Info Sidebar */}
          <div className="lg:col-span-4 space-y-12">
            <div className="p-8 border border-border bg-card/50 space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-primary/50" />
              
              <div>
                <h3 className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-4 border-b border-border/50 pb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> מיקום המטה
                </h3>
                <p className="font-display text-lg uppercase leading-snug">
                  482 דרך הביצועים<br/>
                  מגזר 7, מחוז<br/>
                  תל אביב 6100101
                </p>
              </div>

              <div>
                <h3 className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-4 border-b border-border/50 pb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" /> אימייל
                </h3>
                <p className="font-mono text-sm">
                  support@peri-sport.sys<br/>
                  press@peri-sport.sys
                </p>
              </div>

              <div>
                <h3 className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-4 border-b border-border/50 pb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" /> קו ישיר
                </h3>
                <p className="font-mono text-sm">
                  03-555-7374
                </p>
              </div>
            </div>
          </div>

          {/* Form Area */}
          <div className="lg:col-span-8">
            <div className="bg-card border border-border p-6 md:p-10 relative">
              <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
              
              <h2 className="font-display text-2xl font-bold uppercase mb-8">שלח הודעה</h2>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-mono text-xs uppercase tracking-widest text-muted-foreground">שם מלא</FormLabel>
                          <FormControl>
                            <Input placeholder="ישראל ישראלי" {...field} className="rounded-none border-border bg-background focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary h-12 font-mono text-right" />
                          </FormControl>
                          <FormMessage className="font-mono text-[10px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-mono text-xs uppercase tracking-widest text-muted-foreground">כתובת אימייל</FormLabel>
                          <FormControl>
                            <Input placeholder="israel@example.com" {...field} className="rounded-none border-border bg-background focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary h-12 font-mono" />
                          </FormControl>
                          <FormMessage className="font-mono text-[10px]" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-xs uppercase tracking-widest text-muted-foreground">נושא</FormLabel>
                        <FormControl>
                          <Input placeholder="שאלה על ציוד" {...field} className="rounded-none border-border bg-background focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary h-12 font-mono text-right" />
                        </FormControl>
                        <FormMessage className="font-mono text-[10px]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-xs uppercase tracking-widest text-muted-foreground">הודעה</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="כתוב את הודעתך כאן..." 
                            className="resize-none rounded-none border-border bg-background focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary min-h-[200px] font-mono text-right"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="font-mono text-[10px]" />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full md:w-auto min-w-[200px] rounded-none font-display font-bold uppercase tracking-wider h-14 bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(153,255,0,0.3)] transition-all">
                    שלח
                  </Button>
                </form>
              </Form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
