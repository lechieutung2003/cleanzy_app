// import { useState, useRef, useEffect, useCallback } from 'react';
// import { Animated, Easing, Alert } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import OAuthService from '../../services/oauth';


// export default function useLoginViewModel() {
//   const navigation = useNavigation();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [remember, setRemember] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const onToggleShowPassword = () => setShowPassword(prev => !prev);
//   const onToggleRemember = () => setRemember(prev => !prev);

//   const backHome = useCallback(() => {
//     (navigation as any).navigate('Home');
//   }, [navigation]);

//   const onLogin = useCallback(async () => {
//     setLoading(true);
//     try {
//       // 1. Đăng nhập
//       const loginRes = await OAuthService.login({ username: email, password });
//       const accessToken = loginRes.access_token;
//       if (!accessToken) {
//         Alert.alert('Đăng nhập thất bại', 'Sai tài khoản hoặc mật khẩu');
//         console.log('Đăng nhập thất bại:', loginRes);
//         setLoading(false);
//         return;
//       }
//       Alert.alert('Đăng nhập thành công');
//       console.log('Đăng nhập thành công! Token:', accessToken);

//       // 2. Lấy userinfo
//       const userinfo = await OAuthService.userinfo();
//       console.log('Userinfo:', userinfo);

//       // 3. Kiểm tra scope khách hàng
//       if (userinfo.scopes && userinfo.scopes.includes('customer')) {
//         console.log('Đăng nhập thành công với quyền khách hàng');
//       } else {
//         console.log('Không phải khách hàng:', userinfo.scopes);
//       }

//       // 4. Chuyển sang màn hình Favorite sau khi đăng nhập thành công
//       (navigation as any).navigate('Favorite');
//     } catch (err) {
//       console.log('Lỗi đăng nhập:', err);
//       Alert.alert('Lỗi', 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.');
//     } finally {
//       setLoading(false);
//     }
//   }, [email, password, navigation]);

//   return {
//     email,
//     setEmail,
//     password,
//     setPassword,
//     loading,
//     onLogin,
//     showPassword,
//     onToggleShowPassword,
//     remember,
//     onToggleRemember,
//     backHome,
//   };
// }


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
      console.log('Userinfo:', userinfo);

      // 3. Kiểm tra scope khách hàng
      if (userinfo.scopes && userinfo.scopes.includes('customer')) {
        console.log('Đăng nhập thành công với quyền khách hàng');
      } else {
        console.log('Không phải khách hàng:', userinfo.scopes);
      }

      // 4. Chuyển sang màn hình Home sau khi đăng nhập thành công
      (navigation as any).navigate('Home');
    } catch (err) {
      console.log('Lỗi đăng nhập:', err);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.');
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