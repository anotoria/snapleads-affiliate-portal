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

interface WebhookPayload {
  action: "insert" | "update" | "upsert";
  table: "profiles" | "leads" | "payouts";
  data: Record<string, unknown>;
  match?: Record<string, unknown>; // For updates - which record to match
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate webhook secret
    const webhookSecret = req.headers.get("x-webhook-secret");
    const expectedSecret = Deno.env.get("N8N_WEBHOOK_SECRET");

    if (!webhookSecret || webhookSecret !== expectedSecret) {
      console.error("Invalid webhook secret");
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid webhook secret" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const payload: WebhookPayload = await req.json();
    console.log("Received webhook payload:", JSON.stringify(payload, null, 2));

    // Validate required fields
    if (!payload.action || !payload.table || !payload.data) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: action, table, data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate action
    if (!["insert", "update", "upsert"].includes(payload.action)) {
      return new Response(
        JSON.stringify({ error: "Invalid action. Must be: insert, update, or upsert" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate table
    if (!["profiles", "leads", "payouts"].includes(payload.table)) {
      return new Response(
        JSON.stringify({ error: "Invalid table. Must be: profiles, leads, or payouts" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role for admin operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let result;
    const { action, table, data, match } = payload;

    // Validate and sanitize data based on table
    const validatedData = validateTableData(table, data);
    if (validatedData.error) {
      return new Response(
        JSON.stringify({ error: validatedData.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
            JSON.stringify({ error: "Update action requires 'match' field to identify record" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        let query = supabase.from(table).update(validatedData.data);
        
        // Apply match conditions
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
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getConflictColumn(table: string): string {
  switch (table) {
    case "profiles":
      return "user_id";
    case "leads":
      return "id";
    case "payouts":
      return "id";
    default:
      return "id";
  }
}

function validateTableData(table: string, data: Record<string, unknown>): { data?: Record<string, unknown>; error?: string } {
  switch (table) {
    case "profiles": {
      const validated: Record<string, unknown> = {};
      
      if (data.user_id) {
        if (!isValidUUID(String(data.user_id))) {
          return { error: "Invalid user_id format (must be UUID)" };
        }
        validated.user_id = data.user_id;
      }
      
      if (data.full_name !== undefined) {
        validated.full_name = data.full_name ? sanitizeString(String(data.full_name), 100) : null;
      }
      
      if (data.avatar_url !== undefined) {
        validated.avatar_url = data.avatar_url ? sanitizeString(String(data.avatar_url), 500) : null;
      }
      
      if (data.affiliate_code !== undefined) {
        validated.affiliate_code = data.affiliate_code ? sanitizeString(String(data.affiliate_code), 50) : null;
      }
      
      return { data: validated };
    }

    case "leads": {
      const validated: Record<string, unknown> = {};
      
      // Required fields for insert
      if (data.user_id) {
        if (!isValidUUID(String(data.user_id))) {
          return { error: "Invalid user_id format (must be UUID)" };
        }
        validated.user_id = data.user_id;
      }
      
      if (data.name !== undefined) {
        if (!data.name || String(data.name).trim().length === 0) {
          return { error: "Lead name is required" };
        }
        validated.name = sanitizeString(String(data.name), 100);
      }
      
      if (data.email !== undefined) {
        if (!isValidEmail(String(data.email))) {
          return { error: "Invalid email format" };
        }
        validated.email = sanitizeString(String(data.email), 255);
      }
      
      if (data.status !== undefined) {
        const validStatuses = ["pending", "contacted", "qualified", "converted", "lost"];
        if (!validStatuses.includes(String(data.status))) {
          return { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` };
        }
        validated.status = data.status;
      }
      
      if (data.commission !== undefined) {
        const commission = Number(data.commission);
        if (isNaN(commission) || commission < 0) {
          return { error: "Commission must be a positive number" };
        }
        validated.commission = commission;
      }
      
      if (data.id) {
        if (!isValidUUID(String(data.id))) {
          return { error: "Invalid id format (must be UUID)" };
        }
        validated.id = data.id;
      }
      
      return { data: validated };
    }

    case "payouts": {
      const validated: Record<string, unknown> = {};
      
      if (data.user_id) {
        if (!isValidUUID(String(data.user_id))) {
          return { error: "Invalid user_id format (must be UUID)" };
        }
        validated.user_id = data.user_id;
      }
      
      if (data.amount !== undefined) {
        const amount = Number(data.amount);
        if (isNaN(amount) || amount <= 0) {
          return { error: "Amount must be a positive number" };
        }
        validated.amount = amount;
      }
      
      if (data.status !== undefined) {
        const validStatuses = ["pending", "processing", "completed", "failed"];
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
      
      if (data.completed_at !== undefined) {
        validated.completed_at = data.completed_at;
      }
      
      if (data.id) {
        if (!isValidUUID(String(data.id))) {
          return { error: "Invalid id format (must be UUID)" };
        }
        validated.id = data.id;
      }
      
      return { data: validated };
    }

    default:
      return { error: "Unknown table" };
  }
}
