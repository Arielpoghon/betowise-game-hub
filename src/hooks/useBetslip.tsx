
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface BetslipBet {
  id: string;
  matchId: string;
  matchTitle: string;
  team: string;
  odds: number;
  amount: number;
  timestamp: string;
}

interface DailyBetslip {
  id: string;
  date: string;
  bets: BetslipBet[];
  isPaid: boolean;
  totalBets: number;
}

export function useBetslip() {
  const [currentBetslip, setCurrentBetslip] = useState<DailyBetslip | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const DAILY_BETSLIP_FEE = 499;

  const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const loadTodaysBetslip = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const today = getTodayDateString();

      // Check if user has paid for today's betslip
      const { data: payment, error: paymentError } = await supabase
        .from('betslip_payments')
        .select('*')
        .eq('user_id', user.id)
        .eq('payment_date', today)
        .eq('status', 'paid')
        .maybeSingle();

      if (paymentError) {
        console.error('Error checking payment:', paymentError);
        return;
      }

      // Get today's bets
      const { data: bets, error: betsError } = await supabase
        .from('bets')
        .select(`
          id,
          match_id,
          team_choice,
          amount,
          created_at,
          matches!inner(title, home_team, away_team, home_odds, away_odds, draw_odds)
        `)
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`);

      if (betsError) {
        console.error('Error loading bets:', betsError);
        return;
      }

      const betslipBets: BetslipBet[] = (bets || []).map((bet: any) => ({
        id: bet.id,
        matchId: bet.match_id,
        matchTitle: bet.matches.title,
        team: bet.team_choice,
        odds: bet.team_choice === 'home' ? parseFloat(bet.matches.home_odds) : 
              bet.team_choice === 'away' ? parseFloat(bet.matches.away_odds) : 
              parseFloat(bet.matches.draw_odds || '2.0'),
        amount: parseFloat(bet.amount),
        timestamp: bet.created_at
      }));

      setCurrentBetslip({
        id: payment?.id || `temp-${today}`,
        date: today,
        bets: betslipBets,
        isPaid: !!payment,
        totalBets: betslipBets.length
      });

    } catch (error) {
      console.error('Error loading betslip:', error);
    } finally {
      setLoading(false);
    }
  };

  const addBetToBetslip = (bet: Omit<BetslipBet, 'id' | 'timestamp'>) => {
    if (!currentBetslip) return;

    const newBet: BetslipBet = {
      ...bet,
      id: `temp-${Date.now()}`,
      timestamp: new Date().toISOString()
    };

    setCurrentBetslip(prev => prev ? {
      ...prev,
      bets: [...prev.bets, newBet],
      totalBets: prev.bets.length + 1
    } : null);
  };

  const removeBetFromBetslip = (betId: string) => {
    if (!currentBetslip) return;

    setCurrentBetslip(prev => prev ? {
      ...prev,
      bets: prev.bets.filter(bet => bet.id !== betId),
      totalBets: prev.bets.length - 1
    } : null);
  };

  const payForBetslip = async () => {
    if (!user || !currentBetslip) return false;

    try {
      setLoading(true);
      const today = getTodayDateString();

      // Record the payment
      const { error: paymentError } = await supabase
        .from('betslip_payments')
        .insert({
          user_id: user.id,
          amount: DAILY_BETSLIP_FEE,
          payment_date: today,
          status: 'paid'
        });

      if (paymentError) {
        console.error('Error recording payment:', paymentError);
        toast({
          title: "Payment failed",
          description: "Failed to record payment. Please try again.",
          variant: "destructive"
        });
        return false;
      }

      // Update user balance
      const { error: balanceError } = await supabase.rpc('update_user_balance', {
        user_id: user.id,
        amount_to_add: -DAILY_BETSLIP_FEE
      });

      if (balanceError) {
        console.error('Error updating balance:', balanceError);
        toast({
          title: "Error",
          description: "Failed to update balance. Please contact support.",
          variant: "destructive"
        });
        return false;
      }

      setCurrentBetslip(prev => prev ? { ...prev, isPaid: true } : null);

      toast({
        title: "Payment successful!",
        description: `Paid KES ${DAILY_BETSLIP_FEE} for today's betslip. You can now place bets!`
      });

      return true;

    } catch (error) {
      console.error('Error paying for betslip:', error);
      toast({
        title: "Payment failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadTodaysBetslip();
    }
  }, [user]);

  // Initialize empty betslip for new day
  useEffect(() => {
    if (user && !currentBetslip) {
      setCurrentBetslip({
        id: `temp-${getTodayDateString()}`,
        date: getTodayDateString(),
        bets: [],
        isPaid: false,
        totalBets: 0
      });
    }
  }, [user, currentBetslip]);

  return {
    currentBetslip,
    loading,
    DAILY_BETSLIP_FEE,
    addBetToBetslip,
    removeBetFromBetslip,
    payForBetslip,
    refreshBetslip: loadTodaysBetslip
  };
}
