
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PesaPalAuthResponse {
  token: string
  expiryDate: string
  error?: any
  message?: string
}

interface PesaPalOrderResponse {
  order_tracking_id: string
  merchant_reference: string
  redirect_url: string
  error?: any
  message?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { amount, email, phone_number, description, user_id } = await req.json()

    console.log('Processing PesaPal payment for:', { amount, email, phone_number, user_id })

    // Step 1: Get OAuth token from PesaPal
    const authResponse = await fetch('https://pay.pesapal.com/v3/api/Auth/RequestToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        consumer_key: Deno.env.get('PESAPAL_CONSUMER_KEY'),
        consumer_secret: Deno.env.get('PESAPAL_CONSUMER_SECRET')
      })
    })

    const authData: PesaPalAuthResponse = await authResponse.json()
    console.log('PesaPal auth response:', authData)

    if (!authData.token) {
      throw new Error(`PesaPal authentication failed: ${authData.message || 'Unknown error'}`)
    }

    // Step 2: Generate unique merchant reference
    const merchantReference = `BETOWISE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Step 3: Submit order request
    const orderData = {
      id: merchantReference,
      currency: 'KES',
      amount: parseFloat(amount),
      description: description || 'BetoWise Deposit',
      callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/pesapal-callback`,
      notification_id: merchantReference,
      billing_address: {
        email_address: email,
        phone_number: phone_number,
        country_code: 'KE',
        first_name: email.split('@')[0],
        last_name: 'User'
      }
    }

    console.log('Submitting order to PesaPal:', orderData)

    const orderResponse = await fetch('https://pay.pesapal.com/v3/api/Transactions/SubmitOrderRequest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${authData.token}`
      },
      body: JSON.stringify(orderData)
    })

    const orderResult: PesaPalOrderResponse = await orderResponse.json()
    console.log('PesaPal order response:', orderResult)

    if (!orderResult.redirect_url) {
      throw new Error(`Order submission failed: ${orderResult.message || 'Unknown error'}`)
    }

    // Step 4: Store payment record in database
    const { error: dbError } = await supabase
      .from('payments')
      .insert({
        user_id: user_id,
        amount: parseFloat(amount),
        currency: 'KES',
        merchant_reference: merchantReference,
        order_tracking_id: orderResult.order_tracking_id,
        status: 'pending',
        payment_method: 'pesapal_mpesa',
        email: email,
        phone_number: phone_number,
        description: description
      })

    if (dbError) {
      console.error('Database error:', dbError)
      // Continue anyway, we have the payment URL
    }

    return new Response(
      JSON.stringify({
        success: true,
        redirect_url: orderResult.redirect_url,
        order_tracking_id: orderResult.order_tracking_id,
        merchant_reference: merchantReference
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('PesaPal payment error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Payment processing failed'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
