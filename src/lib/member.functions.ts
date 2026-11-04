import { restockRequest } from "./stock";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMemberHome = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const profile = await context.supabase.from("profiles").select("display_name").eq("id", context.userId).single();
    if (profile.error) throw new Error("No se ha podido cargar tu inicio.");
    return { displayName: profile.data.display_name };
  });

export const getCatalogBooks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("books")
      .select("id, title, author, isbn, genre, price, format, stock, description")
      .order("title", { ascending: true });
    if (error) throw new Error("No se ha podido cargar el catálogo.");
    return data.map(book => ({ ...book, price: Number(book.price) }));
  });

export const getBookDetail = createServerFn({ method: "GET" })
  .inputValidator((bookId: string) => bookId)
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data: bookId }) => {
    const { data, error } = await context.supabase
      .from("books")
      .select("id, title, author, isbn, genre, price, format, stock, description")
      .eq("id", bookId)
      .maybeSingle();
    if (error) throw new Error("No se ha podido cargar el libro.");
    if (!data) return null;
    return { ...data, price: Number(data.price) };
  });

export const verifyRestockAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
    if (error) throw new Error("No se han podido comprobar tus permisos.");
    return { allowed: data?.some(row => row.role === "admin" || row.role === "employee") === true };
  });

export const confirmRestock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => restockRequest.parse(input))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.rpc("confirm_restock", { request_id: data.requestId, items: data.items });
    if (error) throw new Error(error.code === "42501" ? "Ya no tienes permiso para reponer." : "No se pudo confirmar la reposición. Comprueba la conexión y vuelve a intentarlo.");
    return { confirmed: true };
  });
