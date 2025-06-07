
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

interface MatchCountdownProps {
  startTime: string;
  status: string;
  currentMinute?: number;
  halfNumber?: number;
  isHalftime?: boolean;
}

export function MatchCountdown({ 
  startTime, 
  status, 
  currentMinute = 0, 
  halfNumber = 1, 
  isHalftime = false 
}: MatchCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [gameTime, setGameTime] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const matchTime = new Date(startTime);
      
      // Convert to EAT timezone (UTC+3)
      const eatNow = new Date(now.getTime() + (3 * 60 * 60 * 1000));
      const eatMatchTime = new Date(matchTime.getTime());
      
      const timeDiff = eatMatchTime.getTime() - eatNow.getTime();
      
      if (status === 'upcoming' && timeDiff > 0) {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        
        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else if (minutes > 0) {
          setTimeLeft(`${minutes}m ${seconds}s`);
        } else {
          setTimeLeft(`${seconds}s`);
        }
      } else if (status === 'live') {
        if (isHalftime) {
          setGameTime(`Half Time`);
        } else {
          setGameTime(`${Math.floor(currentMinute)}'`);
        }
      } else if (status === 'finished') {
        setGameTime('Full Time');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [startTime, status, currentMinute, halfNumber, isHalftime]);

  if (status === 'upcoming' && timeLeft) {
    return (
      <div className="text-center">
        <Badge variant="outline" className="bg-blue-50 text-blue-700 font-mono">
          Starts in: {timeLeft}
        </Badge>
      </div>
    );
  }

  if (status === 'live') {
    return (
      <div className="text-center">
        <Badge variant="default" className="bg-green-500 text-white font-bold animate-pulse">
          🔴 LIVE {gameTime} {!isHalftime && `(${halfNumber}H)`}
        </Badge>
      </div>
    );
  }

  if (status === 'finished') {
    return (
      <div className="text-center">
        <Badge variant="secondary" className="bg-gray-500 text-white">
          {gameTime}
        </Badge>
      </div>
    );
  }

  return null;
}
