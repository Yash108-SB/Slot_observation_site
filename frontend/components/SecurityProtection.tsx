'use client';

import { useEffect } from 'react';

export default function SecurityProtection() {
  useEffect(() => {
    // Security protections disabled for development
    // You can re-enable these in production if needed
    
    return () => {
      // Cleanup
    };
  }, []);

  return null;
}
