import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BackButton from '../../components/BackButton';
import PrimaryButton from '../../components/PrimaryButton';
import TextField from '../../components/TextField';

const { width } = Dimensions.get('window');

const PendingPaymentScreen: React.FC = () => {
  const navigation = useNavigation();
  const paymentAmount = '500,000 vnd';
  const paymentMethod = 'Bank transfer';
  const paymentTime = '11-01-2025 12:05:08';

  return (
    <SafeAreaView style={styles.safe}>
      <BackButton />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Pending checking payment</Text>

          {/* Loading icon */}
          <View style={styles.loadingContainer}>
            <Image
              source={require('../../assets/pending_clock_icon.png')}
              style={styles.loadingIcon}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.subtitle}>
            We're verifying your payment... This usually takes a few seconds.
          </Text>

          {/* Payment info */}
          <View style={styles.form}>
            <Text style={styles.label}>Payment amount</Text>
            <TextField value={paymentAmount} editable={false} />

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
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
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
