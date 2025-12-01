import { useState, useEffect, useCallback } from 'react';
import EmployeeService from '../../services/employee';
import OrderService from '../../services/order'; 

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

    // // new: change assignment status (optimistic update + fallback reload)
    // const changeAssignmentStatus = useCallback(async (assignmentId: string, newStatus: string) => {
    //     setLoading(true);
    //     setError(null);
    //     try {
    //         const updated = await EmployeeService.updateAssignmentStatus(assignmentId, { status: newStatus });
    //         if (updated) {
    //             // Try to update local list without full reload
    //             setOrders(prev =>
    //                 prev.map(a => (a.id === assignmentId ? { ...a, status: updated.status || newStatus, order_details: updated.order_details || a.order_details, assigned_time: updated.assigned_time || a.assigned_time } : a))
    //             );
    //         } else {
    //             // fallback: reload from server
    //             await loadOrders();
    //         }
    //     } catch (err: any) {
    //         console.error('changeAssignmentStatus error:', err);
    //         setError(err?.message || 'Không thể cập nhật trạng thái đơn hàng');
    //     } finally {
    //         setLoading(false);
    //     }
    // }, [loadOrders]);

    // new: change assignment/order status (call orders/{id}/updateStatus)
    const changeAssignmentStatus = useCallback(async (assignmentId: string, orderId: string, newStatus: string) => {
        setLoading(true);
        setError(null);
        try {
            // Call order-level update endpoint as web does
            const updatedOrder = await OrderService.updateOrderStatus(orderId, { status: newStatus });

            // If backend returns updated order object, update local assignment(s)
            if (updatedOrder) {
                setOrders(prev =>
                    prev.map(a => {
                        if (a.id === assignmentId || (a.order && String(a.order.id) === String(orderId))) {
                            // keep assignment fields, update embedded order info
                            const updatedOrderDetails = updatedOrder;
                            return {
                                ...a,
                                status: updatedOrderDetails.status || newStatus,
                                order_details: updatedOrderDetails, // for compatibility with UI which uses order_details
                                assigned_time: a.assigned_time,
                            };
                        }
                        return a;
                    })
                );
            } else {
                // fallback to reload list
                await loadOrders();
            }

            // If newStatus === 'completed' call complete endpoint as web did
            if (newStatus === 'completed') {
                try {
                    await OrderService.completeOrder(orderId, updatedOrder?.requested_hours || 0);
                } catch (e) {
                    console.warn('completeOrder failed', e);
                }
            }
        } catch (err: any) {
            console.error('changeAssignmentStatus error:', err);
            setError(err?.message || 'Không thể cập nhật trạng thái đơn hàng');
        } finally {
            setLoading(false);
        }
    }, [loadOrders]);

    const refresh = useCallback(() => loadOrders(), [loadOrders]);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    return {
        loading,
        orders,
        error,
        refresh,
        loadOrders,
        changeAssignmentStatus, // expose it to UI
    };
}