import BaseService from './base';

const API_BASE = global.__API_URL__?.replace(/\/$/, '') + '/api/v1/orders' || 'http://127.0.0.1:8009/api/v1/orders';


class OrderService extends BaseService {
  get entity() {
    return 'orders';
  }

  /**
   * Tạo đơn hàng mới
   * @param {Object} orderData - Dữ liệu đơn hàng
   * @param {string} orderData.customer - Customer ID
   * @param {string} orderData.service_type - Service Type ID
   * @param {number} orderData.area_m2 - Diện tích (m2)
   * @param {number} orderData.requested_hours - Số giờ yêu cầu
   * @param {string} orderData.preferred_start_time - Thời gian bắt đầu (ISO format)
   * @param {string} orderData.preferred_end_time - Thời gian kết thúc (ISO format)
   * @param {number} orderData.estimated_hours - Số giờ ước tính
   * @param {number} orderData.cost_confirm - Chi phí xác nhận
   * @param {string} orderData.payment_method - Phương thức thanh toán: 'CASH' hoặc 'BANK_TRANSFER'
   * @param {string} orderData.note - Ghi chú (optional)
   */
  async createOrder(orderData) {
    console.log('Creating order with data:', orderData);
    return this.authenticatedPost(`/api/v1/${this.entity}`, orderData);
  }

  /**
   * Lấy danh sách đơn hàng
   * @param {Object} params - Query parameters
   */
  async getOrders(params = {}) {
    return this.get(`/api/v1/${this.entity}`, params);
  }

  /**
   * Lấy chi tiết đơn hàng
   * @param {string} orderId - Order ID
   */
  async getOrderById(orderId) {
    return this.get(`/api/v1/${this.entity}/${orderId}`);
  }

  // /**
  //  * Cập nhật trạng thái đơn hàng
  //  * @param {string} orderId - Order ID
  //  * @param {string} status - Trạng thái mới
  //  */
  // async updateOrderStatus(orderId, status) {
  //   return this.patch(`/api/v1/${this.entity}/${orderId}/updateStatus`, { status });
  // }

  /**
   * Lấy danh sách assignments của đơn hàng
   * @param {string} orderId - Order ID
   */
  async getOrderAssignments(orderId) {
    return this.get(`/api/v1/${this.entity}/${orderId}/assignments`);
  }

  // /**
  //  * Hoàn thành đơn hàng
  //  * @param {string} orderId - Order ID
  //  */
  // async completeOrder(orderId) {
  //   return this.authenticatedPost(`/api/v1/${this.entity}/${orderId}/complete`, {});
  // }

  // Cập nhật trạng thái đơn hàng giống web: PATCH /api/v1/orders/{id}/updateStatus
  async updateOrderStatus(id, status) {
    const statusData = typeof status === 'string' ? { status } : status;
    console.log('OrderService.updateOrderStatus called with', id, statusData);

    const token = await (async () => {
      // AsyncStorage is async in RN — but if token stored sync, adapt accordingly
      try {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        return await AsyncStorage.getItem('access_token');
      } catch (e) {
        return null;
      }
    })();

    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const url = `/api/v1/${this.entity}/${id}/updateStatus`;

    try {
      const res = await this.patch(url, statusData, { headers });
      console.log('OrderService.updateOrderStatus fetching token from AsyncStorage');
      return res.data ?? res;
    } catch (err) {
      console.error('OrderService.updateOrderStatus error', err);
      throw err;
    }
  }

  // Gọi complete endpoint (web dùng POST /orders/{id}/complete)
  async completeOrder(orderId, requestedHours) {
    const token = await (async () => {
      try {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        return await AsyncStorage.getItem('access_token');
      } catch (e) {
        return null;
      }
    })();

    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const url = `/api/v1/${this.entity}/${orderId}/complete`;
    try {
      const res = await this.authenticatedPost(url, { requested_hours: requestedHours }, { headers });
      return res.data ?? res;
    } catch (err) {
      console.error('OrderService.completeOrder error', err);
      throw err;
    }
  }

  async  predictSmartPricing(formData) {
    try{
      console.log('Predicting smart pricing with data:', formData);
      const url = '/api/v1/smart-pricing/predict/';
      const res = await this.post(url, formData);
      // console.log('Smart pricing prediction result:', res);
      return res;
    } catch (err) {
      console.error('OrderService.predictSmartPricing error', err);
      throw err;
    }
  }
}

export default new OrderService();