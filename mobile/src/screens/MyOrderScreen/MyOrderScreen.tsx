import React from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import EmployeeHeader from '../../components/EmployeeHeader';
import EmployeeBottomTabBar from '../../components/EmployeeBottomTabBar';
import useMyOrderViewModel from '../../viewmodels/MyOrderScreen/useMyOrderViewModel';

const PRIMARY_COLOR = '#0F7B5E';
const SECONDARY_COLOR = '#F9FAFB';
const BORDER_COLOR = '#E5E7EB';
const BADGE_COLORS = {
    pending: '#F59E0B',
    confirmed: '#3B82F6',
    in_progress: '#8B5CF6',
    completed: PRIMARY_COLOR,
    cancelled: '#EF4444',
    default: '#6B7280',
};

export default function MyOrderScreen() {
    const navigation = useNavigation();
    const vm = useMyOrderViewModel();

    const renderOrderCard = ({ item }: { item: any }) => {
        const order = item.order_details || {};
        const customer = order.customer_details || {};
        const service = order.service_details || {};

        const statusConfig = {
            pending: { color: BADGE_COLORS.pending, text: 'Pending' },
            confirmed: { color: BADGE_COLORS.confirmed, text: 'Confirmed' },
            in_progress: { color: BADGE_COLORS.in_progress, text: 'In Progress' },
            completed: { color: BADGE_COLORS.completed, text: 'Completed' },
            cancelled: { color: BADGE_COLORS.cancelled, text: 'Cancelled' },
            default: { color: BADGE_COLORS.default, text: order.status || 'Unknown' },
        };

        const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.default;

        return (
            <TouchableOpacity
                style={styles.orderCard}
                onPress={() => {
                    // Navigate to order detail if needed
                }}
            >
                <View style={styles.orderHeader}>
                    <Text style={styles.orderId}>Order #{order.id?.slice(0, 8) || 'N/A'}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                        <Text style={styles.statusText}>{status.text}</Text>
                    </View>
                </View>

                <View style={styles.orderInfo}>
                    <Text style={styles.infoLabel}>Customer:</Text>
                    <Text style={styles.infoValue}>{customer.name || 'N/A'}</Text>
                </View>

                <View style={styles.orderInfo}>
                    <Text style={styles.infoLabel}>Service:</Text>
                    <Text style={styles.infoValue}>{service.name || 'N/A'}</Text>
                </View>

                {order.preferred_start_time && (
                    <View style={styles.orderInfo}>
                        <Text style={styles.infoLabel}>Schedule:</Text>
                        <Text style={styles.infoValue}>
                            {new Date(order.preferred_start_time).toLocaleString('en-US', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </Text>
                    </View>
                )}

                <View style={styles.orderInfo}>
                    <Text style={styles.infoLabel}>Address:</Text>
                    <Text style={styles.infoValue} numberOfLines={2}>
                        {customer.address || 'N/A'}
                    </Text>
                </View>

                <View style={styles.orderInfo}>
                    <Text style={styles.infoLabel}>Area:</Text>
                    <Text style={styles.infoValue}>{order.area_m2 || '0'} m²</Text>
                </View>

                <View style={styles.orderInfo}>
                    <Text style={styles.infoLabel}>Work Hours:</Text>
                    <Text style={styles.infoValue}>
                        {item.work_hours || order.requested_hours || '0'} hours
                    </Text>
                </View>

                {order.cost_confirm && (
                    <View style={styles.orderInfo}>
                        <Text style={styles.infoLabel}>Total:</Text>
                        <Text style={[styles.infoValue, styles.priceText]}>
                            {Number(order.cost_confirm).toLocaleString('vi-VN')} đ
                        </Text>
                    </View>
                )}

                {order.note && (
                    <View style={styles.orderInfo}>
                        <Text style={styles.infoLabel}>Note:</Text>
                        <Text style={styles.infoValue} numberOfLines={2}>
                            {order.note}
                        </Text>
                    </View>
                )}

                {item.assigned_time && (
                    <Text style={styles.assignedTime}>
                        Assigned at: {new Date(item.assigned_time).toLocaleString('en-US')}
                    </Text>
                )}
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Orders</Text>
            <Text style={styles.emptySubtitle}>You have not been assigned any orders yet</Text>
        </View>
    );

    const renderError = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.errorTitle}>Error Occurred</Text>
            <Text style={styles.errorSubtitle}>{vm.error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={vm.refresh}>
                <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <EmployeeHeader showProfile={true} />

            <View style={styles.header}>
                <Text style={styles.title}>My Orders</Text>
                <Text style={styles.subtitle}>
                    {vm.orders.length} assigned orders
                </Text>
            </View>

            {vm.error && !vm.loading ? (
                renderError()
            ) : (
                <FlatList
                    data={vm.orders}
                    renderItem={renderOrderCard}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={vm.loading}
                            onRefresh={vm.refresh}
                            colors={['#0F7B5E']}
                        />
                    }
                    ListEmptyComponent={!vm.loading ? renderEmptyState : null}
                    ListFooterComponent={
                        vm.loading && vm.orders.length === 0 ? (
                            <ActivityIndicator size="large" color="#0F7B5E" style={{ marginTop: 20 }} />
                        ) : null
                    }
                />
            )}

            <EmployeeBottomTabBar activeTab="orders" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: SECONDARY_COLOR,
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: BORDER_COLOR,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        marginBottom: 8,
        elevation: 2,
        shadowColor: PRIMARY_COLOR,
        shadowOpacity: 0.04,
        shadowRadius: 4,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: PRIMARY_COLOR,
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 15,
        color: '#6B7280',
        fontWeight: '500',
    },
    listContainer: {
        padding: 16,
        paddingBottom: 100,
    },
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 18,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: BORDER_COLOR,
        shadowColor: PRIMARY_COLOR,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 4,
        elevation: 3,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    orderId: {
        fontSize: 17,
        fontWeight: '700',
        color: PRIMARY_COLOR,
    },
    statusBadge: {
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderRadius: 14,
        minWidth: 80,
        alignItems: 'center',
    },
    statusText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.5,
    },
    orderInfo: {
        flexDirection: 'row',
        marginBottom: 7,
    },
    infoLabel: {
        fontSize: 15,
        color: PRIMARY_COLOR,
        fontWeight: '600',
        width: 110,
    },
    infoValue: {
        flex: 1,
        fontSize: 15,
        color: '#111827',
        fontWeight: '500',
    },
    priceText: {
        fontWeight: '700',
        color: PRIMARY_COLOR,
    },
    assignedTime: {
        fontSize: 13,
        color: '#9CA3AF',
        marginTop: 8,
        fontStyle: 'italic',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: PRIMARY_COLOR,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 15,
        color: '#6B7280',
        textAlign: 'center',
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#EF4444',
        marginBottom: 8,
    },
    errorSubtitle: {
        fontSize: 15,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: PRIMARY_COLOR,
        paddingHorizontal: 28,
        paddingVertical: 14,
        borderRadius: 10,
        marginTop: 8,
    },
    retryText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
        letterSpacing: 0.5,
    },
});