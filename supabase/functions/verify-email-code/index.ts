
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check verification code
    const { data: verification, error: verifyError } = await supabase
      .from('email_verifications')
      .select('*')
      .eq('email', email)
      .eq('verification_code', code)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (verifyError || !verification) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired verification code' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Mark as verified
    const { error: updateError } = await supabase
      .from('email_verifications')
      .update({ verified: true })
      .eq('id', verification.id);

    if (updateError) {
      throw new Error('Failed to update verification status');
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Email verified successfully' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
