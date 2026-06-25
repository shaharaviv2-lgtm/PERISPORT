import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListProducts,
  useCreateProduct,
  useListCategories,
  getListProductsQueryKey,
  getListCategoriesQueryKey,
  getGetStoreStatsQueryKey,
  getListFeaturedQueryKey,
} from "@workspace/api-client-react";
import type { Product } from "@workspace/api-client-react";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Trash2,
  Package,
  Loader2,
  CheckCircle,
  XCircle,
  Star,
  ShieldAlert,
  Upload,
  ImageIcon,
  X,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BADGE_OPTIONS = ["", "NEW", "SALE", "HOT"] as const;
const FIXED_CATEGORIES = ["apparel", "accessories", "equipment"];

const productSchema = z.object({
  name: z.string().min(2, "Name required"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Price must be positive"),
  originalPrice: z.union([z.coerce.number().positive(), z.literal("")]).optional(),
  category: z.string().min(1, "Category required"),
  imageUrl: z.string().min(1, "Image URL required"),
  badge: z.string().optional(),
  inStock: z.boolean(),
  featured: z.boolean(),
});

type ProductForm = z.infer<typeof productSchema>;

export default function Admin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingAdditional, setUploadingAdditional] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalFileInputRef = useRef<HTMLInputElement>(null);

  async function handleImageUpload(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json() as { url: string };
      form.setValue("imageUrl", url, { shouldValidate: true });
      setPreviewUrl(url);
      toast({ title: "תמונה הועלתה", description: "התמונה מוכנה לשימוש." });
    } catch {
      toast({ title: "שגיאת העלאה", description: "נסה JPG, PNG או WebP עד 10MB.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  async function handleAdditionalImageUpload(file: File) {
    if (additionalPreviews.length >= 5) return;
    setUploadingAdditional(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json() as { url: string };
      setAdditionalPreviews((prev) => [...prev, url]);
      toast({ title: "תמונה נוספת הועלתה" });
    } catch {
      toast({ title: "שגיאת העלאה", variant: "destructive" });
    } finally {
      setUploadingAdditional(false);
    }
  }

  const { data: products, isLoading } = useListProducts(
    {},
    { query: { queryKey: getListProductsQueryKey() } }
  );

  const { data: categories } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() },
  });

  const createProduct = useCreateProduct({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStoreStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListFeaturedQueryKey() });
        form.reset();
        setPreviewUrl(null);
        setAdditionalPreviews([]);
        toast({ title: "מוצר נוסף!", description: "הפריט פעיל עכשיו בחנות." });
      },
      onError: () => {
        toast({ title: "שגיאה בהוספת מוצר", variant: "destructive" });
      },
    },
  });

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      originalPrice: "",
      category: "apparel",
      imageUrl: "",
      badge: "",
      inStock: true,
      featured: false,
    },
  });

  function onSubmit(values: ProductForm) {
    createProduct.mutate({
      data: {
        name: values.name,
        description: values.description || undefined,
        price: values.price,
        originalPrice: values.originalPrice ? Number(values.originalPrice) : undefined,
        category: values.category,
        imageUrl: values.imageUrl,
        additionalImages: additionalPreviews.length > 0 ? additionalPreviews : undefined,
        badge: values.badge || undefined,
        inStock: values.inStock,
        featured: values.featured,
      },
    });
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetStoreStatsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getListFeaturedQueryKey() });
      toast({ title: "Product removed from store." });
    } catch {
      toast({ title: "Failed to delete product", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  }

  const categoryOptions =
    categories && categories.length > 0
      ? categories.map((c) => c.slug)
      : FIXED_CATEGORIES;

  return (
    <div className="min-h-screen bg-background w-full pb-24">
      {/* Admin Header */}
      <div className="border-b border-border bg-card sticky top-16 z-30">
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center gap-4">
          <ShieldAlert className="w-5 h-5 text-primary" />
          <span className="font-mono text-xs uppercase tracking-widest text-primary">
            פאנל ניהול
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            // גישת מנהל
          </span>
          <div className="mr-auto font-mono text-xs text-muted-foreground">
            {products?.length ?? 0} מוצרים בחנות
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-12 grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* ADD PRODUCT FORM */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Plus className="w-4 h-4 text-primary" />
              <h2 className="font-display text-xl font-bold uppercase tracking-tight">הוסף מוצר חדש</h2>
            </div>
            <p className="font-mono text-xs text-muted-foreground">מלא את השדות ולחץ הוסף לחנות.</p>
          </div>

          <div className="bg-card border border-border p-6 relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">שם המוצר</FormLabel>
                      <FormControl>
                        <Input placeholder="לדוגמה: גופיית רונאלדו פורטוגל 2024" className="rounded-none bg-background border-border font-mono text-right" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">מחיר (₪)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="199.90" className="rounded-none bg-background border-border font-mono" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="originalPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">מחיר מקורי (₪) — אופציונלי</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="249.90" className="rounded-none bg-background border-border font-mono" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">קטגוריה</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-none bg-background border-border font-mono capitalize">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-none">
                            {categoryOptions.map((slug) => (
                              <SelectItem key={slug} value={slug} className="font-mono capitalize">
                                {slug}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="badge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">תווית</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-none bg-background border-border font-mono">
                              <SelectValue placeholder="None" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-none">
                            {BADGE_OPTIONS.map((b) => (
                              <SelectItem key={b || "none"} value={b} className="font-mono">
                                {b || "None"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">תמונה ראשית</FormLabel>
                      {/* Hidden file input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                          e.target.value = "";
                        }}
                      />
                      {/* Upload area */}
                      <div
                        className="border border-dashed border-border hover:border-primary/60 transition-colors cursor-pointer relative group"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                      >
                        {previewUrl ? (
                          <div className="relative h-36 bg-muted overflow-hidden">
                            <img
                              src={previewUrl}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <Upload className="w-4 h-4 text-white" />
                              <span className="font-mono text-xs text-white uppercase tracking-wider">החלף תמונה</span>
                            </div>
                          </div>
                        ) : (
                          <div className="h-36 flex flex-col items-center justify-center gap-3 text-muted-foreground group-hover:text-primary transition-colors">
                            {uploading ? (
                              <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            ) : (
                              <ImageIcon className="w-6 h-6" />
                            )}
                            <div className="text-center">
                              <p className="font-mono text-xs uppercase tracking-wider">
                                {uploading ? "מעלה..." : "לחץ או גרור תמונה"}
                              </p>
                              <p className="font-mono text-[10px] text-muted-foreground/60 mt-1">JPG, PNG, WebP — עד 10MB</p>
                            </div>
                          </div>
                        )}
                        {uploading && (
                          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          </div>
                        )}
                      </div>
                      {/* Fallback URL input */}
                      <div className="mt-2">
                        <FormControl>
                          <Input
                            placeholder="או הדבק כתובת URL של תמונה"
                            className="rounded-none bg-background border-border font-mono text-xs text-right"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              setPreviewUrl(e.target.value || null);
                            }}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Additional Images */}
                <div className="space-y-2">
                  <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">תמונות נוספות — עד 5</label>
                  <div className="flex flex-wrap gap-2">
                    {additionalPreviews.map((url, idx) => (
                      <div key={url + idx} className="relative w-16 h-16 bg-muted overflow-hidden border border-border group flex-shrink-0">
                        <img src={url} alt={`תמונה ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setAdditionalPreviews((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute inset-0 bg-destructive/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ))}
                    {additionalPreviews.length < 5 && (
                      <button
                        type="button"
                        onClick={() => additionalFileInputRef.current?.click()}
                        className="w-16 h-16 border border-dashed border-border hover:border-primary cursor-pointer flex items-center justify-center text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                        disabled={uploadingAdditional}
                      >
                        {uploadingAdditional ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-5 h-5" />
                        )}
                      </button>
                    )}
                  </div>
                  <input
                    ref={additionalFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAdditionalImageUpload(file);
                      e.target.value = "";
                    }}
                  />
                  <p className="font-mono text-[10px] text-muted-foreground/60">תמונות הגליה יוצגו כגלריה בדף המוצר</p>
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">תיאור — אופציונלי</FormLabel>
                      <FormControl>
                        <Textarea placeholder="תיאור קצר של המוצר..." rows={3} className="rounded-none bg-background border-border font-mono text-sm resize-none text-right" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="inStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">במלאי</FormLabel>
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => field.onChange(true)}
                            className={`flex-1 h-9 font-mono text-xs uppercase tracking-wider border transition-colors ${field.value ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground hover:border-primary/50"}`}
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => field.onChange(false)}
                            className={`flex-1 h-9 font-mono text-xs uppercase tracking-wider border transition-colors ${!field.value ? "bg-destructive text-destructive-foreground border-destructive" : "bg-background border-border text-muted-foreground hover:border-destructive/50"}`}
                          >
                            No
                          </button>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">מומלץ</FormLabel>
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => field.onChange(true)}
                            className={`flex-1 h-9 font-mono text-xs uppercase tracking-wider border transition-colors ${field.value ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground hover:border-primary/50"}`}
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => field.onChange(false)}
                            className={`flex-1 h-9 font-mono text-xs uppercase tracking-wider border transition-colors ${!field.value ? "bg-card border-border text-muted-foreground" : "bg-background border-border text-muted-foreground hover:border-border"}`}
                          >
                            No
                          </button>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={createProduct.isPending}
                  className="w-full rounded-none font-display font-bold uppercase tracking-wider h-12 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {createProduct.isPending ? (
                    <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> מוסיף...</>
                  ) : (
                    <><Plus className="w-4 h-4 ml-2" /> הוסף לחנות</>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>

        {/* PRODUCT LIST */}
        <div className="lg:col-span-3 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-primary" />
              <h2 className="font-display text-xl font-bold uppercase tracking-tight">מלאי נוכחי</h2>
            </div>
            <p className="font-mono text-xs text-muted-foreground">כל המוצרים הפעילים. ניתן למחוק בכל עת.</p>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 bg-card border border-border animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {products?.map((product) => (
                <AdminProductRow
                  key={product.id}
                  product={product}
                  isDeleting={deletingId === product.id}
                  onDelete={() => handleDelete(product.id)}
                />
              ))}
              {products?.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border">
                  <Package className="w-10 h-10 text-muted-foreground mb-4 opacity-40" />
                  <p className="font-mono text-sm text-muted-foreground">אין מוצרים עדיין. הוסף את הפריט הראשון.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminProductRow({
  product,
  isDeleting,
  onDelete,
}: {
  product: Product;
  isDeleting: boolean;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="flex items-center gap-4 bg-card border border-border p-4 hover:border-border/80 transition-colors group">
      <div className="w-12 h-12 bg-muted overflow-hidden flex-shrink-0">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-display font-bold text-sm uppercase tracking-tight truncate">{product.name}</span>
          {product.badge && (
            <Badge className="rounded-none font-mono text-[9px] uppercase px-1.5 py-0 bg-primary text-primary-foreground border-none">
              {product.badge}
            </Badge>
          )}
          {product.featured && (
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="font-mono text-xs text-muted-foreground capitalize">{product.category}</span>
          <span className="font-mono text-xs font-bold">${product.price.toFixed(2)}</span>
          <span className={`flex items-center gap-1 font-mono text-[10px] uppercase ${product.inStock ? "text-primary" : "text-destructive"}`}>
            {product.inStock ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            {product.inStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {confirmDelete ? (
          <>
            <Button
              size="sm"
              variant="destructive"
              className="rounded-none font-mono text-xs h-8 px-3"
              disabled={isDeleting}
              onClick={onDelete}
            >
              {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirm"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-none font-mono text-xs h-8 px-3"
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            className="rounded-none h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
