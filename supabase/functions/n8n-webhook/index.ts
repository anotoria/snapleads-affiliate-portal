import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret, x-webhook-timestamp, x-webhook-signature",
};

// ==========================================
// Validation Helpers
// ==========================================

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Enhanced sanitization - removes HTML tags and script content
const sanitizeString = (str: string, maxLength: number = 255): string => {
  // Remove HTML tags
  let sanitized = str.replace(/<[^>]*>/g, '');
  // Remove script-like content
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  // Remove common XSS patterns
  sanitized = sanitized.replace(/<script[\s\S]*?<\/script>/gi, '');
  sanitized = sanitized.replace(/&lt;script[\s\S]*?&lt;\/script&gt;/gi, '');
  return sanitized.trim().slice(0, maxLength);
};

// CNPJ validation (Brazilian Tax ID - 14 digits)
const isValidCNPJ = (cnpj: string): boolean => {
  // Remove non-numeric characters
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  // Must be exactly 14 digits
  if (cleanCNPJ.length !== 14) return false;
  // Check for repeated digits (invalid CNPJs)
  if (/^(\d)\1+$/.test(cleanCNPJ)) return false;
  return true;
};

// Phone number validation (allows various formats, requires min 10 digits)
const isValidPhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 15;
};

// URL validation (must be https or valid storage URL)
const isValidURL = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    // Only allow https URLs or Supabase storage URLs
    const allowedSchemes = ['https:', 'http:'];
    return allowedSchemes.includes(parsed.protocol);
  } catch {
    return false;
  }
};

// Secure URL validation for file storage (only allow known domains)
const isValidStorageURL = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    const allowedDomains = [
      'supabase.co',
      'supabase.com',
      'storage.googleapis.com',
    ];
    return allowedDomains.some(domain => parsed.hostname.endsWith(domain)) || 
           parsed.hostname === 'localhost';
  } catch {
    return false;
  }
};

// Reference month validation (YYYY-MM format with valid date)
const isValidReferenceMonth = (month: string): boolean => {
  if (!/^\d{4}-\d{2}$/.test(month)) return false;
  const [year, monthNum] = month.split('-').map(Number);
  return year >= 2000 && year <= 2100 && monthNum >= 1 && monthNum <= 12;
};

// HMAC signature verification for enhanced security
async function verifyHMACSignature(
  payload: string,
  signature: string,
  timestamp: string,
  secret: string
): Promise<boolean> {
  try {
    // Check timestamp to prevent replay attacks (5 minute window)
    const requestTime = parseInt(timestamp, 10);
    const currentTime = Math.floor(Date.now() / 1000);
    if (Math.abs(currentTime - requestTime) > 300) {
      console.warn("Request timestamp outside acceptable window");
      return false;
    }

    // Compute expected signature
    const signaturePayload = `${timestamp}.${payload}`;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(signaturePayload);

    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign("HMAC", key, messageData);
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return signature === expectedSignature;
  } catch (error) {
    console.error("HMAC verification error:", error);
    return false;
  }
}

// Audit logging for sensitive operations
interface AuditLogEntry {
  timestamp: string;
  action: string;
  table?: string;
  sourceIP?: string;
  userAgent?: string;
  success: boolean;
  details?: Record<string, unknown>;
}

function logAudit(entry: AuditLogEntry): void {
  console.log("[AUDIT]", JSON.stringify({
    ...entry,
    timestamp: new Date().toISOString(),
  }));
}

// Types
type TableName = "profiles" | "leads" | "payouts" | "users" | "user_roles" | "tiers" | "pricing_tiers" | "commission_history" | "documents" | "support_tickets" | "support_messages" | "learning_tracks" | "learning_modules" | "learning_contents" | "media_categories" | "media_items";
type ActionType = "insert" | "update" | "upsert" | "get" | "delete" | "calculate_tier" | "calculate_commission" | "deactivate_user" | "activate_user" | "reset_password" | "get_admin_summary";

