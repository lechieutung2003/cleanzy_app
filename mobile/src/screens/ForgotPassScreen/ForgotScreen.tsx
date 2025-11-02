import React from 'react';
import {
    ScrollView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';
import TextField from '../../components/TextField';
import BackButton from '../../components/BackButton';
import useForgotViewModel from '../../viewmodels/ForgotPassScreen/useForgotViewModel';

export default function ForgotScreen() {
    const {
        email, setEmail,
        otp, setOtp,
        loading,
        sent,
        onSendOtp,
        onSubmit,
    } = useForgotViewModel();

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
                    rightIcon={
                        <TouchableOpacity onPress={onSendOtp} disabled={loading || !email}>
                            <Text style={{
                                color: loading || !email ? '#bdbdbd' : '#047857',
                                fontWeight: 'bold',
                                fontSize: 15,
                                paddingHorizontal: 8,
                            }}>
                                Send
                            </Text>
                        </TouchableOpacity>
                    }
                />

                {/* OTP input */}
                {sent && (
                    <>
                        <Text style={styles.label}>OTP</Text>
                        <TextField
                            value={otp}
                            onChangeText={setOtp}
                            placeholder="Enter OTP"
                            keyboardType="number-pad"
                            autoCapitalize="none"
                        />
                    </>
                )}

                <PrimaryButton
                    title="Submit"
                    onPress={onSubmit}
                    loading={loading}
                    style={{ marginTop: 35 }}
                />

                {sent && (
                    <Text style={styles.successText}>
                        Please check your email for the OTP code.
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