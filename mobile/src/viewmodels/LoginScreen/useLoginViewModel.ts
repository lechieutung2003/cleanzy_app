import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

export const useHomeViewModel = () => {
  // Title animation
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslate = useRef(new Animated.Value(40)).current;

  // Subtitle animation
  const subtitle = "Cleaning\nService\nBooking App";
  const chars = subtitle.split("");
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

    // Animate subtitle characters in a wave pattern
    let isMounted = true;

    const loopWave = () => {
      if (!isMounted) return;

      const animations = chars.map((_, i) =>
        Animated.timing(charAnims[i], {
          toValue: 1,
          duration: 1000, 
          delay: i * 10, 
          easing: Easing.inOut(Easing.sin), 
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

  return {
    titleOpacity,
    titleTranslate,
    subtitle,
    chars,
    charAnims,
  };
};