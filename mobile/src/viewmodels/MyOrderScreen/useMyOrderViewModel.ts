import { useState, useEffect, useCallback } from 'react';
import EmployeeService from '../../services/employee';

type Order = {
    id: string;
    customer_name?: string;
    service_type?: string;
    status?: string;
    scheduled_date?: string;
    address?: string;
    total_price?: number;
    [key: string]: any;
};

type Assignment = {
    id: string;
    order: Order;
    assigned_at?: string;
    status?: string;
    notes?: string;
};

export default function useMyOrderViewModel() {
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState<Assignment[]>([]);
    const [error, setError] = useState<string | null>(null);

    const transformAssignment = (raw: any): Assignment => {
        const orderDetails = raw.order_details || {};
        const customerDetails = orderDetails.customer_details || {};
        const serviceDetails = orderDetails.service_details || {};

        return {
            id: raw.id,
            status: raw.status,
            assigned_at: raw.assigned_time || raw.created_at,
            notes: raw.notes || '',
            order: {
                id: orderDetails.id || raw.order,
                customer_name: customerDetails.full_name || customerDetails.first_name || 'N/A',
                service_type: serviceDetails.name || serviceDetails.service_type || 'N/A',
                status: orderDetails.status || 'pending',
                scheduled_date: orderDetails.preferred_start_time || orderDetails.scheduled_date,
                address: orderDetails.address || customerDetails.address || 'N/A',
                total_price: parseFloat(orderDetails.total_price || orderDetails.final_price || '0'),
                // Keep original for reference
                _raw: orderDetails,
            },
        };
    };

    const loadOrders = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const result = await EmployeeService.getMyAssignedOrders(params);
            // Backend trả về array of assignments
            setOrders(Array.isArray(result) ? result : []);
        } catch (err: any) {
            console.error('useMyOrderViewModel - loadOrders error:', err);
            setError(err?.message || 'Không thể tải danh sách đơn hàng');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const refresh = useCallback(() => {
        return loadOrders();
    }, [loadOrders]);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    return {
        loading,
        orders,
        error,
        refresh,
        loadOrders,
    };
}