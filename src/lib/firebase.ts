import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only if config is provided
export const app = getApps().length === 0 && firebaseConfig.apiKey 
  ? initializeApp(firebaseConfig) 
  : getApps().length > 0 ? getApp() : null;

export const messaging = async () => {
  const supported = await isSupported();
  if (app && supported) {
    return getMessaging(app);
  }
  return null;
};

export const requestPushPermission = async () => {
  const msg = await messaging();
  if (!msg) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(msg, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });
      return token;
    }
  } catch (error) {
    console.error('Error requesting push permission:', error);
  }
  return null;
};

export const onMessageListener = async () => {
  const msg = await messaging();
  if (!msg) return null;

  return new Promise((resolve) => {
    onMessage(msg, (payload) => {
      resolve(payload);
    });
  });
};
