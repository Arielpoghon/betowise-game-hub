
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardHeaderProps {
  onDepositClick: () => void;
  onWithdrawalClick: () => void;
}

export function DashboardHeader({ onDepositClick, onWithdrawalClick }: DashboardHeaderProps) {
  const { signOut } = useAuth();
  const { profile } = useUserProfile();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
              BetoWise
            </h1>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {profile && (
              <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                <CardContent className="p-2 sm:p-3">
                  <div className="text-center">
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                      Balance
                    </p>
                    <p className="text-sm sm:text-base font-bold text-green-700 dark:text-green-300">
                      KES {Number(profile.balance).toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Button 
              onClick={onDepositClick}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 text-xs sm:text-sm"
            >
              + Deposit
            </Button>

            <Button 
              onClick={onWithdrawalClick}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 px-3 py-2 text-xs sm:text-sm"
              disabled={!profile || profile.balance < 2000}
            >
              Withdraw
            </Button>
            
            <Button 
              variant="outline" 
              onClick={signOut}
              className="px-3 py-2 text-xs sm:text-sm"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
