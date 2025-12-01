import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import useHeaderViewModel from '../viewmodels/Header/useHeaderViewModel';
import SearchBar from './SearchBar';

type TabType = 'home' | 'favorites' | 'history';

interface HeaderProps {
  onTabChange?: (tab: TabType) => void;
  showSearch?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onTabChange, showSearch = true }) => {
  const {
    avatarSource,
    location,
    handleNotificationPress,
    handleAvatarPress,
  } = useHeaderViewModel();

  return (
    <View>
      <View style={styles.container}>
        {/* Avatar */}
        <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.8}>
          <Image
            source={avatarSource || require('../assets/avt.png')}
            style={styles.avatar}
          />
        </TouchableOpacity>

        {/* Location */}
        <View style={styles.locationContainer}>
          <Image
            source={require('../assets/location_icon.png')}
            style={styles.locationIcon}
          />
          <Text style={styles.locationText}>{location}</Text>
        </View>

        {/* Notification Bell */}
        <TouchableOpacity onPress={handleNotificationPress} style={styles.notificationBtn}>
          <Image
            source={require('../assets/noti_icon.png')}
            style={styles.notificationIcon}
          />
          {/* Optional: Add a badge for unread notifications */}
          {/* <View style={styles.badge} /> */}
        </TouchableOpacity>
      </View>
      
      {/* Search Bar */}
      {showSearch && (
        <View >
          <SearchBar />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: 'white',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  locationContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
  },
  locationIcon: {
    width: 24,
    height: 24,
    tintColor: '#047857',
    marginRight: 4,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  notificationBtn: {
    padding: 8,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    width: 24,
    height: 24,
    tintColor: '#f59e0b',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
});

export default Header;
