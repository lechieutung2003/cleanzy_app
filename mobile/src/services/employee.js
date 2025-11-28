import BaseService from './base';
import AsyncStorage from '@react-native-async-storage/async-storage';

class EmployeeService extends BaseService {
    get entity() {
        return 'employees';
    }

    // Lấy profile của employee
    async getMyProfile() {
        const result = await this.get(`/api/v1/${this.entity}/my-profile`);

        // Check xem ngày hôm nay có khác ngày lần trước không
        await this.checkAndResetDailyHours(result);

        return result;
    }

    // Kiểm tra nếu qua ngày thì reset
    async checkAndResetDailyHours(profileData) {
        try {
            const lastDate = await AsyncStorage.getItem('last_work_date');
            const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

            // Nếu hôm nay khác hôm trước
            if (lastDate && lastDate !== today) {
                console.log(`Day changed: ${lastDate} → ${today}`);

                // Nếu profile còn có giờ làm, gọi API reset
                if (profileData?.working_start_time || profileData?.working_end_time) {
                    console.log('Resetting working hours for new day');
                    await this.setWorkingHours({
                        working_start_time: null,
                        working_end_time: null
                    });
                }
            }

            // Lưu ngày hôm nay
            await AsyncStorage.setItem('last_work_date', today);
        } catch (err) {
            console.warn('checkAndResetDailyHours error:', err);
        }
    }

    // Cập nhật giờ làm việc thủ công
    async setWorkingHours({ working_start_time, working_end_time }) {
        // Ghi rõ nếu truyền undefined thì bỏ, còn truyền null/'' thì vẫn gửi
        const payload = {};
        if (working_start_time !== undefined) payload.working_start_time = working_start_time;
        if (working_end_time !== undefined) payload.working_end_time = working_end_time;

        return this.patch(`/api/v1/${this.entity}/update-my-profile`, payload);
    }

    // Check-in: set working_start_time = now
    async checkIn() {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const start = `${hh}:${mm}`;
        return this.patch(`/api/v1/${this.entity}/update-my-profile`, {
            working_start_time: start,
        });
    }

    // Check-out: set working_end_time = now
    async checkOut() {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const end = `${hh}:${mm}`;
        return this.patch(`/api/v1/${this.entity}/update-my-profile`, {
            working_end_time: end,
        });
    }
}

export default new EmployeeService();