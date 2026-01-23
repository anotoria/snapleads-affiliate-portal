import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

// Validation helpers
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

const sanitizeString = (str: string, maxLength: number = 255): string => {
  return str.trim().slice(0, maxLength);
};

// Types
type TableName = "profiles" | "leads" | "payouts" | "users" | "user_roles" | "tiers" | "pricing_tiers" | "commission_history" | "documents" | "support_tickets" | "support_messages";
type ActionType = "insert" | "update" | "upsert" | "get" | "delete" | "calculate_tier" | "calculate_commission" | "deactivate_user" | "activate_user" | "reset_password" | "get_admin_summary";

interface WebhookPayload {
  action: ActionType;
  table?: TableName;
  data?: Record<string, unknown>;
  match?: Record<string, unknown>;
  filters?: {
    user_id?: string;
    status?: string;
    is_active?: boolean;
    tier_level?: string;
    category?: string;
    priority?: string;
    ticket_id?: string;
    reference_month?: string;
    created_after?: string;
    created_before?: string;
    limit?: number;
    offset?: number;
  };
}

interface UserData {
  email: string;
  password?: string;
  full_name?: string;
  affiliate_code?: string;
  affiliate_url?: string;
  company_name?: string;
  cnpj?: string;
  phone?: string;
  tier_level?: string;
  role?: "admin" | "super_admin" | "user";
}

const DEFAULT_TEMP_PASSWORD = "TempPass123!";

const VALID_TABLES: TableName[] = [
  "profiles", "leads", "payouts", "users", "user_roles", 
  "tiers", "pricing_tiers", "commission_history", 
  "documents", "support_tickets", "support_messages"
];

