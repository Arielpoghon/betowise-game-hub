
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const orderTrackingId = url.searchParams.get('OrderTrackingId')
    const merchantReference = url.searchParams.get('OrderMerchantReference')

    console.log('PesaPal callback received:', { orderTrackingId, merchantReference })

    if (!orderTrackingId || !merchantReference) {
      return new Response('Missing required parameters', { status: 400, headers: corsHeaders })
    }

    // Get OAuth token to check payment status
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

    const authData = await authResponse.json()
    
    if (!authData.token) {
      throw new Error('Failed to authenticate with PesaPal')
    }

    // Check transaction status
    const statusResponse = await fetch(
      `https://pay.pesapal.com/v3/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${authData.token}`
        }
      }
    )

    const statusData = await statusResponse.json()
    console.log('Payment status:', statusData)

    // Update payment record in database
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('order_tracking_id', orderTrackingId)
      .single()

    if (fetchError || !payment) {
      console.error('Payment record not found:', fetchError)
      return new Response('Payment record not found', { status: 404, headers: corsHeaders })
    }

    // Update payment status
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: statusData.payment_status_description?.toLowerCase() || 'unknown',
        updated_at: new Date().toISOString()
      })
      .eq('order_tracking_id', orderTrackingId)

    if (updateError) {
      console.error('Failed to update payment:', updateError)
    }

    // If payment is successful, update user balance
    if (statusData.payment_status_description === 'Completed') {
      const { error: balanceError } = await supabase.rpc('update_user_balance', {
        user_id: payment.user_id,
        amount_to_add: payment.amount
      })

      if (balanceError) {
        console.error('Failed to update user balance:', balanceError)
      }
    }

    // Redirect to success/failure page
    const redirectUrl = statusData.payment_status_description === 'Completed' 
      ? `${Deno.env.get('SUPABASE_URL')?.replace('//', '//').split('.')[0]}.lovable.app/?payment=success`
      : `${Deno.env.get('SUPABASE_URL')?.replace('//', '//').split('.')[0]}.lovable.app/?payment=failed`

    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': redirectUrl
      }
    })

  } catch (error) {
    console.error('Callback error:', error)
    return new Response('Callback processing failed', { status: 500, headers: corsHeaders })
  }
})
