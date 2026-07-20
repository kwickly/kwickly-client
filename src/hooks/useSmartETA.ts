import { useState, useEffect } from 'react';

type KotStatus = 'pending' | 'preparing' | 'ready' | 'completed';

export function useSmartETA(createdAt: string, estimatedCompletionTime: string | null, kotStatus: KotStatus) {
  const [etaText, setEtaText] = useState<string>('');
  const [isDelayed, setIsDelayed] = useState<boolean>(false);

  useEffect(() => {
    const calculateETA = () => {
      if (kotStatus === 'ready' || kotStatus === 'completed') {
        setEtaText('Ready');
        setIsDelayed(false);
        return;
      }

      const created = new Date(createdAt).getTime();
      const now = Date.now();
      
      // If we don't have an estimated time, just show pending text
      if (!estimatedCompletionTime) {
        setEtaText('Calculating...');
        return;
      }

      const estimatedTime = new Date(estimatedCompletionTime).getTime();
      let minutesRemaining = Math.max(0, Math.round((estimatedTime - now) / 60000));

      let delayed = false;

      // Stalling Logic
      // 1. If pending for more than 5 minutes, we shouldn't keep counting down normally
      if (kotStatus === 'pending') {
        const minutesSinceCreated = Math.round((now - created) / 60000);
        if (minutesSinceCreated >= 5) {
          delayed = true;
          // Stall the countdown by freezing the remaining time assuming they haven't started
          const totalExpectedDuration = estimatedTime - created;
          minutesRemaining = Math.round(totalExpectedDuration / 60000);
        }
      } else if (kotStatus === 'preparing') {
        // If preparing but ETA has elapsed
        if (now > estimatedTime) {
          delayed = true;
          minutesRemaining = 0;
        }
      }

      setIsDelayed(delayed);

      if (delayed) {
        setEtaText('Delayed');
      } else if (minutesRemaining > 0) {
        setEtaText(`${minutesRemaining} min`);
      } else {
        setEtaText('Almost ready');
      }
    };

    calculateETA();
    const interval = setInterval(calculateETA, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [createdAt, estimatedCompletionTime, kotStatus]);

  return { etaText, isDelayed };
}
