
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar, Clock, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ReactNode } from 'react';

interface BetslipCardProps {
  title: string;
  date: string;
  isPaid: boolean;
  children: ReactNode;
}

export function BetslipCard({ title, date, isPaid, children }: BetslipCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {title}
          </CardTitle>
          <div className="flex flex-col items-end gap-1">
            <Badge variant={isPaid ? "default" : "secondary"}>
              {isPaid ? "PAID" : "UNPAID"}
            </Badge>
            <span className="text-sm text-gray-500">
              {new Date(date).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}
