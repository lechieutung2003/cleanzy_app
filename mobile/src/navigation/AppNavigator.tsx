import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen/HomeScreen';
// import các màn hình khác nếu có

const Tab = createBottomTabNavigator();

const AppNavigator = () => (
  <HomeScreen />
);

export default AppNavigator;