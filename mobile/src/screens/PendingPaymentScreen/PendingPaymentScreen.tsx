import React, { useEffect, useState, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import BackButton from '../../components/BackButton';
import PrimaryButton from '../../components/PrimaryButton';
import TextField from '../../components/TextField';

const { width } = Dimensions.get('window');

// ⚠️ THAY ĐỔI URL NÀY THEO BACKEND CỦA BẠN
const BACKEND_WS_URL = 'ws://10.0.2.2:8009'; // Android Emulator
const BACKEND_API_URL = 'http://10.0.2.2:8009'; // Android Emulator
// Nếu dùng thiết bị thật: 'ws://192.168.1.100:8009'

const PendingPaymentScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { order_id, payment_id, orderCode, amount } = route.params || {};

  const [status, setStatus] = useState('PENDING');
  const [message, setMessage] = useState('Đang kiểm tra thanh toán...');
  const [paymentTime, setPaymentTime] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showViewHistory, setShowViewHistory] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const paymentMethod = 'Bank transfer';
  const formatAmount = (n?: number) =>
    typeof n === 'number' ? `${n.toLocaleString('vi-VN')} VND` : '0 VND';

  useEffect(() => {
    if (!order_id || !orderCode) {
      setMessage('❌ Thiếu thông tin đơn hàng');
      return;
    }

    // Record payment time
    const now = new Date();
    setPaymentTime(now.toLocaleString('vi-VN'));

    // ============================================
    // 1. KẾT NỐI WEBSOCKET
    // ============================================
    const ws = new WebSocket(`${BACKEND_WS_URL}/ws/payments/${order_id}/`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('✅ WebSocket connected');
      setMessage('Đã kết nối, đang chờ xác nhận từ ngân hàng...');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('📨 WebSocket event:', data);

      // EVENT: payment.success
      if (data.type === 'payment.success') {
        console.log('🎉 Payment successful!');
        setStatus('PAID');
        setMessage('✅ Thanh toán thành công!');
        setShowSuccessModal(true);
        setShowViewHistory(true);
        setTimeoutReached(false);

        // Stop polling and timeout
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        // Auto hide modal and navigate to History with paid filter after 4s
        setTimeout(() => {
          setShowSuccessModal(false);
          (navigation as any).navigate('MainTabs', { tab: 'history', filter: 'PAID' });
        }, 4000);
      }

      // EVENT: payment.cancelled
      if (data.type === 'payment.cancelled') {
        console.log('❌ Payment cancelled');
        setStatus('CANCELLED');
        setMessage('❌ Thanh toán đã bị hủy');
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      setMessage('⚠️ Lỗi kết nối, vẫn đang kiểm tra...');
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket disconnected');
    };

    // ============================================
    // 2. POLLING - Check PayOS status
    // ============================================
    const startPolling = () => {
      pollingIntervalRef.current = setInterval(async () => {
        try {
          console.log('🔄 Polling payment status...');
          const response = await fetch(
            `${BACKEND_API_URL}/api/payments/status/${orderCode}/`
          );

          if (response.ok) {
            const text = await response.text();
            try {
              const data = JSON.parse(text);
              console.log('📊 Payment status:', data);

              if (data.status === 'PAID') {
                console.log('✅ Payment confirmed by polling');
                setStatus('PAID');
                setMessage('✅ Thanh toán thành công!');
                setShowSuccessModal(true);
                setShowViewHistory(true);
                setTimeoutReached(false);
                if (pollingIntervalRef.current) {
                  clearInterval(pollingIntervalRef.current);
                }
                if (timeoutRef.current) {
                  clearTimeout(timeoutRef.current);
                  timeoutRef.current = null;
                }

                // Auto hide modal and navigate to History with paid filter after 4s
                setTimeout(() => {
                  setShowSuccessModal(false);
                  (navigation as any).navigate('MainTabs', { tab: 'history', filter: 'PAID' });
                }, 4000);
              }
            } catch (err) {
              console.error('❌ Polling error: Response is not JSON', text);
            }
          }
        } catch (error) {
          console.error('❌ Polling error:', error);
        }
      }, 5000); // Poll every 5 seconds
    };

    startPolling();

    // ============================================
    // 3. TIMEOUT - Stop after 15s if not successful
    // ============================================
    timeoutRef.current = setTimeout(async () => {
      if (status !== 'PAID') {
        console.log('⏰ Timeout reached: Payment not successful');
        setTimeoutReached(true);
        setMessage('Payment verification timeout. Please contact support using the information below.');

        // Stop polling
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }

        // Update order status to REFUND
        try {
          console.log(`📤 Updating order ${order_id} to REFUND status...`);
          const response = await fetch(
            `${BACKEND_API_URL}/api/orders/${order_id}/updateStatus/`,
            {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ status: 'REFUND' }),
            }
          );

          const responseText = await response.text();
          console.log(`📊 API Response (${response.status}):`, responseText);

          if (response.ok) {
            console.log('✅ Order status updated to REFUND');
          } else {
            console.error('❌ Failed to update order status:', responseText);
          }
        } catch (error) {
          console.error('❌ Error updating order status:', error);
        }
      }
    }, 15000);

    // ============================================
    // 4. CLEANUP
    // ============================================
    return () => {
      console.log('🧹 Cleanup: Closing WebSocket and polling');
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [order_id, orderCode, navigation]);

  return (
    <SafeAreaView style={styles.safe}>
      <BackButton />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>
            {status === 'PAID' ? 'Payment Successful' : 'Pending checking payment'}
          </Text>

          {/* Loading/Status icon */}
          <View style={styles.loadingContainer}>
            {status === 'PENDING' && (
              <ActivityIndicator size="large" color="#047857" />
            )}
            {status === 'PAID' && (
              <Text style={styles.successIcon}>✅</Text>
            )}
            {status === 'CANCELLED' && (
              <Text style={styles.errorIcon}>❌</Text>
            )}
          </View>

          <Text style={styles.subtitle}>{message}</Text>

          {status === 'PENDING' && (
            <Text style={styles.info}>
              💡 WebSocket đang kết nối... Polling mỗi 5 giây
            </Text>
          )}

          {/* Payment info */}
          <View style={styles.form}>
            <Text style={styles.label}>Payment amount</Text>
            <TextField value={formatAmount(amount)} editable={false} />

            <Text style={styles.label}>Payment method</Text>
            <TextField value={paymentMethod} editable={false} />

            <Text style={styles.label}>Payment time</Text>
            <TextField value={paymentTime} editable={false} />
          </View>

          {/* Contact info box */}
          <View style={styles.contactBox}>
            <Text style={styles.contactTitle}>
              If the verification takes longer than expected, don't hesitate to contact us:
            </Text>

            <View style={styles.contactItem}>
              <Image
                source={require('../../assets/phone_icon.png')}
                style={styles.contactIconImg}
                resizeMode="contain"
              />
              <Text style={styles.contactText}>+84-123-456-789</Text>
            </View>

            <View style={styles.contactItem}>
              <Image
                source={require('../../assets/mail_icon.png')}
                style={styles.contactIconImg}
                resizeMode="contain"
              />
              <Text style={styles.contactText}>support@cleanzy.com</Text>
            </View>

            <View style={styles.contactItem}>
              <Image
                source={require('../../assets/location2_icon.png')}
                style={styles.contactIconImg}
                resizeMode="contain"
              />
              <Text style={styles.contactText}>
                54 Nguyen Luong Bang Street, Lien Chieu Ward, Da Nang City
              </Text>
            </View>
          </View>

          {/* Timeout message */}
          {timeoutReached && (
            <>
              <View style={styles.timeoutBox}>
                <Text style={styles.timeoutText}>
                  ⚠️ Payment verification timeout. If you have completed the payment, please contact us using the information above. Our admin will verify and process your refund if needed.
                </Text>
              </View>
              <PrimaryButton
                title="View history"
                onPress={() => (navigation as any).navigate('MainTabs', { tab: 'history', filter: 'refund' })}
                style={styles.historyBtn}
              />
            </>
          )}

          {/* View history button - only show when PAID */}
          {showViewHistory && (
            <PrimaryButton
              title="View history"
              onPress={() => (navigation as any).navigate('MainTabs', { tab: 'history', filter: 'PAID' })}
              style={styles.historyBtn}
            />
          )}
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalIcon}>✅</Text>
            <Text style={styles.modalTitle}>Payment Successful!</Text>
            <Text style={styles.modalSubtitle}>Redirecting to history...</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff', paddingTop: 70 },
  scrollView: { flex: 1 },
  container: {
    paddingBottom: 20,
  },
  content: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  title: {
    marginTop: 10,
    fontSize: 26,
    fontWeight: '700',
    color: '#047857',
    textAlign: 'center',
  },
  loadingContainer: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIcon: {
    width: 100,
    height: 100,
  },
  successIcon: {
    fontSize: 80,
    marginVertical: 10,
  },
  errorIcon: {
    fontSize: 80,
    marginVertical: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  info: {
    fontSize: 12,
    color: '#047857',
    textAlign: 'center',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  form: {
    width: '100%',
    marginTop: 6,
  },
  label: {
    marginTop: 10,
    marginBottom: 5,
    color: '#6b7280',
    fontSize: 14,
  },
  contactBox: {
    width: '100%',
    marginTop: 20,
    padding: 14,
    backgroundColor: '#d1fae5',
    borderRadius: 12,
  },
  contactTitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 10,
    lineHeight: 18,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 7,
  },
  contactIconImg: {
    width: 19,
    height: 19,
    marginRight: 8,
    tintColor: '#047857',
  },
  contactText: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  historyBtn: {
    width: '70%',
    marginTop: 20,
  },
  timeoutBox: {
    width: '100%',
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  timeoutText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#047857',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    borderRadius: 25,
  },
});

export default PendingPaymentScreen;
