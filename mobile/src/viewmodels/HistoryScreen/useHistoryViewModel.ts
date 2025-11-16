import { useState, useEffect } from 'react';
import HistoryService from '../../services/history';

export default function useHistoryViewModel() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('==== START LOADING ORDERS ====');
    setLoading(true);
    HistoryService.getOrders()
      .then(data => {
        console.log('Orders response:', data);
        setOrders(data);
      })
      .catch(e => {
        console.error('Orders error:', e);
        setError(e.message);
      })
      .finally(() => {
        console.log('==== END LOADING ORDERS ====');
        setLoading(false);
      });
  }, []);

  return {
    orders,
    loading,
    error,
  };
}