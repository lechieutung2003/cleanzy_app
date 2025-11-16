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
  ImageBackground,
} from 'react-native';
// import BackButton from '../../components/BackButton';
import { useNavigation, useRoute } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import Clipboard from '@react-native-clipboard/clipboard';

import TextField from '../../components/TextField';
import PrimaryButton from '../../components/PrimaryButton';

const { width } = Dimensions.get('window');

const PaymentScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>()
  // static/demo values to match the design
  // const accountName = 'CTY TNHH CLEANZY';
  // const accountNumber = '012345678';
  // const amount = '500,000 vnd';
  // const description = 'CLEANZY123';

  const {
    amount,
    paymentUrl,
    qrCode,
    orderCode,
    accountNumber,
    accountName,
    transferContent,
    bankName,
  } = route.params || {};

  const formatAmount = (n?: number) =>
    typeof n === 'number' ? `${n.toLocaleString('vi-VN')} VND` : '';

  const handleCopy = (text: string) => {
    if (!text) return;
    Clipboard.setString(text);
    // Có thể thêm Toast nếu bạn có component
  };

  const renderCopy = (text: string) => (
    <TouchableOpacity onPress={() => handleCopy(text)} style={styles.copyBtn}>
      <Text style={styles.copyText}>COPY</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground
                        // source={require('../../assets/background_service.png')}
                        // style={styles.bgImage}
                        resizeMode="cover"
                        imageStyle={styles.bgImageStyle} // thêm border radius
                      >
                        {/* Back Button */}
                        <TouchableOpacity
                          style={styles.backButton}
                          onPress={() => navigation.goBack()}
                          activeOpacity={0.8}
                        >
                          <Image
                            source={require('../../assets/back_button_white.png')}
                            style={styles.backButtonImage}
                            resizeMode="contain"
                          />
                        </TouchableOpacity>
                      </ImageBackground>
      
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
              {qrCode ? (
                <QRCode value={qrCode} size={Math.min(260, Math.round((Dimensions.get('window').width * 0.62)))} />
              ) : (
                <Text style={styles.qrText}>QR</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Account name</Text>
          <TextField value={accountName || ''} editable={false} rightIcon={renderCopy(accountName || '')} />

          <Text style={styles.label}>Account number</Text>
          <TextField value={accountNumber || ''} editable={false} rightIcon={renderCopy(accountNumber || '')} />

          <Text style={styles.label}>Payment amount</Text>
          <TextField value={formatAmount(amount)} editable={false} rightIcon={renderCopy(String(amount ?? ''))} />

          <Text style={styles.label}>Transfer description</Text>
          <TextField value={transferContent || ''} editable={false} rightIcon={renderCopy(transferContent || '')} />

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
  bgImage: {
    flex: 1,
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  bgImageStyle: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    width: 48,
    height: 48,
    left: 20, 
    borderRadius: 24,
    backgroundColor: '#0F7B5E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonImage: {
    width: 58,  
    height: 58,
  },
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
