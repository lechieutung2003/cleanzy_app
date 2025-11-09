import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PreLoginScreen from '../screens/LoginScreen/PreLoginScreen';
import LoginScreen from '../screens/LoginScreen/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen/RegisterScreen';
import ForgotScreen from '../screens/ForgotPassScreen/ForgotScreen';
import CreateOrderScreen from '../screens/CreateOrderScreen/CreateOrderScreen';
import HistoryScreen from '../screens/HistoryScreen/HistoryScreen';
import FavoriteScreen from '../screens/FavoriteScreen/FavoriteScreen';
import HomeScreen from '../screens/HomeScreen/HomeScreen';
import ServiceDetailScreen from '../screens/ServiceDetailScreen/ServiceDetailScreen';
import ChangePassScreen from '../screens/ChangePassScreen/ChangePassScreen';
import PaymentScreen from '../screens/PaymentScreen/PaymentScreen';
import PendingPaymentScreen from '../screens/PendingPaymentScreen/PendingPaymentScreen';

const Stack = createStackNavigator();

// DEV MODE: khi true sẽ chỉ show screen để test UI
const DEV_MODE = true;

const AppNavigator = () => (
  <Stack.Navigator initialRouteName={DEV_MODE ? "History" : "PreLogin"} screenOptions={{ headerShown: false }}>
    {!DEV_MODE && <Stack.Screen name="PreLogin" component={PreLoginScreen} />}
    {!DEV_MODE && <Stack.Screen name="Login" component={LoginScreen} />}
    {!DEV_MODE && <Stack.Screen name="Register" component={RegisterScreen} />}
    {!DEV_MODE && <Stack.Screen name="ForgotPassword" component={ForgotScreen} />}
    {!DEV_MODE && <Stack.Screen name="ChangePassword" component={ChangePassScreen} />}
    {!DEV_MODE && <Stack.Screen name="Home" component={HomeScreen} />}
    {!DEV_MODE && <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />}
    {!DEV_MODE && <Stack.Screen name="CreateOrder" component={CreateOrderScreen} />}
    {!DEV_MODE && <Stack.Screen name="Favorite" component={FavoriteScreen} />}
    <Stack.Screen name="History" component={HistoryScreen} />
  </Stack.Navigator>
);

export default AppNavigator;