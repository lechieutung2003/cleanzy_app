import { useState, useRef, useEffect, useCallback } from 'react';
import { Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

export default function useLoginViewModel() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const onToggleShowPassword = () => setShowPassword(prev => !prev);
  const onToggleRemember = () => setRemember(prev => !prev);

  const backHome = useCallback(() => {
      (navigation as any).navigate('Home');
  }, [navigation]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    onToggleShowPassword,
    remember,
    onToggleRemember,
    backHome,
  };
}