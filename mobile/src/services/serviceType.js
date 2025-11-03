import BaseService from './base';

class ServiceTypeService extends BaseService {
  get entity() {
    return 'service-types';
  }

  async getServiceTypes(params = {}) {
    return this.get(`/api/v1/${this.entity}`, params);
  }

  async getServiceTypeById(id) {
    return this.get(`/api/v1/${this.entity}/${id}`);
  }
}

export default new ServiceTypeService();
