import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import OTPService from '../../services/otp';

type RootStackParamList = {
    ChangePassword: { email: string };
    // ... các screen khác nếu có
};

export default function useForgotViewModel() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    
    const onSendOtp = useCallback(async () => {
        if (!email) {
            Alert.alert('Please enter your email');
            return;
        }
        setLoading(true);
        try {
            await OTPService.sendEmailOTP(email);
            setSent(true);
            Alert.alert('OTP has been sent to your email.');
        } catch (err: any) {
            Alert.alert(err?.message || 'Failed to send OTP!');
        } finally {
            setLoading(false);
        }
    }, [email]);

    const onSubmit = useCallback(async () => {
        if (!otp) {
            Alert.alert('Please enter the OTP');
            return;
        }
        setLoading(true);
        try {
            await OTPService.verifyEmailOTP(email, otp);
            navigation.navigate('ChangePassword', { email });
        } catch (err: any) {
            Alert.alert(err?.message || 'OTP verification failed!');
        } finally {
            setLoading(false);
        }
    }, [otp, email, navigation]);

    return {
        email, setEmail,
        otp, setOtp,
        loading,
        sent, setSent,
        onSendOtp,
        onSubmit,
    };
}