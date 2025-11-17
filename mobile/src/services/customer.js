import BaseService from './base';

class CustomerService extends BaseService {
  get entity() {
    return 'customer';
  }

  async getCustomerInfo() {
    return this.get('/api/v1/customer/info');
  }

  async updateCustomerInfo(data) {
    return this.patch('/api/v1/customer/info', data);
  }
}

export default new CustomerService();
