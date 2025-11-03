const API_BASE_URL = 'http://10.0.2.2:8008/api/v1/customer/orders';

class HistoryService {
  async getOrders(token) {
    const res = await fetch(API_BASE_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Failed to fetch orders');
    }
    return res.json();
  }
}

export default new HistoryService();