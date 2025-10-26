import React, { useState } from 'react';
import {
    ScrollView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
} from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import TextField from '../../components/TextField';
import BackButton from '../../components/BackButton';
import { Alert } from 'react-native';

export default function ForgotScreen() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const onSend = async () => {
        if (!email) {
            Alert.alert('Please enter your email');
            return;
        }
        setLoading(true);
        try {
            // Gọi API gửi email quên mật khẩu ở đây
            // await OAuthService.forgotPassword(email);
            setSent(true);
            Alert.alert('Password reset instructions have been sent to your email.');
        } catch (err: any) {
            Alert.alert(err?.message || 'Failed to send reset email!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <BackButton />
            <View style={styles.formBox}>
                <Text style={styles.welcome}>Forgot Password</Text>
                <Text style={styles.subtitle}>
                    Enter your email to receive password reset instructions
                </Text>

                <Text style={styles.label}>Email</Text>
                <TextField
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <PrimaryButton
                    title="Send"
                    onPress={onSend}
                    loading={loading}
                    style={{ marginTop: 35 }}
                />

                {sent && (
                    <Text style={styles.successText}>
                        Please check your email for reset instructions.
                    </Text>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    formBox: {
        marginTop: 100,
        padding: 30,
        paddingTop: 80,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 8,
    },
    welcome: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#047857',
        marginBottom: 4,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: '#6b7280',
        marginBottom: 28,
        textAlign: 'center',
    },
    label: {
        fontSize: 15,
        color: '#222',
        marginBottom: 6,
        marginTop: 10,
    },
    successText: {
        color: '#047857',
        fontSize: 15,
        textAlign: 'center',
        marginTop: 18,
    },
});