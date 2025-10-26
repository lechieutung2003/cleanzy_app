import BaseService from "./base";
import AsyncStorage from '@react-native-async-storage/async-storage';

class OAuthService extends BaseService {
    get entity() {
        return "employees";
    }

    async login({ username, password }) {
        const formData = new FormData();
        formData.append("username", username);
        formData.append("password", password);
        const response = await this.post(`/api/v1/${this.entity}/login`, formData);
        if (response.access_token) {
            await AsyncStorage.setItem('access_token', response.access_token);
        }
        if (response.refresh_token) {
            await AsyncStorage.setItem('refresh_token', response.refresh_token);
        }
        return response;
    }

    async registerCustomer(data) {
        const formData = new FormData();
        for (const key in data) {
            formData.append(key, data[key]);
        }
        return this.post('register-customer', formData);
    }

    async logout() {
        const access_token = await AsyncStorage.getItem('access_token');
        const refresh_token = await AsyncStorage.getItem('refresh_token');
        const formData = new FormData();
        formData.append("access_token", access_token);
        formData.append("refresh_token", refresh_token);
        const response = await this.post(`${this.entity}/logout`, formData);

        // Delete tokens from AsyncStorage
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refresh_token');
        return response;
    }

    async userinfo() {
        return this.get(`/api/v1/${this.entity}/userinfo`);
    }

    async forgotPassword(email) {
        return this.post(`${this.entity}/forgot-password`, email);
    }

    async getScopes() {
        return this.get(`${this.entity}/scopes`);
    }

    // Save scopes to AsyncStorage
    async fetchScopes() {
        const response = await this.getScopes();
        const { scopes, default_scopes } = response;
        await AsyncStorage.setItem('scopes', JSON.stringify(scopes));
        await AsyncStorage.setItem('default_scopes', JSON.stringify(default_scopes));
        return { scopes, default_scopes };
    }

    async setPassword(token, password) {
        const formData = new FormData();
        formData.append("token", token);
        formData.append("password", password);
        return this.post(`${this.entity}/set-password`, formData);
    }

    async getAccessToken() {
        return await AsyncStorage.getItem('access_token');
    }

    async getRefreshToken() {
        return await AsyncStorage.getItem('refresh_token');
    }

    async getStoredScopes() {
        const scopes = await AsyncStorage.getItem('scopes');
        const default_scopes = await AsyncStorage.getItem('default_scopes');
        return {
            scopes: scopes ? JSON.parse(scopes) : null,
            default_scopes: default_scopes ? JSON.parse(default_scopes) : null,
        };
    }
}

export default new OAuthService();