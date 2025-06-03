
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
    const { email } = await req.json();
    
    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry time (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Store verification code in database
    const { error: dbError } = await supabase
      .from('email_verifications')
      .insert({
        email,
        verification_code: verificationCode,
        expires_at: expiresAt.toISOString(),
        verified: false
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to store verification code');
    }

    // For demo purposes, we'll just log the code
    // In production, you'd send this via email service like Resend
    console.log(`Verification code for ${email}: ${verificationCode}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verification code sent',
        // For demo - remove in production
        code: verificationCode 
      }),
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
