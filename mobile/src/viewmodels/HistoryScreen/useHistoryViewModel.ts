import { useState, useEffect } from 'react';
import HistoryService from '../../services/history';
// Giả sử bạn lấy token từ đâu đó, ví dụ AsyncStorage hoặc context

export default function useHistoryViewModel(token: string) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    HistoryService.getOrders(token)
      .then(setOrders)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  return {
    orders,
    loading,
    error,
  };
}