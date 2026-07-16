"use client";

import { useState, useEffect } from "react";
import { requestPushPermission, onMessageListener } from "../lib/firebase";
import { eden } from "../lib/eden";

export function usePushNotifications() {
  const [token, setToken] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [notification, setNotification] = useState<{title?: string, body?: string} | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && "Notification" in window) {
      setIsSupported(true);
    }
  }, []);

  useEffect(() => {
    if (isSupported) {
      // Listen for foreground messages
      onMessageListener().then((payload: any) => {
        if (payload?.notification) {
          setNotification({
            title: payload.notification.title,
            body: payload.notification.body,
          });
          // Show native browser notification if in foreground
          new Notification(payload.notification.title, {
            body: payload.notification.body,
            icon: "/globe.svg",
          });
        }
      }).catch(err => console.log('failed: ', err));
    }
  }, [isSupported]);

  const subscribe = async () => {
    if (!isSupported) return false;
    
    const fcmToken = await requestPushPermission();
    if (fcmToken) {
      setToken(fcmToken);
      
      // Register with the backend
      try {
        await (eden as any).v1.notifications.push.register.post({
          token: fcmToken,
          deviceType: "web"
        });
        return true;
      } catch (error) {
        console.error("Failed to register token with backend", error);
      }
    }
    return false;
  };

  const unsubscribe = async () => {
    if (token) {
      try {
        await (eden as any).v1.notifications.push.unregister.delete({ token });
        setToken(null);
        return true;
      } catch (error) {
        console.error("Failed to unregister token", error);
      }
    }
    return false;
  };

  return {
    token,
    isSupported,
    subscribe,
    unsubscribe,
    notification
  };
}
