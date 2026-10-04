import React, { useEffect, useRef, useState } from 'react';

export default function AnimatedCounter({ value, duration = 800, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(() => parseInt(value, 10) || 0);
  // Use a ref to track the current animated value so the effect doesn't
  // need `count` as a dependency (avoids re-triggering on every tick).
  const currentRef = useRef(count);

  useEffect(() => {
    const end = parseInt(value, 10) || 0;
    const start = currentRef.current;
    if (start === end) return;

    const incrementTime = 20;
    const totalSteps = duration / incrementTime;
    const stepValue = (end - start) / totalSteps;

    let current = start;
    const timer = setInterval(() => {
      current += stepValue;
      if ((stepValue > 0 && current >= end) || (stepValue < 0 && current <= end)) {
        clearInterval(timer);
        currentRef.current = end;
        setCount(end);
      } else {
        const rounded = Math.round(current);
        currentRef.current = rounded;
        setCount(rounded);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <span>
      {prefix}
      {count}
      {suffix}
    </span>
  );
}
