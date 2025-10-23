import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';

export default function HomeScreen() {
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  // Animated values
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslate = useRef(new Animated.Value(40)).current;

  // Subtitle animation
  const subtitle = "Cleaning\nService\nBooking App";
  const chars = subtitle.split(""); // Không tách dấu cách
  const charAnims = useRef(chars.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Animate title
    Animated.timing(titleOpacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    Animated.timing(titleTranslate, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Animate subtitle từng ký tự lần lượt, lặp lại
    let isMounted = true;

    const loopWave = () => {
      if (!isMounted) return;

      const animations = chars.map((_, i) =>
        Animated.timing(charAnims[i], {
          toValue: 1,
          duration: 1000, // tốc độ của sóng
          delay: i * 10, // lệch pha giữa các ký tự
          easing: Easing.inOut(Easing.sin), // tạo sóng mượt
          useNativeDriver: true,
        })
      );

      Animated.stagger(80, animations).start(() => {
        // reset toàn bộ và lặp lại
        charAnims.forEach(anim => anim.setValue(0));
        if (isMounted) loopWave();
      });
    };

    loopWave();
    return () => { isMounted = false; };
  }, []);

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <ImageBackground
        source={require('../../assets/background.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        {/* App Name */}
        <View style={styles.name}>
          <Animated.Text
            style={[
              styles.title,
              {
                opacity: titleOpacity,
                transform: [{ translateY: titleTranslate }],
              },
            ]}
          >
            CLEANZY
          </Animated.Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {chars.map((char, idx) =>
              char === "\n" ? (
                <Text key={idx} style={{ width: '100%', height: 0 }}>{'\n'}</Text>
              ) : (
                <Animated.Text
                  key={idx}
                  style={{
                    transform: [
                      {
                        translateY: charAnims[idx].interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -18],
                        }),
                      },
                      {
                        scale: charAnims[idx].interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.3],
                        }),
                      },
                    ],
                    color: 'white',
                    fontSize: 30,
                    letterSpacing: 5,
                    lineHeight: 55,
                    fontWeight: 'normal',
                  }}
                >
                  {char}
                </Animated.Text>
              )
            )}
          </View>
        </View>

        {/* Sign In */}
        <View style={styles.content}>
          <TouchableOpacity style={styles.signInBtn}>
            <Text style={styles.signInText}>Sign in</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowCreateAccount(true)}>
            <Text style={styles.linkText}>Create an account</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.3)' },
  name: { alignItems: 'flex-start', position: 'absolute', top: 150, left: 24, gap: 60 },
  content: { alignItems: 'center', padding: 20, position: 'absolute', bottom: 200, gap: 20 },
  title: { fontSize: 64, color: 'white', fontWeight: 'bold', justifyContent: 'flex-start' },
  subtitle: { fontSize: 30, color: 'white', marginTop: 8, letterSpacing: 5, lineHeight: 55 },
  signInBtn: {
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginTop: 20,
    width: 200,
    height: 50,
  },
  signInText: { color: '#064e3b', fontWeight: 'bold', fontSize: 20, textAlign: 'center' },
  linkText: { color: '#a7f3d0', marginTop: 12, textDecorationLine: 'underline', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: 'white', borderRadius: 20, padding: 24, width: '80%' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, color: '#064e3b' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 20, padding: 10, marginVertical: 6 },
  createBtn: { backgroundColor: '#047857', borderRadius: 20, padding: 12, marginTop: 10 },
  createText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
  cancelText: { textAlign: 'center', color: '#6b7280', marginTop: 10 },
});
