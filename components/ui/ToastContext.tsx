import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { Toast, ToastType } from './Toast';

type ToastData = {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
};

type ToastContextType = {
  showToast: (data: ToastData) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastData & { visible: boolean }>({
    visible: false, type: 'info', title: '',
  });
  const timerRef = useRef<any>(null);

  const showToast = useCallback((data: ToastData) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ ...data, visible: true });

    // expo-haptics was installed but never actually wired up anywhere -
    // matching the feedback to what already happens visually costs
    // nothing extra to call at every existing toast site, since they
    // all already flow through here.
    switch (data.type) {
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        break;
      case 'warning':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        break;
      default:
        // 'info' toasts are frequent and often minor - a light tap
        // rather than a full notification-style buzz, so it doesn't
        // get tiresome on repeated small confirmations.
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, []);

  const dismiss = useCallback(() => {
    setToast(t => ({ ...t, visible: false }));
  }, []);

  const success = useCallback((title: string, message?: string) =>
    showToast({ type: 'success', title, message }), [showToast]);

  const error = useCallback((title: string, message?: string) =>
    showToast({ type: 'error', title, message }), [showToast]);

  const warning = useCallback((title: string, message?: string) =>
    showToast({ type: 'warning', title, message }), [showToast]);

  const info = useCallback((title: string, message?: string) =>
    showToast({ type: 'info', title, message }), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <Toast
        visible={toast.visible}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        duration={toast.duration}
        onDismiss={dismiss}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}