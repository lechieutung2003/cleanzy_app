import React, { useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Pressable,
  Image,
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('thao@gmail.com');
  const [password, setPassword] = useState('12345678');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/login_background.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.formBox}>
          {/* Back button */}
          {/* <TouchableOpacity style={styles.backBtn}>
            <Icon name="arrow-left" size={28} color="#047857" />
          </TouchableOpacity> */}

          <Text style={styles.welcome}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to your account</Text>

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <Pressable
              style={styles.eyeBtn}
              onPress={() => setShowPassword(!showPassword)}
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
          </View>

          {/* Remember me & Forgot password */}
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.rememberRow}
              onPress={() => setRemember(!remember)}
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
          <TouchableOpacity style={styles.loginBtn}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>

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
    // flex: 1,
    // backgroundColor: '#fff',
    marginTop: 180,
    // borderTopLeftRadius: 80,
    padding: 32,
    paddingTop: 228,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  backBtn: {
    position: 'absolute',
    top: 18,
    left: 18,
    zIndex: 2,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    elevation: 2,
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
  input: {
    borderWidth: 1,
    borderColor: '#bdbdbd',
    borderRadius: 20,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eyeBtn: {
    position: 'absolute',
    right: 16,
    top: 9,
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
  loginBtn: {
    backgroundColor: '#047857',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 18,
  },
  loginText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
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