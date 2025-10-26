import React,{useState} from 'react';
import {
View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView
} from 'react-native';
import DateTimePickerInput from '../../components/DateTimePickerInput';
// import useCreateOrderViewModel from '../../viewmodels/CreateOrderScreen/useCreateOrderViewModel';

export default function CreateOrderScreen() {
  const [serviceType, setServiceType] = useState('Regular Clean');
  const [area, setArea] = useState('20');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [note, setNote] = useState('Leave the motorbike outside');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const customerName = 'Vo Thu Thao';
  const customerPhone = '0123456789';
  const customerAddress = '123 Nguyen Luong Bang, Lien Chieu, Da Nang';

  const pricePerM2 = 30000;
  const totalHours = 1;
  const totalPrice = 660000;

  const handleConfirm = () => {
    // Xử lý xác nhận đơn hàng
    console.log('Order confirmed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}

        <Text style={styles.title}>Create Order</Text>

        {/* Service Type */}
        <Text style={styles.label}>Service Type</Text>
        <TextInput
          style={styles.input}
          value={serviceType}
          onChangeText={setServiceType}
        />
        <Text style={styles.priceInfo}>{pricePerM2.toLocaleString()} VND / 1m2</Text>

        {/* Area */}
        <Text style={styles.label}>Area (m2)</Text>
        <TextInput
          style={styles.input}
          value={area}
          onChangeText={setArea}
          keyboardType="numeric"
        />

        {/* Start time */}
        <Text style={styles.label}>Start time</Text>
        <DateTimePickerInput
          label="Start time"
          value={startTime}
          onChange={setStartTime}
        />

        {/* End time */}
        <Text style={styles.label}>End time</Text>
        <DateTimePickerInput
          label="End time"
          value={endTime}
          onChange={setEndTime}
        />

        {/* Note */}
        <Text style={styles.label}>Note</Text>
        <TextInput
          style={styles.input}
          value={note}
          onChangeText={setNote}
        />

        {/* Customer Information */}
        <View style={styles.customerInfo}>
          <Text style={styles.customerTitle}>Customer information</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{customerName}</Text>
            </View>

            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{customerPhone}</Text>
            </View>

            <View style={[styles.infoCell, styles.fullWidth]}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{customerAddress}</Text>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <Text style={styles.paymentTitle}>Payment</Text>
        <View style={styles.paymentButtons}>
          <TouchableOpacity
            style={[
              styles.paymentButton,
              paymentMethod === 'Cash' && styles.paymentButtonActive
            ]}
            onPress={() => setPaymentMethod('Cash')}
          >
            <Text style={[
              styles.paymentButtonText,
              paymentMethod === 'Cash' && styles.paymentButtonTextActive
            ]}>
              Cash
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentButton,
              paymentMethod === 'Bank transfer' && styles.paymentButtonActive
            ]}
            onPress={() => setPaymentMethod('Bank transfer')}
          >
            <Text style={[
              styles.paymentButtonText,
              paymentMethod === 'Bank transfer' && styles.paymentButtonTextActive
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
          style={styles.confirmButton}
          onPress={handleConfirm}
        >
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
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
  header: {
    marginTop: 10,
    marginBottom: 10,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0F7B5E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
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
});