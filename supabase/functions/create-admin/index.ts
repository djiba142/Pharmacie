import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { email, password, firstName, lastName, role } = await req.json();

    // Verify caller is admin
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const callerClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!);
      const { data: { user: caller } } = await callerClient.auth.getUser(authHeader.replace('Bearer ', ''));
      if (caller) {
        const { data: isAdmin } = await supabase.rpc('is_admin', { _user_id: caller.id });
        if (!isAdmin) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // Create user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName },
    });

    if (authError) throw authError;
    const userId = authData.user.id;

    // Assign role
    const { error: roleError } = await supabase.from('user_roles').insert({ user_id: userId, role });
    if (roleError) throw roleError;

    return new Response(JSON.stringify({ success: true, userId, email }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
