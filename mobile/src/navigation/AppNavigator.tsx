import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen/HomeScreen';
import LoginScreen from '../screens/LoginScreen/LoginScreen';
import HistoryScreen from '../screens/HistoryScreen/HistoryScreen';

const Stack = createStackNavigator();

// DEV MODE: Tắt Home và Login để code UI History
const DEV_MODE = true;

const AppNavigator = () => (
  <Stack.Navigator initialRouteName="History" screenOptions={{ headerShown: false }}>
    {!DEV_MODE && <Stack.Screen name="Home" component={HomeScreen} />}
    {!DEV_MODE && <Stack.Screen name="Login" component={LoginScreen} />}
    <Stack.Screen name="History" component={HistoryScreen} />
  </Stack.Navigator>
);

export default AppNavigator;