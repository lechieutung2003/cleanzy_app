import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PrimaryButton from '../../components/PrimaryButton';

const { width, height } = Dimensions.get('window');

export default function ProfileScreen() {
  const navigation = useNavigation();

  const menuItems = [
    {
      id: 1,
      title: 'Edit Profile',
      icon: require('../../assets/edit_icon.png'),
      onPress: () => console.log('Edit Profile'),
    },
    {
      id: 2,
      title: 'Change Password',
      icon: require('../../assets/pass_icon.png'),
      onPress: () => console.log('Change Password'),
    },
    {
      id: 3,
      title: 'Privacy Policy',
      icon: require('../../assets/protect_icon.png'),
      onPress: () => console.log('Privacy Policy'),
    },
    {
      id: 4,
      title: 'Terms of Use',
      icon: require('../../assets/book_icon.png'),
      onPress: () => console.log('Terms of Use'),
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#12603b" />

      {/* Background xanh đậm full screen */}
      <ImageBackground
        source={require('../../assets/background_profile.png')}
        style={styles.backgroundFull}
        resizeMode="cover"
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Image
            source={require('../../assets/back_button_white.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Profile Card với background xanh nhạt */}
        <ImageBackground
          source={require('../../assets/background_profile2.png')}
          style={styles.profileCard}
          resizeMode="cover"
          imageStyle={styles.profileCardImage}
        >
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <Image
              source={require('../../assets/avt.png')}
              style={styles.avatar}
              resizeMode="cover"
            />
          </View>

          {/* Name */}
          <Text style={styles.name}>Vo Thu Thao</Text>

          {/* Menu Items */}
          <View style={styles.menuContainer}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <Image source={item.icon} style={styles.menuIcon} resizeMode="contain" />
                <Text style={styles.menuText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <View style={styles.logoutContainer}>
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={() => console.log('Logout')}
              activeOpacity={0.8}
            >
              <Image
                source={require('../../assets/logout_icon.png')}
                style={styles.logoutIcon}
                resizeMode="contain"
              />
              <Text style={styles.logoutButtonText}>Log out</Text>
            </TouchableOpacity>

            {/* Support Button */}
            <TouchableOpacity style={styles.supportButton} activeOpacity={0.8}>
              <Image
                source={require('../../assets/headphone_icon.png')}
                style={styles.supportIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#12603b',
  },
  backgroundFull: {
    flex: 1,
    width: '100%',
    paddingTop: 16,
  },
  backButton: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
    marginTop: 8,
  },
  backIcon: {
    width: 58,
    height: 58,
  },
  profileCard: {
    flex: 1,
    marginTop: height * 0.12,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'visible', // Cho phép avatar nổi lên trên
    paddingTop: 80,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  profileCardImage: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  avatarContainer: {
    position: 'absolute',
    top: -70, // Nổi lên cao hơn
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0f2f1',
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 10, // Đảm bảo avatar nằm trên cùng
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 56,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 32,
  },
  menuContainer: {
    gap: 16,
    marginBottom: 32,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 34,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  menuIcon: {
    width: 28,
    height: 28,
    tintColor: '#065f46',
    marginRight: 16,
  },
  menuText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  logoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
  logoutButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#047857',
    borderRadius: 30,
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    gap: 12,
  },
  logoutIcon: {
    width: 24,
    height: 24,
    tintColor: '#ffffff',
  },
  logoutButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  supportButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  supportIcon: {
    width: 28,
    height: 28,
    tintColor: '#065f46',
  },
});
