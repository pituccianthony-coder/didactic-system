'use client';

import { useState, useEffect } from 'react';

export const Ritual = () => {
  const [countdown, setCountdown] = useState(30);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Use another timeout for the fade-out effect
      setTimeout(() => setVisible(false), 1000);
    }
  }, [countdown]);

  if (!visible) {
    return null;
  }

  const isFadingOut = countdown === 0;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 1)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      transition: 'opacity 1s ease-out',
      opacity: isFadingOut ? 0 : 1,
      pointerEvents: isFadingOut ? 'none' : 'auto',
    }}>
      <h2>Prepare for interaction.</h2>
      <p>Take a deep breath. Focus your attention.</p>
      <p style={{ fontSize: '2rem', marginTop: '2rem' }}>{countdown}</p>
    </div>
  );
};
