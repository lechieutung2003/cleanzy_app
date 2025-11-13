import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import Header from '../components/Header';
import BottomTabBar from '../components/BottomTabBar';
import HomeScreen from '../screens/HomeScreen/HomeScreen';
import FavoriteScreen from '../screens/FavoriteScreen/FavoriteScreen';
import HistoryScreen from '../screens/HistoryScreen/HistoryScreen';

type TabType = 'home' | 'favorites' | 'history';

const MainTabNavigator = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'favorites':
        return <FavoriteScreen />;
      case 'history':
        return <HistoryScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header - chỉ render 1 lần, không bao giờ re-render */}
      <Header onTabChange={handleTabChange} />

      {/* Content area - chỉ thay đổi nội dung, không animation */}
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* Bottom Tab Bar - chỉ render 1 lần */}
      <BottomTabBar 
        activeTab={activeTab}
        onTabPress={(tab) => setActiveTab(tab as TabType)}
      />
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

export default MainTabNavigator;
