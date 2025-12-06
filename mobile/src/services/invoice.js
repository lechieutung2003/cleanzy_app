const API_BASE_URL = 'http://10.0.2.2:8009/api/v1';

class InvoiceService {
  // Lấy invoice theo orderId
  async getInvoice(orderId, token) {
    const url = `${API_BASE_URL}/customer/orders/${orderId}`;
    console.log('Fetching invoice from URL:', url);
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    console.log('Response status:', res.status);
    console.log('Response status:', res.value);

    const text = await res.text();
    console.log('Response text:', text);

    if (!res.ok) {
      throw new Error(text || 'Failed to fetch invoice');
    }
    try {
      return JSON.parse(text);
    } catch {
      // Backend có thể trả JSON sẵn (res.json), hoặc text; fallback parse
      // Nếu không phải JSON, ném lỗi để debug nội dung thực tế
      throw new Error('Response is not valid JSON: ' + text);
    }
  }

  // Nếu cần preview invoice trước khi tạo order, có thể sử dụng POST:
  async preview(payload, token) {
    const url = `${API_BASE_URL}/invoices/preview`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    if (!res.ok) throw new Error(text || 'Failed to preview invoice');
    try {
      return JSON.parse(text);
    } catch {
      throw new Error('Response is not valid JSON: ' + text);
    }
  }
}

export default new InvoiceService();