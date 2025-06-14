
interface DashboardNavigationProps {
  onComingSoon: (feature: string) => void;
}

export function DashboardNavigation({ onComingSoon }: DashboardNavigationProps) {
  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto py-4">
          <button className="whitespace-nowrap text-blue-600 dark:text-blue-400 font-medium border-b-2 border-blue-600 dark:border-blue-400 pb-2">
            Sports
          </button>
          <button 
            onClick={() => onComingSoon('Jackpot')}
            className="whitespace-nowrap text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 pb-2"
          >
            Jackpot
          </button>
          <button 
            onClick={() => onComingSoon('Aviator')}
            className="whitespace-nowrap text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 pb-2"
          >
            Aviator
          </button>
          <button 
            onClick={() => onComingSoon('Casino')}
            className="whitespace-nowrap text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 pb-2"
          >
            Casino
          </button>
          <button 
            onClick={() => onComingSoon('Virtual')}
            className="whitespace-nowrap text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 pb-2"
          >
            Virtual
          </button>
        </div>
      </div>
    </nav>
  );
}
