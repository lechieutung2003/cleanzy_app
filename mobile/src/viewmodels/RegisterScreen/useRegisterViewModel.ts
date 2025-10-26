import { useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import OAuthService from '../../services/oauth';
import { Alert } from 'react-native';

export default function useRegisterViewModel() {
    const navigation = useNavigation();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const onSignIn = useCallback(() => {
        (navigation as any).navigate('Login');
    }, [navigation]);

    const onRegister = useCallback(async () => {
        if (
            !firstName ||
            !lastName ||
            !email ||
            !password ||
            !confirmPassword
        ) {
            Alert.alert('Please fill in all fields');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            const res = await OAuthService.registerCustomer({
                first_name: firstName,
                last_name: lastName,
                email,
                password,
            });

            if (res && (res.id || res.email)) {
                Alert.alert('Register successful! Please sign in.');
                (navigation as any).navigate('Login');
            } else {
                Alert.alert(res?.message || 'Register failed!');
            }
        } catch (err: any) {
            // console.log(
            //     `POST /api/v1/employees/register-customer - ERROR:`,
            //     err?.response || err
            // );
            Alert.alert(err?.message || 'Register failed!');
        } finally {
            setLoading(false);
        }
    }, [
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        navigation,
    ]);

    return {
        firstName,
        setFirstName,
        lastName,
        setLastName,
        email,
        setEmail,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        showPassword,
        setShowPassword,
        showConfirmPassword,
        setShowConfirmPassword,
        loading,
        onSignIn,
        onRegister,
    };
}