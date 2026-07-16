"use client";

import { useEffect, useState } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "./button";

export function PushNotificationToggle() {
  const { isSupported, subscribe, unsubscribe, token } = usePushNotifications();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isSupported) return null;

  const handleToggle = async () => {
    setLoading(true);
    if (token) {
      await unsubscribe();
    } else {
      await subscribe();
    }
    setLoading(false);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={loading}
      title={token ? "Disable Push Notifications" : "Enable Push Notifications"}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : token ? (
        <Bell className="h-5 w-5 text-green-500" />
      ) : (
        <BellOff className="h-5 w-5 text-slate-400" />
      )}
    </Button>
  );
}
