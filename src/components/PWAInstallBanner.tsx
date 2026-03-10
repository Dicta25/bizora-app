import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('bizora_pwa_dismissed') === 'true');
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
    setIsStandalone(standalone);

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        handleDismiss();
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('bizora_pwa_dismissed', 'true');
  };

  if (dismissed || isStandalone) return null;
  if (!deferredPrompt && !isIOS) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto">
      <div className="bg-accent text-accent-foreground rounded-xl px-4 py-3 shadow-lg flex items-center gap-3">
        <span className="text-lg">📱</span>
        <div className="flex-1 min-w-0">
          {isIOS ? (
            <p className="text-xs font-semibold">Tap Share then "Add to Home Screen" to install Bizora</p>
          ) : (
            <p className="text-xs font-semibold">Add Bizora to your home screen for quick access!</p>
          )}
        </div>
        {!isIOS && deferredPrompt && (
          <button
            onClick={handleInstall}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold"
          >
            Install
          </button>
        )}
        <button onClick={handleDismiss} className="shrink-0 w-6 h-6 flex items-center justify-center">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
