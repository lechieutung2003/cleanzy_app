import React from 'react';
import {
  Alert,
  SafeAreaView,
  TextInput,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePickerInput from '../../components/DateTimePickerInput';
import useCreateOrderViewModel from '../../viewmodels/CreateOrderScreen/useCreateOrderViewModel';

export default function CreateOrderScreen() {
  const navigation = useNavigation();
  const {
    customerInfo,
    selectedServiceType,
    formData,
    loading,
    error,
    updateFormField,
    SmartPricing,
  } = useCreateOrderViewModel();

  const handleNext = async () => {
    try {
      const hour_peak =
        new Date(formData.preferred_start_time).getHours() >= 19;
      let service_id = selectedServiceType?.id || '';
      const predictData = {
        service_id: service_id,
        area_m2: formData.area_m2,
        hours_peak: hour_peak,
        customer_id: customerInfo?.id || '',
      };
      const pricingResult = await SmartPricing(predictData);

      console.log('Smart Pricing Result:', pricingResult);


      (navigation as any).navigate('CreateOrder2', {
        formData,
        selectedServiceType,
        customerInfo,
        pricingResult: pricingResult, // truyền sang màn sau nếu cần
      });
    } catch (err) {

      Alert.alert('Error', 'Cannot calculate smart pricing');
      console.error('Smart Pricing Error:', err);
    }
  };

  if (loading && !customerInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0F7B5E" />
          <Text style={styles.loadingText}>Loading information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.title}>Enter Order Information</Text>

        <View style={styles.formSection}>
          <Text style={styles.label}>Service Type</Text>
          <TextInput
            style={[styles.input, styles.inputReadonly]}
            value={selectedServiceType?.name || ''}
            editable={false}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Area (m²)</Text>
          <TextInput
            style={styles.input}
            value={String(formData.area_m2)}
            onChangeText={(text) => updateFormField('area_m2', parseFloat(text) || 0)}
            keyboardType="numeric"
            placeholder="Enter area"
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Start Time</Text>
          <DateTimePickerInput
            label="Start"
            value={formData.preferred_start_time}
            onChange={(date) => updateFormField('preferred_start_time', date)}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>End Time</Text>
          <DateTimePickerInput
            label="End"
            value={formData.preferred_end_time}
            onChange={(date) => updateFormField('preferred_end_time', date)}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            value={formData.note}
            onChangeText={(text) => updateFormField('note', text)}
            multiline
            placeholder="Add notes (optional)"
          />
        </View>

        <TouchableOpacity
          style={[styles.nextButton, loading && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.nextButtonText}>Continue</Text>}
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
  formSection: { marginBottom: 18 },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 7, color: '#0F7B5E' },
  input: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#B8D8D0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 16 },
  inputReadonly: { backgroundColor: '#F0F4F8', color: '#616161' },
  nextButton: { backgroundColor: '#0F7B5E', borderRadius: 25, paddingVertical: 14, alignItems: 'center', marginTop: 18 },
  nextButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  nextButtonDisabled: { opacity: 0.6 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#0F7B5E' },
  errorText: { color: '#ff0000', textAlign: 'center', marginTop: 10 },
});