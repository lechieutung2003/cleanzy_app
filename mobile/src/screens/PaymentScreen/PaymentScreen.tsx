import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BackButton from '../../components/BackButton';
import TextField from '../../components/TextField';
import PrimaryButton from '../../components/PrimaryButton';

const { width } = Dimensions.get('window');

const PaymentScreen: React.FC = () => {
  const navigation = useNavigation();
  // static/demo values to match the design
  const accountName = 'CTY TNHH CLEANZY';
  const accountNumber = '012345678';
  const amount = '500,000 vnd';
  const description = 'CLEANZY123';

  const renderCopy = (text: string) => (
    <TouchableOpacity
      onPress={() => {
        // placeholder: real copy action can be added later
      }}
      style={styles.copyBtn}
    >
      <Text style={styles.copyText}>COPY</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <BackButton />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Payment</Text>

        <View style={styles.qrContainer}>
          {/* QR placeholder box - replace Image source if you have a QR image asset */}
          <View style={styles.qrBorder}>
            <View style={styles.qrInner}>
              <Text style={styles.qrText}>QR</Text>
            </View>
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Account name</Text>
          <TextField value={accountName} editable={false} rightIcon={renderCopy(accountName)} />

          <Text style={styles.label}>Account number</Text>
          <TextField value={accountNumber} editable={false} rightIcon={renderCopy(accountNumber)} />

          <Text style={styles.label}>Payment amount</Text>
          <TextField value={amount} editable={false} rightIcon={renderCopy(amount)} />

          <Text style={styles.label}>Transfer description</Text>
          <TextField value={description} editable={false} rightIcon={renderCopy(description)} />

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <PrimaryButton 
              title="I have transferred" 
              onPress={() => (navigation as any).navigate('PendingPayment')} 
              style={styles.confirmBtn} 
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff', paddingTop: 30 },
  scrollView: { flex: 1 },
  container: {
    alignItems: 'center',
    paddingBottom: 40,
    paddingTop: 16,
  },
  title: {
    marginTop: 24,
    fontSize: 32,
    fontWeight: '700',
    color: '#047857',
  },
  qrContainer: {
    marginTop: 18,
    width: width * 0.82,
    alignItems: 'center',
  },
  qrBorder: {
    borderWidth: 6,
    borderColor: '#8fbef6',
    padding: 10,
    backgroundColor: '#fff',
  },
  qrInner: {
    width: width * 0.62,
    height: width * 0.62,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrText: { fontSize: 24, color: '#444' },
  form: {
    marginTop: 18,
    width: width * 0.9,
  },
  label: {
    marginTop: 8,
    marginBottom: 6,
    color: '#6b7280',
    fontSize: 14,
  },
  copyBtn: {
    backgroundColor: '#e6f0ee',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  copyText: {
    color: '#0f172a',
    fontWeight: '600',
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
  },
  cancelBtn: {
    borderWidth: 2,
    borderColor: '#047857',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#fff',
    minWidth: 140,
    alignItems: 'center',
  },
  cancelText: {
    color: '#047857',
    fontWeight: '600',
    fontSize: 16,
  },
  confirmBtn: {
    minWidth: 180,
    marginLeft: 12,
    borderRadius: 25,
  },
});

export default PaymentScreen;
