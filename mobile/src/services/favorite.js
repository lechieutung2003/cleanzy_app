import BaseService from './base';

class FavoriteService extends BaseService {
  get entity() {
    return 'customer/favorites';
  }

  async getFavorites(params = {}) {
    return this.get(`/api/v1/${this.entity}`, params);
  }

  async getFavoriteById(id) {
    return this.get(`/api/v1/${this.entity}/${id}`);
  }

  async addFavorite(data) {
    return this.authenticatedPost(`/api/v1/${this.entity}`, data);
  }

  async deleteFavorite(id) {
    return this.delete(`/api/v1/${this.entity}/${id}`);
  }
}

export default new FavoriteService();
