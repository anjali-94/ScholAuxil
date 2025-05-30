import { useEffect } from 'react';
import { useFlashMessage } from '../hooks/useFlashMessage';

export default function FlashMessage() {
  const { message, type, clearMessage } = useFlashMessage();

  console.log('FlashMessage: message=', message, 'type=', type); // Add this

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        clearMessage();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, clearMessage]);

  if (!message) return null;

  return (
    <div className={`alert alert-${type} alert-dismissible fade show`} role="alert">
      {message}
      <button type="button" className="close" onClick={clearMessage} aria-label="Close">
        <span aria-hidden="true">×</span>
      </button>
    </div>
  );
}