import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Image,
} from 'react-native';
import useLoginViewModel from '../../viewmodels/LoginScreen/useLoginViewModel';
import PrimaryButton from '../../components/PrimaryButton';
import TextField from '../../components/TextField';

export default function LoginScreen() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    onToggleShowPassword,
    remember,
    onToggleRemember,
    backHome,
    onLogin,
    loading,
  } = useLoginViewModel();

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/login_background.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={backHome}
        >
          <Image
            source={require('../../assets/back/back_button.png')}
            style={{ width: 56, height: 56, tintColor: '#ffffffff', }}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <View style={styles.formBox}>
          {/* Back button */}
          <Text style={styles.welcome}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to your account</Text>

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
          />

          <Pressable
            style={styles.eyeBtn}
            onPress={onToggleShowPassword}
          >
            <Image
              source={
                showPassword
                  ? require('../../assets/eye_password/eye_open.png')
                  : require('../../assets/eye_password/eye_close.png')
              }
              style={{ width: 22, height: 22, tintColor: '#047857' }}
              resizeMode="contain"
            />
          </Pressable>


          {/* Remember me & Forgot password */}
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.rememberRow}
              onPress={onToggleRemember}
            >
              <View
                style={[
                  styles.rememberDot,
                  { backgroundColor: remember ? '#047857' : '#fff', borderColor: '#047857' },
                ]}
              />
              <Text style={styles.rememberText}>Remember me</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Login button */}
          <PrimaryButton
            title="Login"
            onPress={onLogin}
            loading={loading}
          />

          {/* Sign up */}
          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Don't have account? </Text>
            <TouchableOpacity>
              <Text style={styles.signupLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
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
  backBtn: {
    position: 'absolute',
    top: 56,
    left: 16,
    zIndex: 10,
    padding: 8
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
    marginBottom: 18,
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