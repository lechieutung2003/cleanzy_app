import { useState } from 'react';

export const useHomeViewModel = () => {
  const [count, setCount] = useState(0);

  const increment = () => setCount(c => c + 1);

  return { count, increment };
};