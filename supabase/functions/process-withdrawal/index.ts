
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { amount, phone_number, user_id, commission, net_amount } = await req.json()

    console.log('Processing withdrawal:', { amount, phone_number, user_id, commission, net_amount })

    // First, verify user has sufficient balance
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('balance, username')
      .eq('auth_user_id', user_id)
      .single()

    if (userError || !user) {
      throw new Error('User not found')
    }

    if (user.balance < amount) {
      throw new Error('Insufficient balance')
    }

    // Get PesaPal OAuth token
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

    // Create withdrawal record
    const withdrawalReference = `WITHDRAWAL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const { error: withdrawalError } = await supabase
      .from('payments')
      .insert({
        user_id: user_id,
        amount: -amount, // Negative for withdrawal
        currency: 'KES',
        merchant_reference: withdrawalReference,
        status: 'completed',
        payment_method: 'pesapal_withdrawal',
        phone_number: phone_number,
        description: `Withdrawal - Net: ${net_amount}, Commission: ${commission}`
      })

    if (withdrawalError) {
      console.error('Failed to create withdrawal record:', withdrawalError)
      throw new Error('Failed to record withdrawal')
    }

    // Process commission payment to PesaPal (our account)
    if (commission > 0) {
      const commissionReference = `COMMISSION_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Register commission payment (this would go to our PesaPal account)
      const { error: commissionError } = await supabase
        .from('payments')
        .insert({
          user_id: user_id,
          amount: commission,
          currency: 'KES',
          merchant_reference: commissionReference,
          status: 'completed',
          payment_method: 'commission_to_pesapal',
          description: `Commission from withdrawal ${withdrawalReference}`
        })

      if (commissionError) {
        console.error('Failed to record commission:', commissionError)
      }

      console.log('Commission recorded:', { commission, reference: commissionReference })
    }

    // Update user balance (deduct full withdrawal amount)
    const { error: balanceError } = await supabase.rpc('update_user_balance', {
      user_id: user_id,
      amount_to_add: -amount // Negative to subtract
    })

    if (balanceError) {
      console.error('Failed to update user balance:', balanceError)
      throw new Error('Failed to update balance')
    }

    console.log('User balance updated successfully')

    // In a real implementation, you would initiate the actual mobile money transfer here
    // For now, we'll simulate a successful withdrawal
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Withdrawal processed successfully',
        withdrawal_reference: withdrawalReference,
        net_amount: net_amount,
        commission: commission
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Withdrawal processing error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Withdrawal processing failed'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
