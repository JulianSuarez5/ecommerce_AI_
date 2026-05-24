import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const isDesktop = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches
  );

  useEffect(() => {
    if (!isDesktop.current) return;

    document.body.classList.add('cursor-enabled');

    const cursor = cursorRef.current;
    if (!cursor) return;

    let rafId = null;
    const targets = [];

    function onMouseMove(e) {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        cursor.classList.add('visible');
      });
    }

    function onMouseOver(e) {
      const el = e.target.closest('a, button, [role="button"], input, select, textarea, label');
      cursor.classList.toggle('hovering', !!el);
    }

    function onMouseLeave() {
      cursor.classList.remove('visible');
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseover', onMouseOver, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.body.classList.remove('cursor-enabled');
      cancelAnimationFrame(rafId);
    };
  }, []);

  if (!isDesktop.current) return null;

  return <div ref={cursorRef} className="custom-cursor" />;
}
