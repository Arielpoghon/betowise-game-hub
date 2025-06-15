
import { Button } from '@/components/ui/button';

interface BetslipRefreshProps {
  loading: boolean;
  onRefresh: () => void;
}

export function BetslipRefresh({ loading, onRefresh }: BetslipRefreshProps) {
  return (
    <div className="pt-2 border-t">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefresh}
        disabled={loading}
        className="w-full"
      >
        {loading ? "Refreshing..." : "Refresh Betslip"}
      </Button>
    </div>
  );
}
