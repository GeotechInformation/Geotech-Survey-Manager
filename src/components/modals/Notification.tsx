import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface NotificationProps {
  message: string;
  type: 'error' | 'success' | 'neutral'; // Add type for different notification styles
  duration?: number;
  animationDuration?: number;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, duration = 5000, animationDuration = 1000, onClose }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    setIsVisible(true);

    const visibilityTimer = setTimeout(() => {
      setIsVisible(false);
      const closeTimer = setTimeout(() => {
        if (onClose) onClose();
      }, animationDuration); // Use the animation duration here

      return () => clearTimeout(closeTimer); // Clear close timeout
    }, duration);

    return () => clearTimeout(visibilityTimer); // Clear main timer
  }, [duration, animationDuration, onClose]);


  // Define a style for each type
  const notificationStyles = {
    error: 'bg-red-500 text-white',
    success: 'bg-green-500 text-white',
    neutral: 'bg-gray-500 text-white',
  };

  return createPortal(
    <div className={`fixed top-[100px] min-w-[250px] p-2 px-4 rounded-lg transition-all ease-in-out duration-${animationDuration} z-50
      transform ${isVisible ? 'translate-x-[-1rem] opacity-100' : 'translate-x-[300px] opacity-0'}
      ${notificationStyles[type]}`}
      style={{ right: '0' }}>
      {message}
    </div>,
    document.body
  );
};

export default Notification;
