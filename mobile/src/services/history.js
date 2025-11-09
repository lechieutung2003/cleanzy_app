import BaseService from './base';

class HistoryService extends BaseService {
  get entity() {
    return '/api/v1/customer/orders';
  }

  async getOrders(params) {
    // BaseService.get() tự thêm base URL và Authorization từ AsyncStorage ('access_token')
    return this.get(this.entity, params);
  }
}

export default new HistoryService();