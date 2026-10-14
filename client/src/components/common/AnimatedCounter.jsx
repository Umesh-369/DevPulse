import React, { useEffect, useState, useRef } from 'react';

export default function AnimatedCounter({ value, duration = 1200, prefix = '', suffix = '', className = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  // If value is a string like "1,284" or "4.9", parse it
  const numericValue = typeof value === 'number'
    ? value
    : parseFloat(String(value).replace(/,/g, '')) || 0;

  const isDecimal = String(value).includes('.');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    const end = numericValue;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = start + (end - start) * ease;

      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, numericValue, duration]);

  const formatted = isDecimal
    ? count.toFixed(1)
    : Math.floor(count).toLocaleString();

  return (
    <span ref={ref} className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
