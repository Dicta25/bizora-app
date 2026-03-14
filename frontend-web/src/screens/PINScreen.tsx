import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';

interface PINScreenProps {
  mode: 'setup' | 'verify' | 'change';
  onSuccess: () => void;
  onSkip?: () => void;
}

function hashPin(pin: string): string {
  // Simple hash for localStorage (not cryptographic)
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}

export default function PINScreen({ mode, onSuccess, onSkip }: PINScreenProps) {
  const { pin: storedPin, setPin, logout } = useApp();
  const [digits, setDigits] = useState('');
  const [confirmDigits, setConfirmDigits] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [attempts, setAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState(0);
  const [error, setError] = useState('');

  const isLocked = lockUntil > Date.now();

  const reset = () => { setDigits(''); setConfirmDigits(''); setError(''); };

  const handleDigit = useCallback((d: string) => {
    if (isLocked) return;
    setError('');
    if (mode === 'verify') {
      const next = digits + d;
      setDigits(next);
      if (next.length === 4) {
        if (hashPin(next) === storedPin) {
          onSuccess();
        } else {
          const newAttempts = attempts + 1;
          setAttempts(newAttempts);
          if (newAttempts >= 3) {
            setLockUntil(Date.now() + 60000);
            setError('Too many attempts. Try again in 1 minute');
          } else {
            setError('Wrong PIN');
          }
          setDigits('');
        }
      }
    } else {
      // setup or change
      if (step === 'enter') {
        const next = digits + d;
        setDigits(next);
        if (next.length === 4) {
          setStep('confirm');
          setConfirmDigits('');
        }
      } else {
        const next = confirmDigits + d;
        setConfirmDigits(next);
        if (next.length === 4) {
          if (next === digits) {
            setPin(hashPin(next));
            onSuccess();
          } else {
            setError('PINs do not match. Try again');
            setStep('enter');
            setDigits('');
            setConfirmDigits('');
          }
        }
      }
    }
  }, [digits, confirmDigits, step, mode, storedPin, attempts, isLocked, onSuccess, setPin]);

  const handleBackspace = () => {
    if (mode === 'verify' || step === 'enter') {
      setDigits(d => d.slice(0, -1));
    } else {
      setConfirmDigits(d => d.slice(0, -1));
    }
    setError('');
  };

  const handleForgot = () => {
    if (confirm('This will clear all data and return to sign up. Continue?')) {
      logout();
    }
  };

  // Countdown timer
  useEffect(() => {
    if (!isLocked) return;
    const id = setInterval(() => {
      if (Date.now() >= lockUntil) {
        setLockUntil(0);
        setAttempts(0);
        setError('');
      }
    }, 1000);
    return () => clearInterval(id);
  }, [isLocked, lockUntil]);

  const currentDigits = (step === 'confirm') ? confirmDigits : digits;
  const title = mode === 'verify' ? 'Enter your PIN' : step === 'enter' ? 'Set a 4-digit PIN' : 'Confirm your PIN';
  const subtitle = mode === 'verify' ? 'Protect your business data' : step === 'enter' ? 'Choose a PIN to secure your app' : 'Enter the same PIN again';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xs text-center">
        <h1 className="text-2xl font-extrabold text-foreground mb-1">{title}</h1>
        <p className="text-sm text-muted-foreground mb-8">{subtitle}</p>

        {/* Dots */}
        <div className="flex justify-center gap-4 mb-8">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`w-4 h-4 rounded-full transition-all ${i < currentDigits.length ? 'bg-primary scale-110' : 'bg-muted'}`} />
          ))}
        </div>

        {error && <p className="text-sm text-destructive font-semibold mb-4">{error}</p>}
        {isLocked && <p className="text-sm text-muted-foreground mb-4">Wait {Math.ceil((lockUntil - Date.now()) / 1000)}s</p>}

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <button key={n} onClick={() => handleDigit(String(n))} disabled={isLocked}
              className="h-16 rounded-2xl bg-card border text-2xl font-bold text-foreground active:scale-95 active:bg-secondary transition-all disabled:opacity-30">
              {n}
            </button>
          ))}
          <div />
          <button onClick={() => handleDigit('0')} disabled={isLocked}
            className="h-16 rounded-2xl bg-card border text-2xl font-bold text-foreground active:scale-95 active:bg-secondary transition-all disabled:opacity-30">0</button>
          <button onClick={handleBackspace}
            className="h-16 rounded-2xl text-lg font-bold text-muted-foreground active:scale-95 transition-all">⌫</button>
        </div>

        <div className="mt-6 space-y-2">
          {mode === 'verify' && (
            <button onClick={handleForgot} className="text-sm text-destructive font-medium">Forgot PIN</button>
          )}
          {mode === 'setup' && onSkip && (
            <button onClick={onSkip} className="text-sm text-muted-foreground underline underline-offset-2">Skip for now</button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
