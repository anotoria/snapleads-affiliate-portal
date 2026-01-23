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
  table: "profiles" | "leads" | "payouts" | "users";
  data: Record<string, unknown>;
  match?: Record<string, unknown>;
}

interface UserData {
  email: string;
  password?: string;
  full_name?: string;
  affiliate_code?: string;
}

const DEFAULT_TEMP_PASSWORD = "TempPass123!";

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
        JSON.stringify({ error: "Unauthorized - Invalid webhook secret" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: WebhookPayload = await req.json();
    console.log("Received webhook payload:", JSON.stringify(payload, null, 2));

    if (!payload.action || !payload.table || !payload.data) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: action, table, data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["insert", "update", "upsert"].includes(payload.action)) {
      return new Response(
        JSON.stringify({ error: "Invalid action. Must be: insert, update, or upsert" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["profiles", "leads", "payouts", "users"].includes(payload.table)) {
      return new Response(
        JSON.stringify({ error: "Invalid table. Must be: profiles, leads, payouts, or users" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // deno-lint-ignore no-explicit-any
    const supabase = createClient<any>(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { action, table, data, match } = payload;

    // Handle users table separately (uses Auth Admin API)
    if (table === "users") {
      const userData: UserData = {
        email: String(data.email || ""),
        password: data.password ? String(data.password) : undefined,
        full_name: data.full_name ? String(data.full_name) : undefined,
        affiliate_code: data.affiliate_code ? String(data.affiliate_code) : undefined,
      };
      const result = await handleUserOperation(supabase, action, userData, match);
      return new Response(
        JSON.stringify(result),
        { status: result.success ? 200 : 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate and sanitize data for other tables
    const validatedData = validateTableData(table, data);
    if (validatedData.error) {
      return new Response(
        JSON.stringify({ error: validatedData.error }),
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
            JSON.stringify({ error: "Update action requires 'match' field to identify record" }),
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
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// deno-lint-ignore no-explicit-any
async function handleUserOperation(
  supabase: any,
  action: string,
  data: UserData,
  match?: Record<string, unknown>
): Promise<{ success: boolean; result?: unknown; error?: string }> {
  
  // Validate email
  if (data.email && !isValidEmail(data.email)) {
    return { success: false, error: "Invalid email format" };
  }

  if (action === "insert") {
    // Create user via Auth Admin API
    if (!data.email) {
      return { success: false, error: "Email is required to create a user" };
    }

    const password = data.password || DEFAULT_TEMP_PASSWORD;
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: data.full_name || data.email.split('@')[0],
      },
    });

    if (authError) {
      console.error("Error creating user:", authError);
      return { success: false, error: authError.message };
    }

    // Update profile with must_change_password flag
    if (authData.user) {
      const profileUpdate: Record<string, unknown> = {
        must_change_password: true,
      };
      
      if (data.full_name) {
        profileUpdate.full_name = sanitizeString(data.full_name, 100);
      }
      
      if (data.affiliate_code) {
        profileUpdate.affiliate_code = sanitizeString(data.affiliate_code, 50);
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileUpdate)
        .eq("user_id", authData.user.id);

      if (profileError) {
        console.error("Error updating profile:", profileError);
      }
    }

    console.log("User created successfully:", authData.user?.id);
    return {
      success: true,
      result: {
        action: "user_created",
        user_id: authData.user?.id,
        email: authData.user?.email,
        must_change_password: true,
      },
    };
  }

  if (action === "update") {
    // Update user via Auth Admin API
    if (!match?.user_id && !match?.email) {
      return { success: false, error: "Update requires 'match.user_id' or 'match.email' to identify user" };
    }

    let userId = match.user_id as string | undefined;

    // If matching by email, find the user first
    if (!userId && match.email) {
      const { data: users, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) {
        return { success: false, error: listError.message };
      }
      // deno-lint-ignore no-explicit-any
      const foundUser = users.users.find((u: any) => u.email === match.email);
      if (!foundUser) {
        return { success: false, error: "User not found with provided email" };
      }
      userId = foundUser.id;
    }

    if (!userId || !isValidUUID(userId)) {
      return { success: false, error: "Invalid user_id format" };
    }

    // Update auth user if email or password provided
    const authUpdates: { email?: string; password?: string; user_metadata?: Record<string, unknown> } = {};
    
    if (data.email) {
      authUpdates.email = data.email;
    }
    
    if (data.password) {
      authUpdates.password = data.password;
    }

    if (data.full_name) {
      authUpdates.user_metadata = { full_name: data.full_name };
    }

    if (Object.keys(authUpdates).length > 0) {
      const { error: authError } = await supabase.auth.admin.updateUserById(userId, authUpdates);
      if (authError) {
        return { success: false, error: authError.message };
      }
    }

    // Update profile if needed
    const profileUpdate: Record<string, unknown> = {};
    
    if (data.full_name) {
      profileUpdate.full_name = sanitizeString(data.full_name, 100);
    }
    
    if (data.affiliate_code) {
      profileUpdate.affiliate_code = sanitizeString(data.affiliate_code, 50);
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

    console.log("User updated successfully:", userId);
    return {
      success: true,
      result: {
        action: "user_updated",
        user_id: userId,
      },
    };
  }

  return { success: false, error: "Invalid action for users. Must be: insert or update" };
}

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

      if (data.must_change_password !== undefined) {
        validated.must_change_password = Boolean(data.must_change_password);
      }
      
      return { data: validated };
    }

    case "leads": {
      const validated: Record<string, unknown> = {};
      
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
