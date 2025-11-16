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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import BackButton from '../../components/BackButton';
import PrimaryButton from '../../components/PrimaryButton';
import TextField from '../../components/TextField';

const { width } = Dimensions.get('window');

// ⚠️ THAY ĐỔI URL NÀY THEO BACKEND CỦA BẠN
const BACKEND_WS_URL = 'ws://10.0.2.2:8008'; // Android Emulator
const BACKEND_API_URL = 'http://10.0.2.2:8008'; // Android Emulator
// Nếu dùng thiết bị thật: 'ws://192.168.1.100:8008'

const PendingPaymentScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { order_id, payment_id, orderCode, amount } = route.params || {};

  const [status, setStatus] = useState('PENDING');
  const [message, setMessage] = useState('Đang kiểm tra thanh toán...');
  const [paymentTime, setPaymentTime] = useState('');

  const wsRef = useRef<WebSocket | null>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

        // Stop polling
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }

        // Auto navigate after 2s
        setTimeout(() => {
          (navigation as any).navigate('History');
        }, 2000);
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
            `${BACKEND_API_URL}/api/v1/payments/status/${orderCode}/`
          );

          if (response.ok) {
            const data = await response.json();
            console.log('📊 Payment status:', data);

            if (data.status === 'PAID') {
              console.log('✅ Payment confirmed by polling');
              // WebSocket sẽ tự động nhận event, không cần xử lý thêm
            }
          }
        } catch (error) {
          console.error('❌ Polling error:', error);
        }
      }, 5000); // Poll every 5 seconds
    };

    startPolling();

    // ============================================
    // 3. CLEANUP
    // ============================================
    return () => {
      console.log('🧹 Cleanup: Closing WebSocket and polling');
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
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

          {/* View history button */}
          <PrimaryButton
            title="View history"
            onPress={() => (navigation as any).navigate('History')}
            style={styles.historyBtn}
          />
        </View>
      </ScrollView>
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
    borderRadius: 25,
  },
});

export default PendingPaymentScreen;