const VALID_ACTIONS: ActionType[] = [
  "insert", "update", "upsert", "get", "delete",
  "calculate_tier", "calculate_commission", 
  "deactivate_user", "activate_user", "reset_password",
  "get_admin_summary"
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookSecret = req.headers.get("x-webhook-secret");
    const expectedSecret = Deno.env.get("N8N_WEBHOOK_SECRET");

    if (!webhookSecret || webhookSecret !== expectedSecret) {
      console.error("Invalid webhook secret");
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized - Invalid webhook secret" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: WebhookPayload = await req.json();
    console.log("Received webhook payload:", JSON.stringify(payload, null, 2));

    if (!payload.action) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required field: action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!VALID_ACTIONS.includes(payload.action)) {
      return new Response(
        JSON.stringify({ success: false, error: `Invalid action. Must be one of: ${VALID_ACTIONS.join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // deno-lint-ignore no-explicit-any
    const supabase = createClient<any>(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { action, table, data, match, filters } = payload;

    // Handle special actions that don't require a table
    if (action === "get_admin_summary") {
      const result = await handleAdminSummary(supabase);
      return new Response(
        JSON.stringify(result),
        { status: result.success ? 200 : 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "calculate_tier") {
      const result = await handleCalculateTier(supabase, data);
      return new Response(
        JSON.stringify(result),
        { status: result.success ? 200 : 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "calculate_commission") {
      const result = await handleCalculateCommission(supabase, data);
      return new Response(
        JSON.stringify(result),
        { status: result.success ? 200 : 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "deactivate_user") {
      const result = await handleDeactivateUser(supabase, data);
      return new Response(
        JSON.stringify(result),
        { status: result.success ? 200 : 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "activate_user") {
      const result = await handleActivateUser(supabase, data);
      return new Response(
        JSON.stringify(result),
        { status: result.success ? 200 : 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "reset_password") {
      const result = await handleResetPassword(supabase, data);
      return new Response(
        JSON.stringify(result),
        { status: result.success ? 200 : 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For table operations, table is required
    if (!table) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required field: table" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!VALID_TABLES.includes(table)) {
      return new Response(
        JSON.stringify({ success: false, error: `Invalid table. Must be one of: ${VALID_TABLES.join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For insert/update/upsert, data is required
    if (["insert", "update", "upsert"].includes(action) && !data) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required field 'data' for this action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle GET action
    if (action === "get") {
      const result = await handleGetOperation(supabase, table, filters);
      return new Response(
        JSON.stringify(result),
        { status: result.success ? 200 : 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle DELETE action
    if (action === "delete") {
      const result = await handleDeleteOperation(supabase, table, match);
      return new Response(
        JSON.stringify(result),
        { status: result.success ? 200 : 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle users table separately (uses Auth Admin API)
    if (table === "users") {
      const userData: UserData = {
        email: String(data!.email || ""),
        password: data!.password ? String(data!.password) : undefined,
        full_name: data!.full_name ? String(data!.full_name) : undefined,
        affiliate_code: data!.affiliate_code ? String(data!.affiliate_code) : undefined,
        affiliate_url: data!.affiliate_url ? String(data!.affiliate_url) : undefined,
        company_name: data!.company_name ? String(data!.company_name) : undefined,
        cnpj: data!.cnpj ? String(data!.cnpj) : undefined,
        phone: data!.phone ? String(data!.phone) : undefined,
        tier_level: data!.tier_level ? String(data!.tier_level) : undefined,
        role: data!.role as UserData["role"],
      };
      const result = await handleUserOperation(supabase, action, userData, match);
      return new Response(
        JSON.stringify(result),
        { status: result.success ? 200 : 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle user_roles table
    if (table === "user_roles") {
      const result = await handleUserRolesOperation(supabase, action, data, match);
      return new Response(
        JSON.stringify(result),
        { status: result.success ? 200 : 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate and sanitize data for other tables
    const validatedData = validateTableData(table, data!);
    if (validatedData.error) {
      return new Response(
        JSON.stringify({ success: false, error: validatedData.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result;

    switch (action) {
      case "insert": {
        const { data: insertedData, error } = await supabase
          .from(table)
          .insert(validatedData.data)
          .select()
          .single();

        if (error) throw error;
        result = { action: "inserted", data: insertedData };
        break;
      }

      case "update": {
        if (!match || Object.keys(match).length === 0) {
          return new Response(
            JSON.stringify({ success: false, error: "Update action requires 'match' field to identify record" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        let query = supabase.from(table).update(validatedData.data);
        
        for (const [key, value] of Object.entries(match)) {
          query = query.eq(key, value);
        }

        const { data: updatedData, error } = await query.select();
        if (error) throw error;
        
        result = { action: "updated", data: updatedData, matched: match };
        break;
      }

      case "upsert": {
        const { data: upsertedData, error } = await supabase
          .from(table)
          .upsert(validatedData.data, { onConflict: getConflictColumn(table) })
          .select();

        if (error) throw error;
        result = { action: "upserted", data: upsertedData };
        break;
      }
    }

    console.log("Webhook operation successful:", result);

    return new Response(
      JSON.stringify({ success: true, result }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Webhook error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ==========================================
// GET Operations
// ==========================================

interface GetFilters {
  user_id?: string;
  status?: string;
  is_active?: boolean;
  tier_level?: string;
  category?: string;
  priority?: string;
  ticket_id?: string;
  reference_month?: string;
  created_after?: string;
  created_before?: string;
  limit?: number;
  offset?: number;
}

// deno-lint-ignore no-explicit-any
async function handleGetOperation(
  supabase: any,
  table: TableName,
  filters?: GetFilters
): Promise<{ success: boolean; result?: unknown; error?: string }> {
  const limit = filters?.limit || 100;
  const offset = filters?.offset || 0;

  try {
    switch (table) {
      case "users": {
        let profileQuery = supabase
          .from("profiles")
          .select("*, user_roles(role)")
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (filters?.user_id) {
          profileQuery = profileQuery.eq("user_id", filters.user_id);
        }
        if (filters?.is_active !== undefined) {
          profileQuery = profileQuery.eq("is_active", filters.is_active);
        }
        if (filters?.tier_level) {
          profileQuery = profileQuery.eq("tier_level", filters.tier_level);
        }
        if (filters?.created_after) {
          profileQuery = profileQuery.gte("created_at", filters.created_after);
        }
        if (filters?.created_before) {
          profileQuery = profileQuery.lte("created_at", filters.created_before);
        }

        const { data: profiles, error: profileError } = await profileQuery;
        if (profileError) return { success: false, error: profileError.message };

        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        if (authError) return { success: false, error: authError.message };

        // Get leads and payouts counts for each user
        // deno-lint-ignore no-explicit-any
        const enrichedUsers = await Promise.all(profiles.map(async (profile: any) => {
          // deno-lint-ignore no-explicit-any
          const authUser = authUsers.users.find((u: any) => u.id === profile.user_id);
          
          // Get leads summary
          const { data: leadsData } = await supabase
            .from("leads")
            .select("status, commission")
            .eq("user_id", profile.user_id);
          
          const leadsCount = leadsData?.length || 0;
          const activeLeads = leadsData?.filter((l: { status: string }) => l.status === "active").length || 0;
          const totalCommission = leadsData?.reduce((sum: number, l: { commission: number }) => sum + (l.commission || 0), 0) || 0;

          // Get pending payouts
          const { data: payoutsData } = await supabase
            .from("payouts")
            .select("amount, status")
            .eq("user_id", profile.user_id)
            .eq("status", "pending");
          
          const pendingPayouts = payoutsData?.reduce((sum: number, p: { amount: number }) => sum + (p.amount || 0), 0) || 0;

          return {
            ...profile,
            email: authUser?.email || null,
            last_sign_in_at: authUser?.last_sign_in_at || null,
            created_at_auth: authUser?.created_at || null,
            leads_count: leadsCount,
            active_leads: activeLeads,
            total_commission: totalCommission,
            pending_payouts: pendingPayouts,
            roles: profile.user_roles?.map((r: { role: string }) => r.role) || [],
          };
        }));

        return {
          success: true,
          result: { action: "get", table: "users", data: enrichedUsers, count: enrichedUsers.length, filters: filters || {} },
        };
      }

      case "leads": {
        let query = supabase
          .from("leads")
          .select("*, profiles!inner(full_name, affiliate_code, company_name, tier_level)")
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (filters?.user_id) query = query.eq("user_id", filters.user_id);
        if (filters?.status) query = query.eq("status", filters.status);
        if (filters?.created_after) query = query.gte("created_at", filters.created_after);
        if (filters?.created_before) query = query.lte("created_at", filters.created_before);

        const { data: leads, error } = await query;
        if (error) return { success: false, error: error.message };

        return { success: true, result: { action: "get", table: "leads", data: leads, count: leads.length, filters: filters || {} } };
      }

      case "payouts": {
        let query = supabase
          .from("payouts")
          .select("*, profiles!inner(full_name, affiliate_code, company_name)")
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (filters?.user_id) query = query.eq("user_id", filters.user_id);
        if (filters?.status) query = query.eq("status", filters.status);
        if (filters?.created_after) query = query.gte("created_at", filters.created_after);
        if (filters?.created_before) query = query.lte("created_at", filters.created_before);

        const { data: payouts, error } = await query;
        if (error) return { success: false, error: error.message };

        return { success: true, result: { action: "get", table: "payouts", data: payouts, count: payouts.length, filters: filters || {} } };
      }

      case "profiles": {
        let query = supabase
          .from("profiles")
          .select("*, user_roles(role)")
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (filters?.user_id) query = query.eq("user_id", filters.user_id);
        if (filters?.is_active !== undefined) query = query.eq("is_active", filters.is_active);
        if (filters?.tier_level) query = query.eq("tier_level", filters.tier_level);
        if (filters?.created_after) query = query.gte("created_at", filters.created_after);
        if (filters?.created_before) query = query.lte("created_at", filters.created_before);

        const { data: profiles, error } = await query;
        if (error) return { success: false, error: error.message };

        return { success: true, result: { action: "get", table: "profiles", data: profiles, count: profiles.length, filters: filters || {} } };
      }

      case "tiers": {
        let query = supabase
          .from("tiers")
          .select("*")
          .order("sort_order", { ascending: true });

        if (filters?.is_active !== undefined) query = query.eq("is_active", filters.is_active);

        const { data: tiers, error } = await query;
        if (error) return { success: false, error: error.message };

        return { success: true, result: { action: "get", table: "tiers", data: tiers, count: tiers.length, filters: filters || {} } };
      }

      case "pricing_tiers": {
        let query = supabase
          .from("pricing_tiers")
          .select("*")
          .order("sort_order", { ascending: true });

        if (filters?.is_active !== undefined) query = query.eq("is_active", filters.is_active);

        const { data: pricingTiers, error } = await query;
        if (error) return { success: false, error: error.message };

        return { success: true, result: { action: "get", table: "pricing_tiers", data: pricingTiers, count: pricingTiers.length, filters: filters || {} } };
      }

      case "commission_history": {
        let query = supabase
          .from("commission_history")
          .select("*, profiles!inner(full_name, company_name, tier_level)")
          .order("calculated_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (filters?.user_id) query = query.eq("user_id", filters.user_id);
        if (filters?.status) query = query.eq("status", filters.status);
        if (filters?.reference_month) query = query.eq("reference_month", filters.reference_month);
        if (filters?.created_after) query = query.gte("calculated_at", filters.created_after);
        if (filters?.created_before) query = query.lte("calculated_at", filters.created_before);

        const { data: commissions, error } = await query;
        if (error) return { success: false, error: error.message };

        return { success: true, result: { action: "get", table: "commission_history", data: commissions, count: commissions.length, filters: filters || {} } };
      }

      case "documents": {
        let query = supabase
          .from("documents")
          .select("*, profiles!inner(full_name, company_name)")
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (filters?.user_id) query = query.eq("user_id", filters.user_id);
        if (filters?.category) query = query.eq("category", filters.category);
        if (filters?.created_after) query = query.gte("created_at", filters.created_after);
        if (filters?.created_before) query = query.lte("created_at", filters.created_before);

        const { data: documents, error } = await query;
        if (error) return { success: false, error: error.message };

        return { success: true, result: { action: "get", table: "documents", data: documents, count: documents.length, filters: filters || {} } };
      }

      case "support_tickets": {
        let query = supabase
          .from("support_tickets")
          .select("*, profiles!inner(full_name, company_name), support_messages(count)")
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (filters?.user_id) query = query.eq("user_id", filters.user_id);
        if (filters?.status) query = query.eq("status", filters.status);
        if (filters?.priority) query = query.eq("priority", filters.priority);
        if (filters?.category) query = query.eq("category", filters.category);
        if (filters?.created_after) query = query.gte("created_at", filters.created_after);
        if (filters?.created_before) query = query.lte("created_at", filters.created_before);

        const { data: tickets, error } = await query;
        if (error) return { success: false, error: error.message };

        return { success: true, result: { action: "get", table: "support_tickets", data: tickets, count: tickets.length, filters: filters || {} } };
      }

      case "support_messages": {
        if (!filters?.ticket_id) {
          return { success: false, error: "ticket_id filter is required for support_messages" };
        }

        const { data: messages, error } = await supabase
          .from("support_messages")
          .select("*, profiles!inner(full_name)")
          .eq("ticket_id", filters.ticket_id)
          .order("created_at", { ascending: true });

        if (error) return { success: false, error: error.message };

        return { success: true, result: { action: "get", table: "support_messages", data: messages, count: messages.length, filters: filters || {} } };
      }

      case "user_roles": {
        let query = supabase
          .from("user_roles")
          .select("*, profiles!inner(full_name, company_name)")
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (filters?.user_id) query = query.eq("user_id", filters.user_id);

        const { data: roles, error } = await query;
        if (error) return { success: false, error: error.message };

        return { success: true, result: { action: "get", table: "user_roles", data: roles, count: roles.length, filters: filters || {} } };
      }

      default:
        return { success: false, error: "Unknown table for get operation" };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}

// ==========================================
// DELETE Operations
// ==========================================

// deno-lint-ignore no-explicit-any
async function handleDeleteOperation(
  supabase: any,
  table: TableName,
  match?: Record<string, unknown>
): Promise<{ success: boolean; result?: unknown; error?: string }> {
  if (!match || Object.keys(match).length === 0) {
    return { success: false, error: "Delete action requires 'match' field to identify record" };
  }

  // Only allow delete on certain tables
  const deletableTables: TableName[] = ["documents", "support_tickets", "support_messages", "user_roles"];
  if (!deletableTables.includes(table)) {
    return { success: false, error: `Delete not allowed on table: ${table}. Allowed tables: ${deletableTables.join(", ")}` };
  }

  try {
    // Special handling for users - delete from auth
    if (table === "users" as TableName) {
      if (!match.user_id || !isValidUUID(String(match.user_id))) {
        return { success: false, error: "user_id is required and must be a valid UUID" };
      }
      
      const { error } = await supabase.auth.admin.deleteUser(String(match.user_id));
      if (error) return { success: false, error: error.message };
      
      return { success: true, result: { action: "deleted", table: "users", user_id: match.user_id } };
    }

    let query = supabase.from(table).delete();
    
    for (const [key, value] of Object.entries(match)) {
      query = query.eq(key, value);
    }

    const { data, error } = await query.select();
    if (error) return { success: false, error: error.message };

    return { success: true, result: { action: "deleted", table, data, matched: match } };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}

// ==========================================
// User Operations
// ==========================================

// deno-lint-ignore no-explicit-any
async function handleUserOperation(
  supabase: any,
  action: string,
  data: UserData,
  match?: Record<string, unknown>
): Promise<{ success: boolean; result?: unknown; error?: string }> {
  
  if (data.email && !isValidEmail(data.email)) {
    return { success: false, error: "Invalid email format" };
  }

  if (action === "insert") {
    if (!data.email) {
      return { success: false, error: "Email is required to create a user" };
    }

    const password = data.password || DEFAULT_TEMP_PASSWORD;
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: data.full_name || data.email.split('@')[0],
      },
    });

    if (authError) {
      console.error("Error creating user:", authError);
      return { success: false, error: authError.message };
    }

    if (authData.user) {
      const profileUpdate: Record<string, unknown> = {
        must_change_password: !data.password,
      };
      
      if (data.full_name) profileUpdate.full_name = sanitizeString(data.full_name, 100);
      if (data.company_name) profileUpdate.company_name = sanitizeString(data.company_name, 200);
      if (data.cnpj) profileUpdate.cnpj = sanitizeString(data.cnpj, 20);
      if (data.phone) profileUpdate.phone = sanitizeString(data.phone, 20);
      if (data.tier_level) profileUpdate.tier_level = data.tier_level;
      
      if (data.affiliate_url) {
        const affiliateCode = data.affiliate_url.replace(/^https?:\/\/(www\.)?snapleads\.com\/?/, '').replace(/^\//, '');
        profileUpdate.affiliate_code = sanitizeString(affiliateCode || data.affiliate_url, 255);
      } else if (data.affiliate_code) {
        profileUpdate.affiliate_code = sanitizeString(data.affiliate_code, 255);
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileUpdate)
        .eq("user_id", authData.user.id);

      if (profileError) {
        console.error("Error updating profile:", profileError);
      }

      // Add role if specified
      if (data.role && ["admin", "super_admin", "user"].includes(data.role)) {
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({ user_id: authData.user.id, role: data.role });

        if (roleError) {
          console.error("Error adding role:", roleError);
        }
      }
    }

    console.log("User created successfully:", authData.user?.id);
    return {
      success: true,
      result: {
        action: "user_created",
        user_id: authData.user?.id,
        email: authData.user?.email,
        must_change_password: !data.password,
        role: data.role || null,
      },
    };
  }

  if (action === "update") {
    if (!match?.user_id && !match?.email) {
      return { success: false, error: "Update requires 'match.user_id' or 'match.email' to identify user" };
    }

    let userId = match.user_id as string | undefined;

    if (!userId && match.email) {
      const { data: users, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) return { success: false, error: listError.message };
      // deno-lint-ignore no-explicit-any
      const foundUser = users.users.find((u: any) => u.email === match.email);
      if (!foundUser) return { success: false, error: "User not found with provided email" };
      userId = foundUser.id;
    }

    if (!userId || !isValidUUID(userId)) {
      return { success: false, error: "Invalid user_id format" };
    }

    const authUpdates: { email?: string; password?: string; user_metadata?: Record<string, unknown> } = {};
    
    if (data.email) authUpdates.email = data.email;
    if (data.password) authUpdates.password = data.password;
    if (data.full_name) authUpdates.user_metadata = { full_name: data.full_name };

    if (Object.keys(authUpdates).length > 0) {
      const { error: authError } = await supabase.auth.admin.updateUserById(userId, authUpdates);
      if (authError) return { success: false, error: authError.message };
    }

    const profileUpdate: Record<string, unknown> = {};
    
    if (data.full_name) profileUpdate.full_name = sanitizeString(data.full_name, 100);
    if (data.company_name) profileUpdate.company_name = sanitizeString(data.company_name, 200);
    if (data.cnpj) profileUpdate.cnpj = sanitizeString(data.cnpj, 20);
    if (data.phone) profileUpdate.phone = sanitizeString(data.phone, 20);
    if (data.tier_level) profileUpdate.tier_level = data.tier_level;
    
    if (data.affiliate_url) {
      const affiliateCode = data.affiliate_url.replace(/^https?:\/\/(www\.)?snapleads\.com\/?/, '').replace(/^\//, '');
      profileUpdate.affiliate_code = sanitizeString(affiliateCode || data.affiliate_url, 255);
    } else if (data.affiliate_code) {
      profileUpdate.affiliate_code = sanitizeString(data.affiliate_code, 255);
    }

    if (Object.keys(profileUpdate).length > 0) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileUpdate)
        .eq("user_id", userId);

      if (profileError) {
        console.error("Error updating profile:", profileError);
      }
    }

    // Update role if specified
    if (data.role) {
      // Remove existing roles and add new one
      await supabase.from("user_roles").delete().eq("user_id", userId);
      
      if (["admin", "super_admin", "user"].includes(data.role)) {
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: data.role });

        if (roleError) {
          console.error("Error updating role:", roleError);
        }
      }
    }

    console.log("User updated successfully:", userId);
    return { success: true, result: { action: "user_updated", user_id: userId } };
  }

  return { success: false, error: "Invalid action for users. Must be: insert or update" };
}

// ==========================================
// User Roles Operations
// ==========================================

// deno-lint-ignore no-explicit-any
async function handleUserRolesOperation(
  supabase: any,
  action: string,
  data?: Record<string, unknown>,
  match?: Record<string, unknown>
): Promise<{ success: boolean; result?: unknown; error?: string }> {
  
  if (action === "insert") {
    if (!data?.user_id || !data?.role) {
      return { success: false, error: "user_id and role are required" };
    }

    if (!isValidUUID(String(data.user_id))) {
      return { success: false, error: "Invalid user_id format" };
    }

    const validRoles = ["admin", "super_admin", "user"];
    if (!validRoles.includes(String(data.role))) {
      return { success: false, error: `Invalid role. Must be one of: ${validRoles.join(", ")}` };
    }

    const { data: insertedRole, error } = await supabase
      .from("user_roles")
      .insert({
        user_id: data.user_id,
        role: data.role,
        created_by: data.created_by || null,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    return { success: true, result: { action: "role_added", data: insertedRole } };
  }

  if (action === "delete") {
    if (!match?.user_id) {
      return { success: false, error: "match.user_id is required to delete role" };
    }

    let query = supabase.from("user_roles").delete().eq("user_id", match.user_id);
    
    if (match.role) {
      query = query.eq("role", match.role);
    }

    const { data: deletedRoles, error } = await query.select();
    if (error) return { success: false, error: error.message };

    return { success: true, result: { action: "role_removed", data: deletedRoles, matched: match } };
  }

  return { success: false, error: "Invalid action for user_roles. Must be: insert or delete" };
}

// ==========================================
// Special Actions
// ==========================================

// deno-lint-ignore no-explicit-any
async function handleAdminSummary(supabase: any): Promise<{ success: boolean; result?: unknown; error?: string }> {
  try {
    // Get total affiliates
    const { count: totalAffiliates } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Get active affiliates
    const { count: activeAffiliates } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    // Get leads by status
    const { data: leads } = await supabase.from("leads").select("status, commission");
    const leadsStats = {
      total: leads?.length || 0,
      active: leads?.filter((l: { status: string }) => l.status === "active").length || 0,
      pending: leads?.filter((l: { status: string }) => l.status === "pending").length || 0,
      inactive: leads?.filter((l: { status: string }) => l.status === "inactive").length || 0,
      total_commission: leads?.reduce((sum: number, l: { commission: number }) => sum + (l.commission || 0), 0) || 0,
    };

    // Get payouts by status
    const { data: payouts } = await supabase.from("payouts").select("status, amount");
    const payoutsStats = {
      total: payouts?.length || 0,
      pending: payouts?.filter((p: { status: string }) => p.status === "pending").length || 0,
      processing: payouts?.filter((p: { status: string }) => p.status === "processing").length || 0,
      completed: payouts?.filter((p: { status: string }) => p.status === "completed").length || 0,
      pending_amount: payouts?.filter((p: { status: string }) => p.status === "pending").reduce((sum: number, p: { amount: number }) => sum + (p.amount || 0), 0) || 0,
      total_paid: payouts?.filter((p: { status: string }) => p.status === "completed").reduce((sum: number, p: { amount: number }) => sum + (p.amount || 0), 0) || 0,
    };

    // Get support tickets by status
    const { data: tickets } = await supabase.from("support_tickets").select("status");
    const ticketsStats = {
      total: tickets?.length || 0,
      open: tickets?.filter((t: { status: string }) => t.status === "open").length || 0,
      in_progress: tickets?.filter((t: { status: string }) => t.status === "in_progress").length || 0,
      resolved: tickets?.filter((t: { status: string }) => t.status === "resolved").length || 0,
    };

    // Get affiliates by tier
    const { data: profilesByTier } = await supabase.from("profiles").select("tier_level");
    const tierStats: Record<string, number> = {};
    profilesByTier?.forEach((p: { tier_level: string }) => {
      tierStats[p.tier_level] = (tierStats[p.tier_level] || 0) + 1;
    });

    return {
      success: true,
      result: {
        action: "admin_summary",
        data: {
          affiliates: {
            total: totalAffiliates || 0,
            active: activeAffiliates || 0,
            inactive: (totalAffiliates || 0) - (activeAffiliates || 0),
            by_tier: tierStats,
          },
          leads: leadsStats,
          payouts: payoutsStats,
          support_tickets: ticketsStats,
          generated_at: new Date().toISOString(),
        },
      },
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}

// deno-lint-ignore no-explicit-any
async function handleCalculateTier(
  supabase: any,
  data?: Record<string, unknown>
): Promise<{ success: boolean; result?: unknown; error?: string }> {
  if (!data?.user_id || !isValidUUID(String(data.user_id))) {
    return { success: false, error: "Valid user_id is required" };
  }

  const monthlyRevenue = Number(data.monthly_revenue || 0);

  try {
    // Get the appropriate tier based on revenue
    const { data: tiers, error: tierError } = await supabase
      .from("tiers")
      .select("*")
      .eq("is_active", true)
      .lte("min_revenue", monthlyRevenue)
      .order("min_revenue", { ascending: false })
      .limit(1);

    if (tierError) return { success: false, error: tierError.message };

    const tier = tiers?.[0];
    if (!tier) {
      return { success: false, error: "No tier found for the given revenue" };
    }

    // Check if revenue exceeds max_revenue (if defined)
    if (tier.max_revenue && monthlyRevenue > tier.max_revenue) {
      // Find next tier
      const { data: nextTiers } = await supabase
        .from("tiers")
        .select("*")
        .eq("is_active", true)
        .gt("min_revenue", tier.max_revenue)
        .order("min_revenue", { ascending: true })
        .limit(1);

      if (nextTiers?.[0]) {
        // Use next tier instead
        const nextTier = nextTiers[0];
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ tier_level: nextTier.name })
          .eq("user_id", data.user_id);

        if (updateError) return { success: false, error: updateError.message };

        return {
          success: true,
          result: {
            action: "tier_calculated",
            user_id: data.user_id,
            monthly_revenue: monthlyRevenue,
            tier: nextTier.name,
            commission_percentage: nextTier.commission_percentage,
            bonus_eligible: monthlyRevenue >= nextTier.min_revenue,
            bonus_amount: nextTier.bonus_amount,
          },
        };
      }
    }

    // Update profile with new tier
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ tier_level: tier.name })
      .eq("user_id", data.user_id);

    if (updateError) return { success: false, error: updateError.message };

    return {
      success: true,
      result: {
        action: "tier_calculated",
        user_id: data.user_id,
        monthly_revenue: monthlyRevenue,
        tier: tier.name,
        commission_percentage: tier.commission_percentage,
        bonus_eligible: false,
        bonus_amount: 0,
      },
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}

// deno-lint-ignore no-explicit-any
async function handleCalculateCommission(
  supabase: any,
  data?: Record<string, unknown>
): Promise<{ success: boolean; result?: unknown; error?: string }> {
  if (!data?.user_id || !isValidUUID(String(data.user_id))) {
    return { success: false, error: "Valid user_id is required" };
  }

  if (!data?.reference_month || !/^\d{4}-\d{2}$/.test(String(data.reference_month))) {
    return { success: false, error: "reference_month is required in format YYYY-MM" };
  }

  try {
    const userId = String(data.user_id);
    const referenceMonth = String(data.reference_month);

    // Get user's profile and current tier
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("tier_level")
      .eq("user_id", userId)
      .single();

    if (profileError) return { success: false, error: profileError.message };

    // Get tier details
    const { data: tier, error: tierError } = await supabase
      .from("tiers")
      .select("*")
      .eq("name", profile.tier_level)
      .single();

    if (tierError) return { success: false, error: tierError.message };

    // Get active leads for this month
    const startOfMonth = `${referenceMonth}-01T00:00:00Z`;
    const endOfMonth = new Date(Number(referenceMonth.split("-")[0]), Number(referenceMonth.split("-")[1]), 0);
    const endOfMonthStr = `${referenceMonth}-${String(endOfMonth.getDate()).padStart(2, "0")}T23:59:59Z`;

    const { data: activeLeads, error: leadsError } = await supabase
      .from("leads")
      .select("commission, monthly_value")
      .eq("user_id", userId)
      .eq("status", "active");

    if (leadsError) return { success: false, error: leadsError.message };

    const clientCount = activeLeads?.length || 0;
    const baseRevenue = activeLeads?.reduce((sum: number, l: { monthly_value: number }) => sum + (l.monthly_value || 0), 0) || 0;
    const commissionValue = baseRevenue * (tier.commission_percentage / 100);
    
    // Check if bonus is applicable (first time reaching this tier)
    let bonusValue = 0;
    const { data: previousCommissions } = await supabase
      .from("commission_history")
      .select("tier_name")
      .eq("user_id", userId)
      .eq("tier_name", tier.name)
      .limit(1);

    if (!previousCommissions || previousCommissions.length === 0) {
      bonusValue = tier.bonus_amount;
    }

    const totalValue = commissionValue + bonusValue;

    // Insert commission record
    const { data: commission, error: insertError } = await supabase
      .from("commission_history")
      .insert({
        user_id: userId,
        reference_month: referenceMonth,
        client_count: clientCount,
        base_revenue: baseRevenue,
        tier_name: tier.name,
        commission_rate: tier.commission_percentage,
        commission_value: commissionValue,
        bonus_value: bonusValue,
        total_value: totalValue,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) return { success: false, error: insertError.message };

    return {
      success: true,
      result: {
        action: "commission_calculated",
        data: commission,
      },
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}

// deno-lint-ignore no-explicit-any
async function handleDeactivateUser(
  supabase: any,
  data?: Record<string, unknown>
): Promise<{ success: boolean; result?: unknown; error?: string }> {
  if (!data?.user_id || !isValidUUID(String(data.user_id))) {
    return { success: false, error: "Valid user_id is required" };
  }

  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        is_active: false,
        deactivated_at: new Date().toISOString(),
        deactivated_by: data.deactivated_by || null,
      })
      .eq("user_id", data.user_id);

    if (error) return { success: false, error: error.message };

    return {
      success: true,
      result: {
        action: "user_deactivated",
        user_id: data.user_id,
        reason: data.reason || null,
        deactivated_at: new Date().toISOString(),
      },
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}

// deno-lint-ignore no-explicit-any
async function handleActivateUser(
  supabase: any,
  data?: Record<string, unknown>
): Promise<{ success: boolean; result?: unknown; error?: string }> {
  if (!data?.user_id || !isValidUUID(String(data.user_id))) {
    return { success: false, error: "Valid user_id is required" };
  }

  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        is_active: true,
        deactivated_at: null,
        deactivated_by: null,
      })
      .eq("user_id", data.user_id);

    if (error) return { success: false, error: error.message };

    return {
      success: true,
      result: {
        action: "user_activated",
        user_id: data.user_id,
        activated_at: new Date().toISOString(),
      },
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}

// deno-lint-ignore no-explicit-any
async function handleResetPassword(
  supabase: any,
  data?: Record<string, unknown>
): Promise<{ success: boolean; result?: unknown; error?: string }> {
  if (!data?.user_id || !isValidUUID(String(data.user_id))) {
    return { success: false, error: "Valid user_id is required" };
  }

  try {
    const newPassword = String(data.new_password || DEFAULT_TEMP_PASSWORD);
    
    const { error: authError } = await supabase.auth.admin.updateUserById(
      String(data.user_id),
      { password: newPassword }
    );

    if (authError) return { success: false, error: authError.message };

    // Set must_change_password flag
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ must_change_password: true })
      .eq("user_id", data.user_id);

    if (profileError) {
      console.error("Error updating must_change_password:", profileError);
    }

    return {
      success: true,
      result: {
        action: "password_reset",
        user_id: data.user_id,
        must_change_password: true,
      },
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}

// ==========================================
// Helper Functions
// ==========================================

function getConflictColumn(table: TableName): string {
  switch (table) {
    case "profiles":
      return "user_id";
    case "leads":
      return "id";
    case "payouts":
      return "id";
    case "tiers":
      return "name";
    case "pricing_tiers":
      return "id";
    case "commission_history":
      return "id";
    case "documents":
      return "id";
    case "support_tickets":
      return "id";
    case "support_messages":
      return "id";
    case "user_roles":
      return "id";
    default:
      return "id";
  }
}

function validateTableData(table: TableName, data: Record<string, unknown>): { data?: Record<string, unknown>; error?: string } {
  switch (table) {
    case "profiles": {
      const validated: Record<string, unknown> = {};
      
      if (data.user_id) {
        if (!isValidUUID(String(data.user_id))) return { error: "Invalid user_id format (must be UUID)" };
        validated.user_id = data.user_id;
      }
      if (data.full_name !== undefined) validated.full_name = data.full_name ? sanitizeString(String(data.full_name), 100) : null;
      if (data.avatar_url !== undefined) validated.avatar_url = data.avatar_url ? sanitizeString(String(data.avatar_url), 500) : null;
      if (data.affiliate_code !== undefined) validated.affiliate_code = data.affiliate_code ? sanitizeString(String(data.affiliate_code), 255) : null;
      if (data.must_change_password !== undefined) validated.must_change_password = Boolean(data.must_change_password);
      if (data.company_name !== undefined) validated.company_name = data.company_name ? sanitizeString(String(data.company_name), 200) : null;
      if (data.cnpj !== undefined) validated.cnpj = data.cnpj ? sanitizeString(String(data.cnpj), 20) : null;
      if (data.phone !== undefined) validated.phone = data.phone ? sanitizeString(String(data.phone), 20) : null;
      if (data.tier_level !== undefined) {
        const validTiers = ["silver", "gold", "platinum", "diamond", "titanium", "audaks"];
        if (!validTiers.includes(String(data.tier_level))) {
          return { error: `Invalid tier_level. Must be one of: ${validTiers.join(", ")}` };
        }
        validated.tier_level = data.tier_level;
      }
      if (data.is_active !== undefined) validated.is_active = Boolean(data.is_active);
      
      return { data: validated };
    }

    case "leads": {
      const validated: Record<string, unknown> = {};
      
      if (data.user_id) {
        if (!isValidUUID(String(data.user_id))) return { error: "Invalid user_id format (must be UUID)" };
        validated.user_id = data.user_id;
      }
      if (data.name !== undefined) {
        if (!data.name || String(data.name).trim().length === 0) return { error: "Lead name is required" };
        validated.name = sanitizeString(String(data.name), 100);
      }
      if (data.email !== undefined) {
        if (!isValidEmail(String(data.email))) return { error: "Invalid email format" };
        validated.email = sanitizeString(String(data.email), 255);
      }
      if (data.status !== undefined) {
        const validStatuses = ["pending", "late_payment", "active", "inactive"];
        if (!validStatuses.includes(String(data.status))) {
          return { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` };
        }
        validated.status = data.status;
      }
      if (data.commission !== undefined) {
        const commission = Number(data.commission);
        if (isNaN(commission) || commission < 0) return { error: "Commission must be a positive number" };
        validated.commission = commission;
      }
      if (data.access_count !== undefined) {
        const accessCount = Number(data.access_count);
        if (isNaN(accessCount) || accessCount < 0) return { error: "access_count must be a positive integer" };
        validated.access_count = Math.floor(accessCount);
      }
      if (data.id) {
        if (!isValidUUID(String(data.id))) return { error: "Invalid id format (must be UUID)" };
        validated.id = data.id;
      }
      
      return { data: validated };
    }

    case "payouts": {
      const validated: Record<string, unknown> = {};
      
      if (data.user_id) {
        if (!isValidUUID(String(data.user_id))) return { error: "Invalid user_id format (must be UUID)" };
        validated.user_id = data.user_id;
      }
      if (data.amount !== undefined) {
        const amount = Number(data.amount);
        if (isNaN(amount) || amount <= 0) return { error: "Amount must be a positive number" };
        validated.amount = amount;
      }
      if (data.status !== undefined) {
        const validStatuses = ["pending", "processing", "completed", "failed", "rejected"];
        if (!validStatuses.includes(String(data.status))) {
          return { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` };
        }
        validated.status = data.status;
      }
      if (data.method !== undefined) {
        const validMethods = ["pix", "bank_transfer", "paypal"];
        if (!validMethods.includes(String(data.method))) {
          return { error: `Invalid method. Must be one of: ${validMethods.join(", ")}` };
        }
        validated.method = data.method;
      }
      if (data.completed_at !== undefined) validated.completed_at = data.completed_at;
      if (data.id) {
        if (!isValidUUID(String(data.id))) return { error: "Invalid id format (must be UUID)" };
        validated.id = data.id;
      }
      
      return { data: validated };
    }

    case "tiers": {
      const validated: Record<string, unknown> = {};
      
      if (data.name !== undefined) validated.name = sanitizeString(String(data.name), 50);
      if (data.display_name !== undefined) validated.display_name = sanitizeString(String(data.display_name), 100);
      if (data.min_revenue !== undefined) {
        const minRevenue = Number(data.min_revenue);
        if (isNaN(minRevenue) || minRevenue < 0) return { error: "min_revenue must be a positive number" };
        validated.min_revenue = minRevenue;
      }
      if (data.max_revenue !== undefined) {
        if (data.max_revenue === null) {
          validated.max_revenue = null;
        } else {
          const maxRevenue = Number(data.max_revenue);
          if (isNaN(maxRevenue) || maxRevenue < 0) return { error: "max_revenue must be a positive number or null" };
          validated.max_revenue = maxRevenue;
        }
      }
      if (data.commission_percentage !== undefined) {
        const percentage = Number(data.commission_percentage);
        if (isNaN(percentage) || percentage < 0 || percentage > 100) return { error: "commission_percentage must be between 0 and 100" };
        validated.commission_percentage = percentage;
      }
      if (data.bonus_amount !== undefined) {
        const bonus = Number(data.bonus_amount);
        if (isNaN(bonus) || bonus < 0) return { error: "bonus_amount must be a positive number" };
        validated.bonus_amount = bonus;
      }
      if (data.color !== undefined) validated.color = sanitizeString(String(data.color), 20);
      if (data.icon !== undefined) validated.icon = data.icon ? sanitizeString(String(data.icon), 50) : null;
      if (data.sort_order !== undefined) {
        const sortOrder = Number(data.sort_order);
        if (isNaN(sortOrder)) return { error: "sort_order must be a number" };
        validated.sort_order = Math.floor(sortOrder);
      }
      if (data.is_active !== undefined) validated.is_active = Boolean(data.is_active);
      if (data.id) {
        if (!isValidUUID(String(data.id))) return { error: "Invalid id format (must be UUID)" };
        validated.id = data.id;
      }
      
      return { data: validated };
    }

    case "pricing_tiers": {
      const validated: Record<string, unknown> = {};
      
      if (data.min_access !== undefined) {
        const minAccess = Number(data.min_access);
        if (isNaN(minAccess) || minAccess < 0) return { error: "min_access must be a positive integer" };
        validated.min_access = Math.floor(minAccess);
      }
      if (data.max_access !== undefined) {
        if (data.max_access === null) {
          validated.max_access = null;
        } else {
          const maxAccess = Number(data.max_access);
          if (isNaN(maxAccess) || maxAccess < 0) return { error: "max_access must be a positive integer or null" };
          validated.max_access = Math.floor(maxAccess);
        }
      }
      if (data.monthly_price !== undefined) {
        const price = Number(data.monthly_price);
        if (isNaN(price) || price < 0) return { error: "monthly_price must be a positive number" };
        validated.monthly_price = price;
      }
      if (data.description !== undefined) validated.description = data.description ? sanitizeString(String(data.description), 255) : null;
      if (data.sort_order !== undefined) {
        const sortOrder = Number(data.sort_order);
        if (isNaN(sortOrder)) return { error: "sort_order must be a number" };
        validated.sort_order = Math.floor(sortOrder);
      }
      if (data.is_active !== undefined) validated.is_active = Boolean(data.is_active);
      if (data.id) {
        if (!isValidUUID(String(data.id))) return { error: "Invalid id format (must be UUID)" };
        validated.id = data.id;
      }
      
      return { data: validated };
    }

    case "commission_history": {
      const validated: Record<string, unknown> = {};
      
      if (data.user_id) {
        if (!isValidUUID(String(data.user_id))) return { error: "Invalid user_id format (must be UUID)" };
        validated.user_id = data.user_id;
      }
      if (data.reference_month !== undefined) {
        if (!/^\d{4}-\d{2}$/.test(String(data.reference_month))) return { error: "reference_month must be in format YYYY-MM" };
        validated.reference_month = data.reference_month;
      }
      if (data.client_count !== undefined) {
        const count = Number(data.client_count);
        if (isNaN(count) || count < 0) return { error: "client_count must be a positive integer" };
        validated.client_count = Math.floor(count);
      }
      if (data.base_revenue !== undefined) {
        const revenue = Number(data.base_revenue);
        if (isNaN(revenue) || revenue < 0) return { error: "base_revenue must be a positive number" };
        validated.base_revenue = revenue;
      }
      if (data.tier_name !== undefined) validated.tier_name = sanitizeString(String(data.tier_name), 50);
      if (data.commission_rate !== undefined) {
        const rate = Number(data.commission_rate);
        if (isNaN(rate) || rate < 0 || rate > 100) return { error: "commission_rate must be between 0 and 100" };
        validated.commission_rate = rate;
      }
      if (data.commission_value !== undefined) {
        const value = Number(data.commission_value);
        if (isNaN(value) || value < 0) return { error: "commission_value must be a positive number" };
        validated.commission_value = value;
      }
      if (data.bonus_value !== undefined) {
        const bonus = Number(data.bonus_value);
        if (isNaN(bonus) || bonus < 0) return { error: "bonus_value must be a positive number" };
        validated.bonus_value = bonus;
      }
      if (data.total_value !== undefined) {
        const total = Number(data.total_value);
        if (isNaN(total) || total < 0) return { error: "total_value must be a positive number" };
        validated.total_value = total;
      }
      if (data.status !== undefined) {
        const validStatuses = ["pending", "processing", "completed", "rejected"];
        if (!validStatuses.includes(String(data.status))) {
          return { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` };
        }
        validated.status = data.status;
      }
      if (data.paid_at !== undefined) validated.paid_at = data.paid_at;
      if (data.notes !== undefined) validated.notes = data.notes ? sanitizeString(String(data.notes), 1000) : null;
      if (data.id) {
        if (!isValidUUID(String(data.id))) return { error: "Invalid id format (must be UUID)" };
        validated.id = data.id;
      }
      
      return { data: validated };
    }

    case "documents": {
      const validated: Record<string, unknown> = {};
      
      if (data.user_id) {
        if (!isValidUUID(String(data.user_id))) return { error: "Invalid user_id format (must be UUID)" };
        validated.user_id = data.user_id;
      }
      if (data.name !== undefined) {
        if (!data.name || String(data.name).trim().length === 0) return { error: "Document name is required" };
        validated.name = sanitizeString(String(data.name), 255);
      }
      if (data.file_url !== undefined) {
        if (!data.file_url) return { error: "file_url is required" };
        validated.file_url = sanitizeString(String(data.file_url), 1000);
      }
      if (data.file_type !== undefined) validated.file_type = sanitizeString(String(data.file_type), 20);
      if (data.file_size !== undefined) {
        const size = Number(data.file_size);
        if (isNaN(size) || size < 0) return { error: "file_size must be a positive integer" };
        validated.file_size = Math.floor(size);
      }
      if (data.category !== undefined) {
        const validCategories = ["contract", "report", "invoice", "other"];
        if (!validCategories.includes(String(data.category))) {
          return { error: `Invalid category. Must be one of: ${validCategories.join(", ")}` };
        }
        validated.category = data.category;
      }
      if (data.uploaded_by) {
        if (!isValidUUID(String(data.uploaded_by))) return { error: "Invalid uploaded_by format (must be UUID)" };
        validated.uploaded_by = data.uploaded_by;
      }
      if (data.is_public !== undefined) validated.is_public = Boolean(data.is_public);
      if (data.id) {
        if (!isValidUUID(String(data.id))) return { error: "Invalid id format (must be UUID)" };
        validated.id = data.id;
      }
      
      return { data: validated };
    }

    case "support_tickets": {
      const validated: Record<string, unknown> = {};
      
      if (data.user_id) {
        if (!isValidUUID(String(data.user_id))) return { error: "Invalid user_id format (must be UUID)" };
        validated.user_id = data.user_id;
      }
      if (data.subject !== undefined) {
        if (!data.subject || String(data.subject).trim().length === 0) return { error: "subject is required" };
        validated.subject = sanitizeString(String(data.subject), 255);
      }
      if (data.message !== undefined) validated.message = sanitizeString(String(data.message), 5000);
      if (data.priority !== undefined) {
        const validPriorities = ["low", "medium", "high", "urgent"];
        if (!validPriorities.includes(String(data.priority))) {
          return { error: `Invalid priority. Must be one of: ${validPriorities.join(", ")}` };
        }
        validated.priority = data.priority;
      }
      if (data.status !== undefined) {
        const validStatuses = ["open", "in_progress", "waiting_user", "resolved", "closed"];
        if (!validStatuses.includes(String(data.status))) {
          return { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` };
        }
        validated.status = data.status;
      }
      if (data.category !== undefined) {
        const validCategories = ["billing", "technical", "general", "other"];
        if (!validCategories.includes(String(data.category))) {
          return { error: `Invalid category. Must be one of: ${validCategories.join(", ")}` };
        }
        validated.category = data.category;
      }
      if (data.assigned_to !== undefined) {
        if (data.assigned_to && !isValidUUID(String(data.assigned_to))) {
          return { error: "Invalid assigned_to format (must be UUID)" };
        }
        validated.assigned_to = data.assigned_to || null;
      }
      if (data.resolved_at !== undefined) validated.resolved_at = data.resolved_at;
      if (data.resolution_notes !== undefined) validated.resolution_notes = data.resolution_notes ? sanitizeString(String(data.resolution_notes), 2000) : null;
      if (data.id) {
        if (!isValidUUID(String(data.id))) return { error: "Invalid id format (must be UUID)" };
        validated.id = data.id;
      }
      
      return { data: validated };
    }

    case "support_messages": {
      const validated: Record<string, unknown> = {};
      
      if (data.ticket_id) {
        if (!isValidUUID(String(data.ticket_id))) return { error: "Invalid ticket_id format (must be UUID)" };
        validated.ticket_id = data.ticket_id;
      }
      if (data.user_id) {
        if (!isValidUUID(String(data.user_id))) return { error: "Invalid user_id format (must be UUID)" };
        validated.user_id = data.user_id;
      }
      if (data.message !== undefined) {
        if (!data.message || String(data.message).trim().length === 0) return { error: "message is required" };
        validated.message = sanitizeString(String(data.message), 5000);
      }
      if (data.is_admin_reply !== undefined) validated.is_admin_reply = Boolean(data.is_admin_reply);
      if (data.id) {
        if (!isValidUUID(String(data.id))) return { error: "Invalid id format (must be UUID)" };
        validated.id = data.id;
      }
      
      return { data: validated };
    }

    default:
      return { error: "Unknown table" };
  }
}
