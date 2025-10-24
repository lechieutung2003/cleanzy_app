const API_BASE_URL = 'http://10.0.2.2:8008';
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
        const res = await fetch(fullUrl);
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
        const text = await res.text();
        try {
            return JSON.parse(text);
        } catch (e) {
            throw new Error('Response is not valid JSON: ' + text);
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

    async delete(url, data) {
        const res = await fetch(url, {
            method: 'DELETE',
            body: data ? JSON.stringify(data) : undefined,
            headers: { 'Content-Type': 'application/json' },
        });
        return res.json();
    }
}
