import BaseService from './base';

class EmployeeService extends BaseService {
    get entity() {
        return 'employees';
    }

    // Lấy profile của employee
    async getMyProfile() {
        const result = await this.get(`/api/v1/${this.entity}/my-profile`);
        console.log('EmployeeService - getMyProfile result:', result);
        return result;
    }

    // Lấy danh sách đơn hàng được gán cho nhân viên hiện tại
    async getMyAssignedOrders(params = {}) {
        try {
            const result = await this.get('/api/v1/employee-orders', params);
            console.log('EmployeeService - getMyAssignedOrders result:', result);
            return result;
        } catch (error) {
            console.error('EmployeeService - getMyAssignedOrders error:', error);
            throw error;
        }
    }

    // Lấy chi tiết 1 đơn hàng được gán (nếu backend hỗ trợ)
    async getAssignedOrderDetail(assignmentId) {
        try {
            const result = await this.get(`/api/v1/employee-orders/${assignmentId}`);
            console.log('EmployeeService - getAssignedOrderDetail result:', result);
            return result;
        } catch (error) {
            console.error('EmployeeService - getAssignedOrderDetail error:', error);
            throw error;
        }
    }

    // new: lấy salary cho 1 tháng (format month: "YYYY-MM")
    async getSalaryByMonth(month) {
        // backend endpoint expected: /api/v1/employees/salary?month=YYYY-MM
        // nếu backend không tồn tại, fallback về my-profile
        try {
            const res = await this.get(`/api/v1/${this.entity}/salary`, { month });
            return res;
        } catch (err) {
            // fallback: try my-profile (may contain aggregated salary field)
            return this.getMyProfile();
        }
    }

    // new: lấy salary history (last N months) nếu backend hỗ trợ
    async getSalaryHistory(months = 6) {
        try {
            const res = await this.get(`/api/v1/${this.entity}/salary-history`, { months });
            return res;
        } catch (err) {
            // fallback empty array
            return { history: [] };
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

    // Cập nhật thông tin cá nhân của nhân viên
    async updateMyProfile(data) {
        // Xử lý dữ liệu nếu cần (loại bỏ các trường không cần thiết)
        // Ví dụ: delete data.id;
        return this.patch(`/api/v1/${this.entity}/update-my-profile`, data);
    }
}

export default new EmployeeService();