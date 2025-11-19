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
import useRegisterViewModel from '../../viewmodels/RegisterScreen/useRegisterViewModel';


function isValidEmail(email: string){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


function isValidName(name: string) {
    return /^[\p{L}\s]+$/u.test(name.trim());
}

function isValidPassword(password: string) {
    return password.length >= 6 && /^[A-Za-z0-9]+$/.test(password);
}




export default function RegisterScreen() {


    const [error, setError] = useState('');
    
    const handleRegister = () => {
        if (!isValidName(firstName)  ||  !isValidName(lastName)) {
            setError('Fist name and last name must not contain numbers or special characters.');
            return;
        }
        if (!isValidEmail(email)) {
            setError('Please enter a valid email address.');
            return;
        }
        if (!isValidPassword(password)) {
            setError('Password must be at least 6 characters long and contain only letters and numbers.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setError('');
        onRegister();
    }


    const {
        firstName, setFirstName,
        lastName, setLastName,
        email, setEmail,
        password, setPassword,
        confirmPassword, setConfirmPassword,
        showPassword, setShowPassword,
        showConfirmPassword, setShowConfirmPassword,
        loading,
        onSignIn,
        onRegister,
    } = useRegisterViewModel();

    return (
    <ScrollView style={styles.container}>
        <BackButton />
        <View style={styles.formBox}>
            <Text style={styles.welcome}>Sign Up</Text>
            <Text style={styles.subtitle}>Create your new account</Text>

            {/* First Name & Last Name */}
            <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 15 }}>
                    <Text style={styles.label}>First Name</Text>
                    <TextField
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="First Name"
                        autoCapitalize="words"
                    />
                </View>
                <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={styles.label}>Last Name</Text>
                    <TextField
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="Last Name"
                        autoCapitalize="words"
                    />
                </View>
            </View>


            {/* Email */}
            <Text style={styles.label}>Email</Text>
            <TextField
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
            />

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <TextField
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                rightIcon={
                    <TouchableOpacity onPress={() => setShowPassword(v => !v)}>
                        <Image
                            source={
                                showPassword
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
            <Text style={styles.label}>Confirm Password</Text>
            <TextField
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm Password"
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

            {error ? (
                <Text style={{ color: 'red', marginBottom: 10, textAlign: 'center' }}>{error}</Text>
            ) : null}

            {/* Register button */}
            <PrimaryButton
                title="Register"
                onPress={handleRegister}
                loading={loading}
                style={{ marginTop: 35 }}
            />

            {/* Sign up */}
            <View style={styles.signupRow}>
                <Text style={styles.signupText}>Already have an account? </Text>
                <TouchableOpacity onPress={onSignIn}>
                    <Text style={styles.signupLink}>Sign in</Text>
                </TouchableOpacity>
            </View>
        </View>
    </ScrollView>
);

}

const styles = StyleSheet.create({
    container: { flex: 1 },
    background: { flex: 1 },
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
    passwordRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    eyeBtn: {
        position: 'absolute',
        right: 46,
        top: 460,
        padding: 4,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 2,
    },
    rememberRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rememberDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 1.5,
        marginRight: 6,
    },
    rememberText: {
        fontSize: 14,
        color: '#222',
    },
    forgotText: {
        fontSize: 14,
        color: '#047857',
        textDecorationLine: 'underline',
    },
    signupRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    signupText: {
        color: '#6b7280',
        fontSize: 15,
    },
    signupLink: {
        color: '#047857',
        fontWeight: 'bold',
        fontSize: 15,
        textDecorationLine: 'underline',
    },
});