import { useState, useCallback } from 'react';

export const useFlashMessage = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [type, setType] = useState<'success' | 'danger' | 'warning' | 'info'>('info');

  const showMessage = useCallback((msg: string, msgType: typeof type = 'info') => {
  setMessage(msg);
  setType(msgType);
}, []);

  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);

  return { message, type, showMessage, clearMessage };
};



