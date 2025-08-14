'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Clock, CheckCircle, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NotificationAlertProps {
  type: 'peminjaman' | 'keterlambatan' | 'deadline';
  count: number;
  message: string;
  priority: 'low' | 'medium' | 'high';
  onDismiss?: () => void;
  showDismiss?: boolean;
}

export default function NotificationAlert({
  type,
  count,
  message,
  priority,
  onDismiss,
  showDismiss = true
}: NotificationAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  const getIcon = () => {
    switch (type) {
      case 'peminjaman':
        return <CheckCircle className="h-4 w-4" />;
      case 'keterlambatan':
        return <AlertCircle className="h-4 w-4" />;
      case 'deadline':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getVariant = () => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const getBadgeVariant = () => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!isVisible || count === 0) {
    return null;
  }

  return (
    <Alert variant={getVariant()} className="mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getIcon()}
          <AlertDescription className="flex items-center space-x-2">
            <span>{message}</span>
            <Badge variant={getBadgeVariant()}>
              {count} item{count > 1 ? 's' : ''}
            </Badge>
          </AlertDescription>
        </div>
        {showDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </Alert>
  );
}
