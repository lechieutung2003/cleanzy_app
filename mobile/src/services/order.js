import BaseService from './base';

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

  /**
   * Cập nhật trạng thái đơn hàng
   * @param {string} orderId - Order ID
   * @param {string} status - Trạng thái mới
   */
  async updateOrderStatus(orderId, status) {
    return this.patch(`/api/v1/${this.entity}/${orderId}/updateStatus`, { status });
  }

  /**
   * Lấy danh sách assignments của đơn hàng
   * @param {string} orderId - Order ID
   */
  async getOrderAssignments(orderId) {
    return this.get(`/api/v1/${this.entity}/${orderId}/assignments`);
  }

  /**
   * Hoàn thành đơn hàng
   * @param {string} orderId - Order ID
   */
  async completeOrder(orderId) {
    return this.authenticatedPost(`/api/v1/${this.entity}/${orderId}/complete`, {});
  }
}

export default new OrderService();