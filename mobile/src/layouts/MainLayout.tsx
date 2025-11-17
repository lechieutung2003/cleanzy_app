import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import Header from '../components/Header';
import BottomTabBar from '../components/BottomTabBar';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: 'home' | 'favorites' | 'history';
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, activeTab }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header - chỉ render 1 lần */}
      <Header />

      {/* Content area - thay đổi theo từng màn hình */}
      <View style={styles.content}>
        {children}
      </View>

      {/* Bottom Tab Bar - chỉ render 1 lần */}
      <BottomTabBar activeTab={activeTab} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
  },
});

export default MainLayout;
