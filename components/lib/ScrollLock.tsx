// components/ScrollLock.tsx
import { useEffect, FC } from 'react';

interface ScrollLockProps {
  isLocked: boolean;
}

export const ScrollLock: FC<ScrollLockProps> = ({ isLocked }) => {
  useEffect(() => {
    if (isLocked) {
      // Add overflow hidden to body
      document.body.classList.add('overflow-hidden');
      // Optional: Prevent scroll on html too
      document.documentElement.classList.add('overflow-hidden');
      
      // Store current scroll position to prevent layout shift
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Remove locks
      document.body.classList.remove('overflow-hidden');
      document.documentElement.classList.remove('overflow-hidden');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      
      // Restore scroll position
      const scrollY = document.body.style.top;
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('overflow-hidden');
      document.documentElement.classList.remove('overflow-hidden');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isLocked]);

  return null;
};