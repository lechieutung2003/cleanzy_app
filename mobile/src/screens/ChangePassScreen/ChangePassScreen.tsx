import React, { useState } from 'react';
import {
    View,
    Text,
    ImageBackground,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import PrimaryButton from '../../components/PrimaryButton';
import TextField from '../../components/TextField';
import BackButton from '../../components/BackButton';

type ChangePassParams = { email?: string };


export default function ChangePassScreen() {
    const route = useRoute<RouteProp<Record<string, ChangePassParams>, string>>();
    const isFromForgot = !!route.params?.email;
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const onChangePassword = async () => {
        if (!newPassword || !confirmPassword || (!isFromForgot && !oldPassword)) {
            Alert.alert('Please fill in all fields');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('New passwords do not match');
            return;
        }
        setLoading(true);
        try {
            if (isFromForgot) {
                // Gọi API đặt lại mật khẩu với email
                // await AuthService.resetPassword({ email: route.params.email, newPassword });
                Alert.alert('Password reset successfully!');
            } else {
                // Gọi API đổi mật khẩu thông thường
                // await AuthService.changePassword({ oldPassword, newPassword });
                Alert.alert('Password changed successfully!');
            }
        } catch (err: any) {
            Alert.alert(err?.message || 'Failed to change password!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../../assets/login_background.png')}
                style={styles.background}
                resizeMode="cover"
            >
                <BackButton iconStyle={{ tintColor: '#ffffffff' }} />
                <View style={styles.formBox}>
                    <Text style={styles.welcome}>Change Password</Text>
                    <Text style={styles.subtitle}>
                        {isFromForgot
                            ? 'Set your new password'
                            : 'Update your account password'}
                    </Text>

                    {/* Old Password chỉ hiển thị nếu không phải từ Forgot */}
                    {!isFromForgot && (
                        <>
                            <Text style={styles.label}>Old Password</Text>
                            <TextField
                                value={oldPassword}
                                onChangeText={setOldPassword}
                                placeholder="Old Password"
                                secureTextEntry={!showOldPassword}
                                autoCapitalize="none"
                                rightIcon={
                                    <TouchableOpacity onPress={() => setShowOldPassword(v => !v)}>
                                        <Image
                                            source={
                                                showOldPassword
                                                    ? require('../../assets/eye_password/eye_open.png')
                                                    : require('../../assets/eye_password/eye_close.png')
                                            }
                                            style={{ width: 22, height: 22, tintColor: '#047857' }}
                                            resizeMode="contain"
                                        />
                                    </TouchableOpacity>
                                }
                            />
                        </>
                    )}

                    {/* New Password */}
                    <Text style={styles.label}>New Password</Text>
                    <TextField
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="New Password"
                        secureTextEntry={!showNewPassword}
                        autoCapitalize="none"
                        rightIcon={
                            <TouchableOpacity onPress={() => setShowNewPassword(v => !v)}>
                                <Image
                                    source={
                                        showNewPassword
                                            ? require('../../assets/eye_password/eye_open.png')
                                            : require('../../assets/eye_password/eye_close.png')
                                    }
                                    style={{ width: 22, height: 22, tintColor: '#047857' }}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>
                        }
                    />

                    {/* Confirm Password */}
                    <Text style={styles.label}>Confirm New Password</Text>
                    <TextField
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Confirm New Password"
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        rightIcon={
                            <TouchableOpacity onPress={() => setShowConfirmPassword(v => !v)}>
                                <Image
                                    source={
                                        showConfirmPassword
                                            ? require('../../assets/eye_password/eye_open.png')
                                            : require('../../assets/eye_password/eye_close.png')
                                    }
                                    style={{ width: 22, height: 22, tintColor: '#047857' }}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>
                        }
                    />

                    {/* Change Password button */}
                    <PrimaryButton
                        title={isFromForgot ? 'Set New Password' : 'Change Password'}
                        onPress={onChangePassword}
                        loading={loading}
                        style={{ marginTop: 24 }}
                    />
                </View>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    background: { flex: 1 },
    formBox: {
        marginTop: 180,
        padding: 32,
        paddingTop: 228,
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
});