// Sensitive actions that require enhanced logging
const SENSITIVE_ACTIONS: ActionType[] = [
  "insert", "update", "delete", 
  "deactivate_user", "activate_user", "reset_password",
  "calculate_commission"
];

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
  "documents", "support_tickets", "support_messages",
  "learning_tracks", "learning_modules", "learning_contents",
  "media_categories", "media_items"
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

  const sourceIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";

  try {
    const webhookSecret = req.headers.get("x-webhook-secret");
    const expectedSecret = Deno.env.get("N8N_WEBHOOK_SECRET");

    if (!webhookSecret || webhookSecret !== expectedSecret) {
      logAudit({
        timestamp: new Date().toISOString(),
        action: "auth_failure",
        sourceIP,
        userAgent,
        success: false,
        details: { reason: "Invalid webhook secret" }
      });
      console.error("Invalid webhook secret");
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized - Invalid webhook secret" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get raw payload for HMAC verification
    const rawPayload = await req.text();
    const payload: WebhookPayload = JSON.parse(rawPayload);

    // Optional HMAC verification for enhanced security
    // If signature headers are present, verify them
    const hmacSignature = req.headers.get("x-webhook-signature");
    const hmacTimestamp = req.headers.get("x-webhook-timestamp");
    const hmacSecret = Deno.env.get("N8N_WEBHOOK_HMAC_SECRET");

    if (hmacSignature && hmacTimestamp && hmacSecret) {
      const isValidSignature = await verifyHMACSignature(
        rawPayload,
        hmacSignature,
        hmacTimestamp,
        hmacSecret
      );

      if (!isValidSignature) {
        logAudit({
          timestamp: new Date().toISOString(),
          action: "hmac_verification_failure",
          sourceIP,
          userAgent,
          success: false,
          details: { reason: "Invalid HMAC signature" }
        });
        console.error("Invalid HMAC signature");
        return new Response(
          JSON.stringify({ success: false, error: "Unauthorized - Invalid request signature" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

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

    // Log sensitive actions
    if (SENSITIVE_ACTIONS.includes(action)) {
      logAudit({
        timestamp: new Date().toISOString(),
        action,
        table,
        sourceIP,
        userAgent,
        success: true,
        details: { 
          hasData: !!data, 
          hasMatch: !!match,
          targetUserId: data?.user_id || match?.user_id || null
        }
      });
    }

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

        // Validate match parameters
        const matchValidation = validateMatchParameters(match);
        if (matchValidation.error) {
          return new Response(
            JSON.stringify({ success: false, error: matchValidation.error }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        let query = supabase.from(table).update(validatedData.data);
        
        for (const [key, value] of Object.entries(matchValidation.validated!)) {
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
    logAudit({
      timestamp: new Date().toISOString(),
      action: "error",
      sourceIP,
      userAgent,
      success: false,
      details: { error: errorMessage }
    });
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ==========================================
// Match Parameter Validation
// ==========================================

function validateMatchParameters(match: Record<string, unknown>): { validated?: Record<string, unknown>; error?: string } {
  const validated: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(match)) {
    // Only allow specific keys for matching
    const allowedKeys = ['id', 'user_id', 'email', 'ticket_id', 'role'];
    if (!allowedKeys.includes(key)) {
      return { error: `Invalid match key: ${key}. Allowed keys: ${allowedKeys.join(', ')}` };
    }
    
    // Validate UUID fields
    if (['id', 'user_id', 'ticket_id'].includes(key)) {
      if (typeof value !== 'string' || !isValidUUID(value)) {
        return { error: `Invalid ${key} format: must be a valid UUID` };
      }
    }
    
    // Validate email
    if (key === 'email') {
      if (typeof value !== 'string' || !isValidEmail(value)) {
        return { error: `Invalid email format` };
      }
    }
    
    // Validate role
    if (key === 'role') {
      const validRoles = ['admin', 'super_admin', 'user'];
      if (typeof value !== 'string' || !validRoles.includes(value)) {
        return { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` };
      }
    }
    
    validated[key] = value;
  }
  
  return { validated };
}

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
  // Support Materials filters
  track_id?: string;
  module_id?: string;
  category_id?: string;
  type?: string;
  media_type?: string;
  is_featured?: boolean;
}

// deno-lint-ignore no-explicit-any
async function handleGetOperation(
  supabase: any,
  table: TableName,
  filters?: GetFilters
): Promise<{ success: boolean; result?: unknown; error?: string }> {
  const limit = Math.min(Math.max(filters?.limit || 100, 1), 1000); // Clamp between 1 and 1000
  const offset = Math.max(filters?.offset || 0, 0);

  // Validate filter values
  if (filters?.user_id && !isValidUUID(filters.user_id)) {
    return { success: false, error: "Invalid user_id filter format" };
  }
  if (filters?.ticket_id && !isValidUUID(filters.ticket_id)) {
    return { success: false, error: "Invalid ticket_id filter format" };
  }
  if (filters?.reference_month && !isValidReferenceMonth(filters.reference_month)) {
    return { success: false, error: "Invalid reference_month format (must be YYYY-MM)" };
  }
  if (filters?.track_id && !isValidUUID(filters.track_id)) {
    return { success: false, error: "Invalid track_id filter format" };
  }
  if (filters?.module_id && !isValidUUID(filters.module_id)) {
    return { success: false, error: "Invalid module_id filter format" };
  }
  if (filters?.category_id && !isValidUUID(filters.category_id)) {
    return { success: false, error: "Invalid category_id filter format" };
  }

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

      // ==========================================
      // Support Materials - Learning Tracks
      // ==========================================
      case "learning_tracks": {
        let query = supabase
          .from("learning_tracks")
          .select("*")
          .order("sort_order", { ascending: true })
          .range(offset, offset + limit - 1);

        if (filters?.is_active !== undefined) query = query.eq("is_active", filters.is_active);
        if (filters?.is_featured !== undefined) query = query.eq("is_featured", filters.is_featured);
        if (filters?.created_after) query = query.gte("created_at", filters.created_after);
        if (filters?.created_before) query = query.lte("created_at", filters.created_before);

        const { data: tracks, error } = await query;
        if (error) return { success: false, error: error.message };

        return { success: true, result: { action: "get", table: "learning_tracks", data: tracks, count: tracks.length, filters: filters || {} } };
      }

      case "learning_modules": {
        let query = supabase
          .from("learning_modules")
          .select("*")
          .order("sort_order", { ascending: true })
          .range(offset, offset + limit - 1);

        if (filters?.track_id) query = query.eq("track_id", filters.track_id);
        if (filters?.is_active !== undefined) query = query.eq("is_active", filters.is_active);
        if (filters?.created_after) query = query.gte("created_at", filters.created_after);
        if (filters?.created_before) query = query.lte("created_at", filters.created_before);

        const { data: modules, error } = await query;
        if (error) return { success: false, error: error.message };

        return { success: true, result: { action: "get", table: "learning_modules", data: modules, count: modules.length, filters: filters || {} } };
      }

      case "learning_contents": {
        let query = supabase
          .from("learning_contents")
          .select("*")
          .order("sort_order", { ascending: true })
          .range(offset, offset + limit - 1);

        if (filters?.module_id) query = query.eq("module_id", filters.module_id);
        if (filters?.is_active !== undefined) query = query.eq("is_active", filters.is_active);
        if (filters?.created_after) query = query.gte("created_at", filters.created_after);
        if (filters?.created_before) query = query.lte("created_at", filters.created_before);

        const { data: contents, error } = await query;
        if (error) return { success: false, error: error.message };

        return { success: true, result: { action: "get", table: "learning_contents", data: contents, count: contents.length, filters: filters || {} } };
      }

      // ==========================================
      // Support Materials - Media Library
      // ==========================================
      case "media_categories": {
        let query = supabase
          .from("media_categories")
          .select("*")
          .order("sort_order", { ascending: true })
          .range(offset, offset + limit - 1);

        if (filters?.type) query = query.eq("type", filters.type);
        if (filters?.is_active !== undefined) query = query.eq("is_active", filters.is_active);
        if (filters?.created_after) query = query.gte("created_at", filters.created_after);
        if (filters?.created_before) query = query.lte("created_at", filters.created_before);

        const { data: categories, error } = await query;
        if (error) return { success: false, error: error.message };

        return { success: true, result: { action: "get", table: "media_categories", data: categories, count: categories.length, filters: filters || {} } };
      }

      case "media_items": {
        let query = supabase
          .from("media_items")
          .select("*")
          .order("sort_order", { ascending: true })
          .range(offset, offset + limit - 1);

        if (filters?.category_id) query = query.eq("category_id", filters.category_id);
        if (filters?.media_type) query = query.eq("media_type", filters.media_type);
        if (filters?.is_active !== undefined) query = query.eq("is_active", filters.is_active);
        if (filters?.created_after) query = query.gte("created_at", filters.created_after);
        if (filters?.created_before) query = query.lte("created_at", filters.created_before);

        const { data: items, error } = await query;
        if (error) return { success: false, error: error.message };

        return { success: true, result: { action: "get", table: "media_items", data: items, count: items.length, filters: filters || {} } };
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

  // Validate match parameters
  const matchValidation = validateMatchParameters(match);
  if (matchValidation.error) {
    return { success: false, error: matchValidation.error };
  }

  // Only allow delete on certain tables
  const deletableTables: TableName[] = [
    "documents", "support_tickets", "support_messages", "user_roles",
    "learning_tracks", "learning_modules", "learning_contents",
    "media_categories", "media_items"
  ];
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
    
    for (const [key, value] of Object.entries(matchValidation.validated!)) {
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

  // Validate CNPJ if provided
  if (data.cnpj && !isValidCNPJ(data.cnpj)) {
    return { success: false, error: "Invalid CNPJ format (must be 14 digits)" };
  }

  // Validate phone if provided
  if (data.phone && !isValidPhone(data.phone)) {
    return { success: false, error: "Invalid phone format (must be 10-15 digits)" };
  }

  // Validate affiliate_url if provided
  if (data.affiliate_url && !isValidURL(data.affiliate_url)) {
    return { success: false, error: "Invalid affiliate_url format (must be a valid URL)" };
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
      if (data.cnpj) profileUpdate.cnpj = data.cnpj.replace(/\D/g, ''); // Store only digits
      if (data.phone) profileUpdate.phone = data.phone.replace(/\D/g, ''); // Store only digits
      if (data.tier_level) profileUpdate.tier_level = data.tier_level;
      
      if (data.affiliate_url) {
        try {
          const url = new URL(data.affiliate_url);
          const affiliateCode = url.pathname.replace(/^\//, '') || url.searchParams.get('ref') || data.affiliate_url;
          profileUpdate.affiliate_code = sanitizeString(affiliateCode, 255);
        } catch {
          profileUpdate.affiliate_code = sanitizeString(data.affiliate_url, 255);
        }
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
    if (data.cnpj) profileUpdate.cnpj = data.cnpj.replace(/\D/g, '');
    if (data.phone) profileUpdate.phone = data.phone.replace(/\D/g, '');
    if (data.tier_level) profileUpdate.tier_level = data.tier_level;
    
    if (data.affiliate_url) {
      try {
        const url = new URL(data.affiliate_url);
        const affiliateCode = url.pathname.replace(/^\//, '') || url.searchParams.get('ref') || data.affiliate_url;
        profileUpdate.affiliate_code = sanitizeString(affiliateCode, 255);
      } catch {
        profileUpdate.affiliate_code = sanitizeString(data.affiliate_url, 255);
      }
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

    if (!isValidUUID(String(match.user_id))) {
      return { success: false, error: "Invalid user_id format" };
    }

    let query = supabase.from("user_roles").delete().eq("user_id", match.user_id);
    
    if (match.role) {
      const validRoles = ["admin", "super_admin", "user"];
      if (!validRoles.includes(String(match.role))) {
        return { success: false, error: `Invalid role. Must be one of: ${validRoles.join(", ")}` };
      }
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

    // Get commission history summary
    const { data: commissions } = await supabase.from("commission_history").select("status, total_value");
    const commissionStats = {
      total: commissions?.length || 0,
      pending: commissions?.filter((c: { status: string }) => c.status === "pending").length || 0,
      pending_value: commissions?.filter((c: { status: string }) => c.status === "pending").reduce((sum: number, c: { total_value: number }) => sum + (c.total_value || 0), 0) || 0,
      paid_value: commissions?.filter((c: { status: string }) => c.status === "completed").reduce((sum: number, c: { total_value: number }) => sum + (c.total_value || 0), 0) || 0,
    };

    return {
      success: true,
      result: {
        action: "admin_summary",
        affiliates: {
          total: totalAffiliates || 0,
          active: activeAffiliates || 0,
          inactive: (totalAffiliates || 0) - (activeAffiliates || 0),
        },
        leads: leadsStats,
        payouts: payoutsStats,
        tickets: ticketsStats,
        commissions: commissionStats,
        generated_at: new Date().toISOString(),
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

  try {
    // Get user's active leads to calculate monthly revenue
    const { data: leads, error: leadsError } = await supabase
      .from("leads")
      .select("monthly_value")
      .eq("user_id", data.user_id)
      .eq("status", "active");

    if (leadsError) return { success: false, error: leadsError.message };

    const monthlyRevenue = leads?.reduce((sum: number, lead: { monthly_value: number }) => sum + (lead.monthly_value || 0), 0) || 0;

    // Get all active tiers ordered by min_revenue
    const { data: tiers, error: tiersError } = await supabase
      .from("tiers")
      .select("*")
      .eq("is_active", true)
      .order("min_revenue", { ascending: true });

    if (tiersError) return { success: false, error: tiersError.message };

    // Find the appropriate tier
    let tier = tiers[0];
    for (const t of tiers) {
      if (monthlyRevenue >= t.min_revenue) {
        tier = t;
      } else {
        break;
      }
    }

    // Find next tier for progression info
    const currentTierIndex = tiers.findIndex((t: { name: string }) => t.name === tier.name);
    const nextTier = currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null;

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
        bonus_eligible: nextTier ? monthlyRevenue >= nextTier.min_revenue : false,
        bonus_amount: tier.bonus_amount,
        next_tier: nextTier ? {
          name: nextTier.name,
          min_revenue: nextTier.min_revenue,
          progress: nextTier.min_revenue > 0 ? (monthlyRevenue / nextTier.min_revenue) * 100 : 100
        } : null,
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

  if (!data?.reference_month || !isValidReferenceMonth(String(data.reference_month))) {
    return { success: false, error: "reference_month is required in format YYYY-MM (valid month 01-12)" };
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

    // Get active leads for this user
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

  // Validate deactivated_by if provided
  if (data.deactivated_by && !isValidUUID(String(data.deactivated_by))) {
    return { success: false, error: "Invalid deactivated_by format (must be UUID)" };
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
        reason: data.reason ? sanitizeString(String(data.reason), 500) : null,
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
    case "learning_tracks":
      return "id";
    case "learning_modules":
      return "id";
    case "learning_contents":
      return "id";
    case "media_categories":
      return "name";
    case "media_items":
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
      if (data.avatar_url !== undefined) {
        if (data.avatar_url && !isValidURL(String(data.avatar_url))) {
          return { error: "Invalid avatar_url format (must be valid URL)" };
        }
        validated.avatar_url = data.avatar_url ? sanitizeString(String(data.avatar_url), 500) : null;
      }
      if (data.affiliate_code !== undefined) validated.affiliate_code = data.affiliate_code ? sanitizeString(String(data.affiliate_code), 255) : null;
      if (data.must_change_password !== undefined) validated.must_change_password = Boolean(data.must_change_password);
      if (data.company_name !== undefined) validated.company_name = data.company_name ? sanitizeString(String(data.company_name), 200) : null;
      if (data.cnpj !== undefined) {
        if (data.cnpj && !isValidCNPJ(String(data.cnpj))) {
          return { error: "Invalid CNPJ format (must be 14 digits)" };
        }
        validated.cnpj = data.cnpj ? String(data.cnpj).replace(/\D/g, '') : null;
      }
      if (data.phone !== undefined) {
        if (data.phone && !isValidPhone(String(data.phone))) {
          return { error: "Invalid phone format (must be 10-15 digits)" };
        }
        validated.phone = data.phone ? String(data.phone).replace(/\D/g, '') : null;
      }
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
        if (isNaN(commission) || commission < 0) return { error: "Commission must be a non-negative number" };
        validated.commission = commission;
      }
      if (data.access_count !== undefined) {
        const accessCount = Number(data.access_count);
        if (isNaN(accessCount) || accessCount < 0) return { error: "access_count must be a non-negative integer" };
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
        if (isNaN(minRevenue) || minRevenue < 0) return { error: "min_revenue must be a non-negative number" };
        validated.min_revenue = minRevenue;
      }
      if (data.max_revenue !== undefined) {
        if (data.max_revenue === null) {
          validated.max_revenue = null;
        } else {
          const maxRevenue = Number(data.max_revenue);
          if (isNaN(maxRevenue) || maxRevenue < 0) return { error: "max_revenue must be a non-negative number or null" };
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
        if (isNaN(bonus) || bonus < 0) return { error: "bonus_amount must be a non-negative number" };
        validated.bonus_amount = bonus;
      }
      if (data.color !== undefined) validated.color = sanitizeString(String(data.color), 20);
      if (data.icon !== undefined) validated.icon = data.icon ? sanitizeString(String(data.icon), 50) : null;
      if (data.sort_order !== undefined) {
        const sortOrder = Number(data.sort_order);
        if (isNaN(sortOrder) || sortOrder < 0) return { error: "sort_order must be a non-negative integer" };
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
        if (isNaN(minAccess) || minAccess < 0) return { error: "min_access must be a non-negative integer" };
        validated.min_access = Math.floor(minAccess);
      }
      if (data.max_access !== undefined) {
        if (data.max_access === null) {
          validated.max_access = null;
        } else {
          const maxAccess = Number(data.max_access);
          if (isNaN(maxAccess) || maxAccess < 0) return { error: "max_access must be a non-negative integer or null" };
          validated.max_access = Math.floor(maxAccess);
        }
      }
      if (data.monthly_price !== undefined) {
        const price = Number(data.monthly_price);
        if (isNaN(price) || price < 0) return { error: "monthly_price must be a non-negative number" };
        validated.monthly_price = price;
      }
      if (data.description !== undefined) validated.description = data.description ? sanitizeString(String(data.description), 255) : null;
      if (data.sort_order !== undefined) {
        const sortOrder = Number(data.sort_order);
        if (isNaN(sortOrder) || sortOrder < 0) return { error: "sort_order must be a non-negative integer" };
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
        if (!isValidReferenceMonth(String(data.reference_month))) {
          return { error: "reference_month must be in format YYYY-MM (valid month 01-12)" };
        }
        validated.reference_month = data.reference_month;
      }
      if (data.client_count !== undefined) {
        const count = Number(data.client_count);
        if (isNaN(count) || count < 0) return { error: "client_count must be a non-negative integer" };
        validated.client_count = Math.floor(count);
      }
      if (data.base_revenue !== undefined) {
        const revenue = Number(data.base_revenue);
        if (isNaN(revenue) || revenue < 0) return { error: "base_revenue must be a non-negative number" };
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
        if (isNaN(value) || value < 0) return { error: "commission_value must be a non-negative number" };
        validated.commission_value = value;
      }
      if (data.bonus_value !== undefined) {
        const bonus = Number(data.bonus_value);
        if (isNaN(bonus) || bonus < 0) return { error: "bonus_value must be a non-negative number" };
        validated.bonus_value = bonus;
      }
      if (data.total_value !== undefined) {
        const total = Number(data.total_value);
        if (isNaN(total) || total < 0) return { error: "total_value must be a non-negative number" };
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
        const urlStr = String(data.file_url);
        if (!isValidURL(urlStr)) {
          return { error: "Invalid file_url format (must be valid URL)" };
        }
        validated.file_url = sanitizeString(urlStr, 1000);
      }
      if (data.file_type !== undefined) validated.file_type = sanitizeString(String(data.file_type), 20);
      if (data.file_size !== undefined) {
        const size = Number(data.file_size);
        if (isNaN(size) || size < 0) return { error: "file_size must be a non-negative integer" };
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

    // ==========================================
    // Support Materials - Learning Tracks
    // ==========================================
    case "learning_tracks": {
      const validated: Record<string, unknown> = {};
      
      if (data.title !== undefined) {
        if (!data.title || String(data.title).trim().length === 0) return { error: "title is required" };
        validated.title = sanitizeString(String(data.title), 255);
      }
      if (data.description !== undefined) validated.description = data.description ? sanitizeString(String(data.description), 5000) : null;
      if (data.cover_url !== undefined) {
        if (data.cover_url && !isValidURL(String(data.cover_url))) {
          return { error: "Invalid cover_url format (must be valid URL)" };
        }
        validated.cover_url = data.cover_url ? sanitizeString(String(data.cover_url), 1000) : null;
      }
      if (data.is_active !== undefined) validated.is_active = Boolean(data.is_active);
      if (data.is_featured !== undefined) validated.is_featured = Boolean(data.is_featured);
      if (data.sort_order !== undefined) {
        const sortOrder = Number(data.sort_order);
        if (isNaN(sortOrder) || sortOrder < 0) return { error: "sort_order must be a non-negative integer" };
        validated.sort_order = Math.floor(sortOrder);
      }
      if (data.created_by !== undefined) {
        if (data.created_by && !isValidUUID(String(data.created_by))) {
          return { error: "Invalid created_by format (must be UUID)" };
        }
        validated.created_by = data.created_by || null;
      }
      if (data.id) {
        if (!isValidUUID(String(data.id))) return { error: "Invalid id format (must be UUID)" };
        validated.id = data.id;
      }
      
      return { data: validated };
    }

    case "learning_modules": {
      const validated: Record<string, unknown> = {};
      
      if (data.track_id !== undefined) {
        if (!data.track_id || !isValidUUID(String(data.track_id))) return { error: "track_id is required and must be a valid UUID" };
        validated.track_id = data.track_id;
      }
      if (data.title !== undefined) {
        if (!data.title || String(data.title).trim().length === 0) return { error: "title is required" };
        validated.title = sanitizeString(String(data.title), 255);
      }
      if (data.description !== undefined) validated.description = data.description ? sanitizeString(String(data.description), 2000) : null;
      if (data.is_active !== undefined) validated.is_active = Boolean(data.is_active);
      if (data.sort_order !== undefined) {
        const sortOrder = Number(data.sort_order);
        if (isNaN(sortOrder) || sortOrder < 0) return { error: "sort_order must be a non-negative integer" };
        validated.sort_order = Math.floor(sortOrder);
      }
      if (data.id) {
        if (!isValidUUID(String(data.id))) return { error: "Invalid id format (must be UUID)" };
        validated.id = data.id;
      }
      
      return { data: validated };
    }

    case "learning_contents": {
      const validated: Record<string, unknown> = {};
      
      if (data.module_id !== undefined) {
        if (!data.module_id || !isValidUUID(String(data.module_id))) return { error: "module_id is required and must be a valid UUID" };
        validated.module_id = data.module_id;
      }
      if (data.title !== undefined) {
        if (!data.title || String(data.title).trim().length === 0) return { error: "title is required" };
        validated.title = sanitizeString(String(data.title), 255);
      }
      if (data.description !== undefined) validated.description = data.description ? sanitizeString(String(data.description), 2000) : null;
      if (data.content_type !== undefined) {
        const validTypes = ["video", "text"];
        if (!validTypes.includes(String(data.content_type))) {
          return { error: `Invalid content_type. Must be one of: ${validTypes.join(", ")}` };
        }
        validated.content_type = data.content_type;
      }
      if (data.video_url !== undefined) {
        if (data.video_url && !isValidURL(String(data.video_url))) {
          return { error: "Invalid video_url format (must be valid URL)" };
        }
        validated.video_url = data.video_url ? sanitizeString(String(data.video_url), 1000) : null;
      }
      if (data.text_content !== undefined) validated.text_content = data.text_content ? sanitizeString(String(data.text_content), 50000) : null;
      if (data.duration_minutes !== undefined) {
        const duration = Number(data.duration_minutes);
        if (isNaN(duration) || duration < 0) return { error: "duration_minutes must be a non-negative integer" };
        validated.duration_minutes = Math.floor(duration);
      }
      if (data.is_active !== undefined) validated.is_active = Boolean(data.is_active);
      if (data.sort_order !== undefined) {
        const sortOrder = Number(data.sort_order);
        if (isNaN(sortOrder) || sortOrder < 0) return { error: "sort_order must be a non-negative integer" };
        validated.sort_order = Math.floor(sortOrder);
      }
      if (data.id) {
        if (!isValidUUID(String(data.id))) return { error: "Invalid id format (must be UUID)" };
        validated.id = data.id;
      }
      
      return { data: validated };
    }

    // ==========================================
    // Support Materials - Media Library
    // ==========================================
    case "media_categories": {
      const validated: Record<string, unknown> = {};
      
      if (data.name !== undefined) {
        if (!data.name || String(data.name).trim().length === 0) return { error: "name is required" };
        validated.name = sanitizeString(String(data.name), 100);
      }
      if (data.display_name !== undefined) {
        if (!data.display_name || String(data.display_name).trim().length === 0) return { error: "display_name is required" };
        validated.display_name = sanitizeString(String(data.display_name), 255);
      }
      if (data.type !== undefined) {
        const validTypes = ["photo", "video", "file"];
        if (!validTypes.includes(String(data.type))) {
          return { error: `Invalid type. Must be one of: ${validTypes.join(", ")}` };
        }
        validated.type = data.type;
      }
      if (data.description !== undefined) validated.description = data.description ? sanitizeString(String(data.description), 1000) : null;
      if (data.cover_url !== undefined) {
        if (data.cover_url && !isValidURL(String(data.cover_url))) {
          return { error: "Invalid cover_url format (must be valid URL)" };
        }
        validated.cover_url = data.cover_url ? sanitizeString(String(data.cover_url), 1000) : null;
      }
      if (data.is_active !== undefined) validated.is_active = Boolean(data.is_active);
      if (data.sort_order !== undefined) {
        const sortOrder = Number(data.sort_order);
        if (isNaN(sortOrder) || sortOrder < 0) return { error: "sort_order must be a non-negative integer" };
        validated.sort_order = Math.floor(sortOrder);
      }
      if (data.id) {
        if (!isValidUUID(String(data.id))) return { error: "Invalid id format (must be UUID)" };
        validated.id = data.id;
      }
      
      return { data: validated };
    }

    case "media_items": {
      const validated: Record<string, unknown> = {};
      
      if (data.category_id !== undefined) {
        if (!data.category_id || !isValidUUID(String(data.category_id))) return { error: "category_id is required and must be a valid UUID" };
        validated.category_id = data.category_id;
      }
      if (data.title !== undefined) {
        if (!data.title || String(data.title).trim().length === 0) return { error: "title is required" };
        validated.title = sanitizeString(String(data.title), 255);
      }
      if (data.description !== undefined) validated.description = data.description ? sanitizeString(String(data.description), 1000) : null;
      if (data.file_url !== undefined) {
        if (!data.file_url) return { error: "file_url is required" };
        const urlStr = String(data.file_url);
        if (!isValidURL(urlStr)) {
          return { error: "Invalid file_url format (must be valid URL)" };
        }
        validated.file_url = sanitizeString(urlStr, 1000);
      }
      if (data.thumbnail_url !== undefined) {
        if (data.thumbnail_url && !isValidURL(String(data.thumbnail_url))) {
          return { error: "Invalid thumbnail_url format (must be valid URL)" };
        }
        validated.thumbnail_url = data.thumbnail_url ? sanitizeString(String(data.thumbnail_url), 1000) : null;
      }
      if (data.file_type !== undefined) {
        if (!data.file_type) return { error: "file_type is required" };
        validated.file_type = sanitizeString(String(data.file_type), 20);
      }
      if (data.file_size !== undefined) {
        const size = Number(data.file_size);
        if (isNaN(size) || size < 0) return { error: "file_size must be a non-negative integer" };
        validated.file_size = Math.floor(size);
      }
      if (data.media_type !== undefined) {
        const validTypes = ["photo", "video", "file"];
        if (!validTypes.includes(String(data.media_type))) {
          return { error: `Invalid media_type. Must be one of: ${validTypes.join(", ")}` };
        }
        validated.media_type = data.media_type;
      }
      if (data.dimensions !== undefined) {
        if (data.dimensions && typeof data.dimensions === 'object') {
          validated.dimensions = data.dimensions;
        } else {
          validated.dimensions = null;
        }
      }
      if (data.duration_seconds !== undefined) {
        const duration = Number(data.duration_seconds);
        if (isNaN(duration) || duration < 0) return { error: "duration_seconds must be a non-negative integer" };
        validated.duration_seconds = Math.floor(duration);
      }
      if (data.is_active !== undefined) validated.is_active = Boolean(data.is_active);
      if (data.sort_order !== undefined) {
        const sortOrder = Number(data.sort_order);
        if (isNaN(sortOrder) || sortOrder < 0) return { error: "sort_order must be a non-negative integer" };
        validated.sort_order = Math.floor(sortOrder);
      }
      if (data.created_by !== undefined) {
        if (data.created_by && !isValidUUID(String(data.created_by))) {
          return { error: "Invalid created_by format (must be UUID)" };
        }
        validated.created_by = data.created_by || null;
      }
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
