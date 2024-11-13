import { useEffect, useState } from 'react';

// Define the WebApp interface separately for better reusability
interface TelegramWebApp {
    ready: () => void;
    expand: () => void;
    close: () => void;
    MainButton: {
        text: string;
        color: string;
        textColor: string;
        isVisible: boolean;
        isActive: boolean;
        setText: (text: string) => void;
        onClick: (fn: () => void) => void;
        offClick: (fn: () => void) => void;
        show: () => void;
        hide: () => void;
        enable: () => void;
        disable: () => void;
    };
}

// Extend Window interface
declare global {
    interface Window {
        Telegram?: {
            WebApp: TelegramWebApp;
        };
    }
}

export const useTelegramWebApp = () => {
    const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);

    useEffect(() => {
        const telegram = window.Telegram;

        if (!telegram?.WebApp) {
            console.warn('Telegram WebApp is not available');
            return;
        }

        try {
            // Initialize Web App
            telegram.WebApp.ready();
            // Expand to full height
            telegram.WebApp.expand();

            setWebApp(telegram.WebApp);
        } catch (error) {
            console.error('Failed to initialize Telegram WebApp:', error);
        }
    }, []);

    return webApp;
};