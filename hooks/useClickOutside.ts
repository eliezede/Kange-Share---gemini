import { useEffect, RefObject } from 'react';

export function useClickOutside(
    panelRef: RefObject<HTMLElement | null>,
    toggleRef: RefObject<HTMLElement | null>,
    handler: () => void,
    isOpen: boolean
) {
  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (event: MouseEvent | TouchEvent) => {
      if (
          panelRef.current && !panelRef.current.contains(event.target as Node) &&
          toggleRef.current && !toggleRef.current.contains(event.target as Node)
      ) {
        handler();
      }
    };
    
    const handleEscapeKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            handler();
        }
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [panelRef, toggleRef, handler, isOpen]);
}
