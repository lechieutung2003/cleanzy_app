import BaseService from './base';

class CustomerService extends BaseService {
  get entity() {
    return 'customer';
  }

  async getCustomerInfo() {
    return this.get('/api/v1/customer/info');
  }
}

export default new CustomerService();
