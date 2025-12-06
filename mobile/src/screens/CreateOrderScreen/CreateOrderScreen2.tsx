import React from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import useCreateOrderViewModel2 from '../../viewmodels/CreateOrderScreen/useCreateOrderViewModel2';

export default function CreateOrderScreen2() {
    const route = useRoute<any>();
    const pricingResult = route.params?.pricingResult;
    const navigation = useNavigation();
    const {
        customerInfo,
        selectedServiceType,
        formData,
        loading,
        error,
        totalHours,
        totalPrice,
        createOrder,
        updateFormField,
    } = useCreateOrderViewModel2();

    function formatDateTime(input?: string | Date) {
        if (!input) return '';
        const d = typeof input === 'string' ? new Date(input) : input;
        if (Number.isNaN(d.getTime())) return '';
        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} ${d.toLocaleDateString()}`;
    }

    const handleConfirm = async () => {
        const result = await createOrder();
        if (!result) return;
        if (result.success && result.paymentInfo) {
            (navigation as any).navigate('Payment', {
                order_id: result.order_id,
                payment_id: result.paymentInfo.payment_id,
                amount: pricingResult ?? result.paymentInfo.amount,
                paymentUrl: result.paymentInfo.payment_url,
                qrCode: result.paymentInfo.qr_code,
                orderCode: result.paymentInfo.order_code,
                accountNumber: result.paymentInfo.account_number,
                accountName: result.paymentInfo.account_name,
                transferContent: result.paymentInfo.transfer_content,
                bankName: result.paymentInfo.bank_name,
            });
            return;
        }
        if (result.success) {
            (navigation as any).navigate('Invoice', {
                orderId: result.data?.id ?? result.order_id,
                invoice: {
                    name: result.data?.customer_details?.name ?? customerInfo?.name ?? '',
                    phone: result.data?.customer_details?.phone ?? customerInfo?.phone ?? '',
                    address: result.data?.customer_details?.address ?? customerInfo?.address ?? '',
                    type: result.data?.service_details?.name ?? selectedServiceType?.name ?? '',
                    area: result.data?.area_m2 ?? `${formData.area_m2} m2`,
                    startTime: formatDateTime(result.data?.preferred_start_time),
                    endTime: formatDateTime(result.data?.preferred_end_time),
                    note: result.data?.admin_log ?? formData.note ?? '',
                    duration: result.data?.requested_hours ?? formData.requested_hours,
                    method: result.data?.payment_method_display ?? formData.payment_method,
                    price: pricingResult,
                    vat: typeof result.data?.vat === 'number' ? result.data.vat : 0.1,
                },
            });
            return;
        }
        if (result.error) {
            Alert.alert('Lỗi', result.error);
        }
    };

    if (loading && !customerInfo) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0F7B5E" />
                    <Text style={styles.loadingText}>Đang tải...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 40 }}>
                <Text style={styles.title}>Tính toán & Xác nhận đơn hàng</Text>

                <View style={styles.section}>
                    <Text style={styles.label}>Loại dịch vụ</Text>
                    <Text style={styles.value}>{selectedServiceType?.name || ''}</Text>
                    <Text style={styles.priceInfo}>{selectedServiceType?.price_per_m2?.toLocaleString() || 0} VND / m²</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Diện tích</Text>
                    <Text style={styles.value}>{formData.area_m2} m²</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Thời gian</Text>
                    <Text style={styles.value}>
                        {formatDateTime(formData.preferred_start_time)} - {formatDateTime(formData.preferred_end_time)}
                    </Text>
                    <Text style={styles.value}>Tổng thời gian: {totalHours} giờ</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Ghi chú</Text>
                    <Text style={styles.value}>{formData.note || '(Không có)'}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Khách hàng</Text>
                    <View style={styles.customerGrid}>
                        <View style={styles.customerCol}>
                            <View style={styles.iconRow}>
                                <Text style={styles.gridLabel}>Tên</Text>
                            </View>
                            <Text style={styles.gridValue}>{customerInfo?.name || 'N/A'}</Text>
                        </View>
                        <View style={styles.customerCol}>
                            <View style={styles.iconRow}>
                                <Text style={styles.gridLabel}>SĐT</Text>
                            </View>
                            <Text style={styles.gridValue}>{customerInfo?.phone || 'N/A'}</Text>
                        </View>
                    </View>
                    <View style={styles.customerGrid}>
                        <View style={styles.customerCol}>
                            <View style={styles.iconRow}>
                                <Text style={styles.gridLabel}>Địa chỉ</Text>
                            </View>
                            <Text style={styles.gridValue}>{customerInfo?.address || 'N/A'}</Text>
                        </View>
                        <View style={styles.customerCol}>
                            <View style={styles.iconRow}>
                                <Text style={styles.gridLabel}>Khu vực</Text>
                            </View>
                            <Text style={styles.gridValue}>{customerInfo?.area || 'N/A'}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Phương thức thanh toán</Text>
                    <View style={styles.paymentButtons}>
                        <TouchableOpacity
                            style={[
                                styles.paymentButton,
                                formData.payment_method === 'CASH' && styles.paymentButtonActive,
                            ]}
                            onPress={() => updateFormField('payment_method', 'CASH')}
                        >
                            <Text style={[
                                styles.paymentButtonText,
                                formData.payment_method === 'CASH' && styles.paymentButtonTextActive,
                            ]}>Tiền mặt</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.paymentButton,
                                formData.payment_method === 'BANK_TRANSFER' && styles.paymentButtonActive,
                            ]}
                            onPress={() => updateFormField('payment_method', 'BANK_TRANSFER')}
                        >
                            <Text style={[
                                styles.paymentButtonText,
                                formData.payment_method === 'BANK_TRANSFER' && styles.paymentButtonTextActive,
                            ]}>Chuyển khoản</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.summary}>
                    <Text style={styles.summaryLabel}>Tổng tiền</Text>
                    <Text style={styles.summaryPrice}>{pricingResult.toLocaleString()} VND</Text>
                </View>

                <TouchableOpacity
                    style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
                    onPress={handleConfirm}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmButtonText}>Xác nhận & Tạo đơn</Text>}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => {
                        Alert.alert(
                            'Bạn muốn làm gì?',
                            'Chọn một hành động bên dưới:',
                            [
                                {
                                    text: 'Hủy đơn hàng',
                                    style: 'destructive',
                                    onPress: () => (navigation as any).navigate('MainTabs'), // hoặc màn hình bạn muốn về
                                },
                                {
                                    text: 'Quay lại sửa thông tin',
                                    onPress: () => (navigation as any).goBack(), // hoặc goBack nếu dùng stack
                                },
                                { text: 'Đóng', style: 'cancel' }
                            ]
                        );
                    }}
                >
                    <Text style={{ color: '#0F7B5E', textAlign: 'center' }}>Quay lại</Text>
                </TouchableOpacity>

                {error && <Text style={styles.errorText}>{error}</Text>}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    scrollView: { flex: 1, paddingHorizontal: 20 },
    title: { marginTop: 28, fontSize: 22, fontWeight: '700', color: '#0F7B5E', textAlign: 'center', marginBottom: 18 },
    section: { marginBottom: 18 },
    label: { fontSize: 16, fontWeight: '600', marginBottom: 7, color: '#0F7B5E' },
    value: { fontSize: 16, color: '#222', marginBottom: 3 },
    priceInfo: { fontSize: 14, color: '#0F7B5E', marginTop: 2 },
    paymentButtons: { flexDirection: 'row', gap: 12 },
    paymentButton: { flex: 1, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#B8D8D0', borderRadius: 25, paddingVertical: 12, alignItems: 'center' },
    paymentButtonActive: { backgroundColor: '#0F7B5E' },
    paymentButtonText: { color: '#0F7B5E', fontWeight: '600' },
    paymentButtonTextActive: { color: '#fff' },
    summary: {paddingVertical: 8, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#ddd', alignItems: 'center' },
    summaryLabel: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    summaryPrice: { fontSize: 20, fontWeight: '700', color: '#0F7B5E' },
    confirmButton: { backgroundColor: '#0F7B5E', borderRadius: 25, paddingVertical: 14, alignItems: 'center', marginTop: 13 },
    confirmButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    confirmButtonDisabled: { opacity: 0.6 },
    backButton: { marginTop: 5, paddingVertical: 12, alignItems: 'center' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, color: '#0F7B5E' },
    errorText: { color: '#ff0000', textAlign: 'center', marginTop: 10 },
    iconRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
    customerGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, backgroundColor: '#E6F7F1', padding: 12, borderRadius: 14, shadowColor: '#0F7B5E', shadowOpacity: 0.07, shadowRadius: 4, elevation: 2 },
    customerCol: { flex: 1, marginRight: 10 },
    gridLabel: { fontSize: 14, color: '#0F7B5E', fontWeight: '600', marginLeft: 4 },
    gridValue: { fontSize: 16, color: '#222', fontWeight: '500', marginTop: 2 },
});