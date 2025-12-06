const API_BASE_URL = 'http://10.0.2.2:8009';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';


export default class BaseService {
    constructor() {
        if (!this.entity) {
            throw new Error("Child service class not provide entity");
        }
    }

    async get(url, params) {
        let fullUrl = url.startsWith('http')
            ? url
            : `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
        if (params && Object.keys(params).length > 0) {
            const query = new URLSearchParams(params).toString();
            fullUrl += `?${query}`;
        }

        // Get access token for authenticated requests
        const access_token = await AsyncStorage.getItem('access_token');
        const headers = {};
        if (access_token) {
            headers['Authorization'] = `Bearer ${access_token}`;
        }

        const res = await fetch(fullUrl, { headers });
        return res.json();
    }

    async post(url, data) {
        const fullUrl = url.startsWith('http')
            ? url
            : `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
        const res = await fetch(fullUrl, {
            method: 'POST',
            body: data instanceof FormData ? data : JSON.stringify(data),
            headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
        });
        const json = await res.json();
        // console.log('Response text:', json);
        try {
            return json;
        } catch (e) {
            throw new Error('Response is not valid JSON: ' + json);
        }
    }

    async put(url, data) {
        const res = await fetch(url, {
            method: 'PUT',
            body: data instanceof FormData ? data : JSON.stringify(data),
            headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
        });
        return res.json();
    }

    async patch(url, data) {
        const fullUrl = url.startsWith('http')
            ? url
            : `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;

        // Get access token for authenticated requests
        const access_token = await AsyncStorage.getItem('access_token');
        const headers = { 'Content-Type': 'application/json' };
        if (access_token) {
            headers['Authorization'] = `Bearer ${access_token}`;
        }

        const res = await fetch(fullUrl, {
            method: 'PATCH',
            body: data instanceof FormData ? data : JSON.stringify(data),
            headers: data instanceof FormData ? {} : headers,
        });

        const text = await res.text();
        try {
            return JSON.parse(text);
        } catch (e) {
            throw new Error('Response is not valid JSON: ' + text);
        }
    }

    async delete(url, data) {
        const fullUrl = url.startsWith('http')
            ? url
            : `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;

        // Get access token for authenticated requests
        const access_token = await AsyncStorage.getItem('access_token');
        const headers = { 'Content-Type': 'application/json' };
        if (access_token) {
            headers['Authorization'] = `Bearer ${access_token}`;
        }

        const res = await fetch(fullUrl, {
            method: 'DELETE',
            body: data ? JSON.stringify(data) : undefined,
            headers,
        });

        // Handle 204 No Content response (successful delete with no body)
        if (res.status === 204) {
            return { success: true };
        }

        // For other responses, try to parse JSON
        const text = await res.text();
        if (!text) {
            return { success: res.ok };
        }

        try {
            return JSON.parse(text);
        } catch (e) {
            if (res.ok) {
                return { success: true };
            }
            throw new Error('Response is not valid JSON: ' + text);
        }
    }

    // Authenticated POST - for APIs that require Authorization header
    async authenticatedPost(url, data) {
        const fullUrl = url.startsWith('http')
            ? url
            : `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;

        // Get access token for authenticated requests
        const access_token = await AsyncStorage.getItem('access_token');
        const headers = {};
        if (access_token) {
            headers['Authorization'] = `Bearer ${access_token}`;
        }
        if (!(data instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        const res = await fetch(fullUrl, {
            method: 'POST',
            body: data instanceof FormData ? data : JSON.stringify(data),
            headers,
        });
        const text = await res.text();
        try {
            return JSON.parse(text);
        } catch (e) {
            throw new Error('Response is not valid JSON: ' + text);
        }
    }
}
