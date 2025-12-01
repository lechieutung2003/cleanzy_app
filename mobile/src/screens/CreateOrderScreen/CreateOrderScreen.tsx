import React from 'react';
import {
  SafeAreaView,
  TextInput,
  StatusBar,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePickerInput from '../../components/DateTimePickerInput';
import useCreateOrderViewModel from '../../viewmodels/CreateOrderScreen/useCreateOrderViewModel';

export default function CreateOrderScreen() {
  const navigation = useNavigation();
  const {
    customerInfo,
    serviceTypes,
    selectedServiceType,
    formData,
    loading,
    error,
    totalHours,
    totalPrice,
    updateFormField,
    selectServiceType,
    createOrder,
  } = useCreateOrderViewModel();

  function formatDateTime(input?: string) {
    if (!input) return '';
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) return input;
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}
  ${d.toLocaleDateString()}`;
  }

  const handleConfirm = async () => {
    if (formData.payment_method === 'BANK_TRANSFER') {
      const result = await createOrder();
      
      if (result.success && result.paymentInfo) {
        // Navigate to payment screen with payment info
        (navigation as any).navigate('Payment', {
          order_id: result.order_id,
          payment_id: result.paymentInfo.payment_id,
          amount: result.paymentInfo.amount,
          paymentUrl: result.paymentInfo.payment_url,
          qrCode: result.paymentInfo.qr_code,
          orderCode: result.paymentInfo.order_code,
          accountNumber: result.paymentInfo.account_number,
          accountName: result.paymentInfo.account_name,
          transferContent: result.paymentInfo.transfer_content,
          bankName: result.paymentInfo.bank_name,
        });
      } else if (result.error) {
        Alert.alert('Error', result.error);
      }
    } else if (formData.payment_method === 'CASH') {
      const result = await createOrder();
      console.log("result: ", result);
      
      if (result.success) {
        (navigation as any).navigate('Invoice', {
          orderId: result.data.id, // Assuming the order ID is returned in the response
          invoice: {
            name: result.data?.customer_details.name ?? '',
            phone: result.data?.customer_details.phone ?? '',
            address: result.data?.customer_details.address ?? '',
            type: result.data?.service_details.name ?? '',
            area: result.data?.area_m2 ?? (result.data?.area_m2 ? `${result.data.area_m2} m2` : ''),
            startTime: formatDateTime(result.data?.preferred_start_time),
            endTime: formatDateTime(result.data?.preferred_end_time),
            note: result.data?.admin_log ?? 'none',
            duration: result.data?.requested_hours ?? '',
            method: result.data?.payment_method_display ?? '',
            price: result.data?.cost_confirm ?? 'unknown',
            vat: typeof result.data?.vat === 'number' ? result.data.vat : 0.1,
          },
        });
      } else if (result.error) {
        Alert.alert('Error', result.error);
      }
    }
  };

  if (loading && !customerInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0F7B5E" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* ...existing code... */}

        <Text style={styles.title}>Create Order</Text>

        {/* Service Type */}
        <Text style={styles.label}>Service Type</Text>
        <TextInput
          style={styles.input}
          value={selectedServiceType?.name || ''}
          editable={false}
        />
        <Text style={styles.priceInfo}>
          {selectedServiceType?.price_per_m2.toLocaleString() || 0} VND / 1m2
        </Text>

        {/* Area */}
        <Text style={styles.label}>Area (m2)</Text>
        <TextInput
          style={styles.input}
          value={formData.area_m2.toString()}
          onChangeText={(text) => updateFormField('area_m2', parseFloat(text) || 0)}
          keyboardType="numeric"
        />

        {/* Start time */}
        <Text style={styles.label}>Start time</Text>
        <DateTimePickerInput
          label="Start time"
          value={formData.preferred_start_time}
          onChange={(date) => updateFormField('preferred_start_time', date)}
        />

        {/* End time */}
        <Text style={styles.label}>End time</Text>
        <DateTimePickerInput
          label="End time"
          value={formData.preferred_end_time}
          onChange={(date) => updateFormField('preferred_end_time', date)}
        />

        {/* Note */}
        <Text style={styles.label}>Note</Text>
        <TextInput
          style={styles.input}
          value={formData.note}
          onChangeText={(text) => updateFormField('note', text)}
          multiline
        />

        {/* Customer Information */}
        <View style={styles.customerInfo}>
          <Text style={styles.customerTitle}>Customer information</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{customerInfo?.name || 'N/A'}</Text>
            </View>

            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{customerInfo?.phone_number || 'N/A'}</Text>
            </View>

            <View style={[styles.infoCell, styles.fullWidth]}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{customerInfo?.address || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <Text style={styles.paymentTitle}>Payment</Text>
        <View style={styles.paymentButtons}>
          <TouchableOpacity
            style={[
              styles.paymentButton,
              formData.payment_method === 'CASH' && styles.paymentButtonActive
            ]}
            onPress={() => updateFormField('payment_method', 'CASH')}
          >
            <Text style={[
              styles.paymentButtonText,
              formData.payment_method === 'CASH' && styles.paymentButtonTextActive
            ]}>
              Cash
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentButton,
              formData.payment_method === 'BANK_TRANSFER' && styles.paymentButtonActive
            ]}
            onPress={() => updateFormField('payment_method', 'BANK_TRANSFER')}
          >
            <Text style={[
              styles.paymentButtonText,
              formData.payment_method === 'BANK_TRANSFER' && styles.paymentButtonTextActive
            ]}>
              Bank transfer
            </Text>
          </TouchableOpacity>
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Time : {totalHours}h</Text>
            <Text style={styles.summaryPrice}>{totalPrice.toLocaleString()} VND</Text>
          </View>
        </View>

        {/* Confirm Button */}
        <TouchableOpacity 
          style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm</Text>
          )}
        </TouchableOpacity>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  fullWidth: {
    width: '100%',
  },
  bgImage: {
    flex: 1,
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  bgImageStyle: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButtonImage: {
    width: 58,  
    height: 58,
  },
  header: {
    marginTop: 10,
    marginBottom: 10,
  },
  backButton: {
    top: 40,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0F7B5E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    top: 20,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F7B5E',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#0F7B5E',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 16,
    color: '#666',
  },
  priceInfo: {
    fontSize: 14,
    color: '#0F7B5E',
    marginTop: 4,
    marginLeft: 4,
  },
  customerInfo: {
    backgroundColor: '#B8D8D0',
    borderRadius: 20,
    padding: 20,
    marginTop: 24,
  },
  customerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoCell: {
    width: '48%',
    marginBottom: 10,
  },
  infoLabel: { fontSize: 14, fontWeight: '600', color: '#000' },
  infoValue: { fontSize: 14, color: '#616161', marginTop: 4 },
  paymentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  paymentButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#0F7B5E',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
  },
  paymentButtonActive: {
    backgroundColor: '#0F7B5E',
  },
  paymentButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F7B5E',
  },
  paymentButtonTextActive: {
    color: '#fff',
  },
  summary: {
    marginTop: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#0F7B5E',
    fontWeight: '600',
  },
  summaryPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F7B5E',
  },
  confirmButton: {
    backgroundColor: '#0F7B5E',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#0F7B5E',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    color: '#ff0000',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
});