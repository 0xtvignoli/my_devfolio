'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

export interface SnackbarMessage {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning';
  duration?: number;
}

interface SnackbarContextValue {
  toast: (options: Omit<SnackbarMessage, 'id'>) => void;
  dismiss: (id?: string) => void;
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

let idCounter = 0;
function genId() {
  idCounter += 1;
  return idCounter.toString();
}

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<SnackbarMessage | null>(null);
  const [open, setOpen] = useState(false);

  const toast = useCallback((options: Omit<SnackbarMessage, 'id'>) => {
    const id = genId();
    setMessage({ ...options, id });
    setOpen(true);
  }, []);

  const dismiss = useCallback((id?: string) => {
    if (!id || message?.id === id) {
      setOpen(false);
      setMessage(null);
    }
  }, [message?.id]);

  const handleClose = useCallback((_?: unknown, reason?: string) => {
    if (reason === 'clickaway') return;
    setOpen(false);
    setMessage(null);
  }, []);

  const severity = message?.variant === 'error' ? 'error' : message?.variant === 'success' ? 'success' : message?.variant === 'warning' ? 'warning' : 'info';

  return (
    <SnackbarContext.Provider value={{ toast, dismiss }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={message?.duration ?? 5000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        // Clear the 64px mobile bottom nav — MD3 forbids a snackbar covering it.
        sx={{ bottom: { xs: 'calc(72px + env(safe-area-inset-bottom, 0px))', md: 24 } }}
      >
        <Alert onClose={() => handleClose()} severity={severity} variant="filled" sx={{ width: '100%' }}>
          {message?.title}
          {message?.description && (
            <span style={{ display: 'block', marginTop: 4, opacity: 0.9, fontSize: '0.875rem' }}>
              {message.description}
            </span>
          )}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error('useSnackbar must be used within SnackbarProvider');
  return ctx;
}
