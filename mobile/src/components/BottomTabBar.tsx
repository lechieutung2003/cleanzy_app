import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface BottomTabBarProps {
  activeTab?: 'home' | 'favorites' | 'history';
  onHomePress?: () => void;
  onFavoritesPress?: () => void;
  onHistoryPress?: () => void;
}

const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab = 'history',
  onHomePress,
  onFavoritesPress,
  onHistoryPress,
}) => {
  const navigation = useNavigation();

  const handleHomePress = () => {
    if (onHomePress) {
      onHomePress();
    } else {
      (navigation as any).navigate('Home');
    }
  };

  const handleFavoritesPress = () => {
    if (onFavoritesPress) {
      onFavoritesPress();
    } else {
      (navigation as any).navigate('Favorite');
    }
  };

  const handleHistoryPress = () => {
    if (onHistoryPress) {
      onHistoryPress();
    } else {
      (navigation as any).navigate('History');
    }
  };

  return (
    <View style={styles.container}>
      {/* Home Tab */}
      <TouchableOpacity style={styles.tab} onPress={handleHomePress}>
        <Image
          source={require('../assets/home_icon.png')}
          style={[
            styles.icon,
            { tintColor: activeTab === 'home' ? '#047857' : '#9ca3af' },
          ]}
        />
        {activeTab === 'home' && <View style={styles.activeDot} />}
      </TouchableOpacity>

      {/* Favorites Tab */}
      <TouchableOpacity style={styles.tab} onPress={handleFavoritesPress}>
        <Image
          source={require('../assets/heart_icon.png')}
          style={[
            styles.icon,
            { tintColor: activeTab === 'favorites' ? '#047857' : '#9ca3af' },
          ]}
        />
        {activeTab === 'favorites' && <View style={styles.activeDot} />}
      </TouchableOpacity>

      {/* History Tab */}
      <TouchableOpacity style={styles.tab} onPress={handleHistoryPress}>
        <Image
          source={require('../assets/grid_icon.png')}
          style={styles.icon}
          resizeMode="contain"
        />
        {activeTab === 'history' && <View style={styles.activeDot} />}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  icon: {
    width: 28,
    height: 28,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#047857',
    marginTop: 4,
  },
});

export default BottomTabBar;
