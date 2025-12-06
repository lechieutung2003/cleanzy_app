const API_BASE_URL = 'http://10.0.2.2:8009/api/v1/otp/emails';

class OTPService {
  async sendEmailOTP(email) {
    const res = await fetch(`${API_BASE_URL}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const text = await res.text();
    console.log('Response text:', text);
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error('Response is not valid JSON: ' + text);
    }
  }

  async verifyEmailOTP(email, token) {
    const res = await fetch(`${API_BASE_URL}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token }),
    });
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error('Response is not valid JSON: ' + text);
    }
  }
}

export default new OTPService();