import { useState, useRef, useEffect, useCallback } from 'react';
import { Animated, Easing, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import OAuthService from '../../services/oauth';


export default function useLoginViewModel() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const onToggleShowPassword = () => setShowPassword(prev => !prev);
  const onToggleRemember = () => setRemember(prev => !prev);

  // const backHome = useCallback(() => {
  //   (navigation as any).navigate('Home');
  // }, [navigation]);

  const onLogin = useCallback(async () => {
    setLoading(true);
    try {
      const loginRes = await OAuthService.login({ username: email, password });
      const accessToken = loginRes.access_token;
      if (!accessToken) {
        Alert.alert('Login failed', 'Invalid credentials');
        setLoading(false);
        return;
      }
      Alert.alert('Login successful');

      // Get user info
      const userinfo = await OAuthService.userinfo();

      // Check scopes for 'customer' role
      // if (userinfo.scopes && userinfo.scopes.includes('customer')) {
      //   console.log('Login successful for customer:', userinfo);
      // } else {
      //   console.log('User is not a customer:', userinfo.scopes);
      // }
    } catch (err) {
      console.log('Login error:', err);
    } finally {
      setLoading(false);
    }
  }, [email, password]);

  const onSignUp = useCallback(() => {
    (navigation as any).navigate('Register');
  }, [navigation]);

  const onForgotPassword = useCallback(() => {
    (navigation as any).navigate('ForgotPassword');
  }, [navigation]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    onLogin,
    showPassword,
    onToggleShowPassword,
    remember,
    onToggleRemember,
    onSignUp,
    onForgotPassword,
  };
}