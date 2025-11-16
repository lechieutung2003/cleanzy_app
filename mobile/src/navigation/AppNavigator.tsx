// import React from 'react';
// import { createStackNavigator } from '@react-navigation/stack';
// import HomeScreen from '../screens/HomeScreen/HomeScreen';
// import LoginScreen from '../screens/LoginScreen/LoginScreen';
// import HistoryScreen from '../screens/HistoryScreen/HistoryScreen';

// const Stack = createStackNavigator();

// // DEV MODE: Tắt Home và Login để code UI History
// const DEV_MODE = false;

// const AppNavigator = () => (
//   <Stack.Navigator initialRouteName="History" screenOptions={{ headerShown: false }}>
//     {!DEV_MODE && <Stack.Screen name="Home" component={HomeScreen} />}
//     {!DEV_MODE && <Stack.Screen name="Login" component={LoginScreen} />}
//     <Stack.Screen name="History" component={HistoryScreen} />
//   </Stack.Navigator>
// );

// export default AppNavigator;

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PreLoginScreen from '../screens/LoginScreen/PreLoginScreen';
import LoginScreen from '../screens/LoginScreen/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen/RegisterScreen';
import ForgotScreen from '../screens/ForgotPassScreen/ForgotScreen';
import CreateOrderScreen from '../screens/CreateOrderScreen/CreateOrderScreen';
import MainTabNavigator from './MainTabNavigator';
import ServiceDetailScreen from '../screens/ServiceDetailScreen/ServiceDetailScreen';
import PaymentScreen from '../screens/PaymentScreen/PaymentScreen';
import PendingPaymentScreen from '../screens/PendingPaymentScreen/PendingPaymentScreen';
import ProfileScreen from '../screens/ProfileScreen/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen/EditProfileScreen';
import ChangePasswordScreen from '../screens/ChangePassWordScreen/ChangePassWordScreen';
import PolicyScreen from '../screens/PolicyScreen/PolicyScreen';
import TermOfUseScreen from '../screens/TermOfUseScreen/TermOfUseScreen';
import CustomerSupportScreen from '../screens/CustomerSupport/CustomerSupport';
import ChangePassScreen from '../screens/ChangePassScreen/ChangePassScreen';
import InvoiceScreen from '../screens/InvoiceScreen/InvoiceScreen';

const Stack = createStackNavigator();

// DEV MODE: khi true sẽ chỉ show screen để test UI
const DEV_MODE = false; // Set false để test ProfileScreen

const AppNavigator = () => {
  if (DEV_MODE) {
    return (
      <Stack.Navigator initialRouteName="Payment" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="PendingPayment" component={PendingPaymentScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator initialRouteName="MainTabs" screenOptions={{ headerShown: false }}>
      {!DEV_MODE && <Stack.Screen name="PreLogin" component={PreLoginScreen} />}
      {!DEV_MODE && <Stack.Screen name="Login" component={LoginScreen} />}
      {!DEV_MODE && <Stack.Screen name="Register" component={RegisterScreen} />}
      {!DEV_MODE && <Stack.Screen name="ForgotPassword" component={ForgotScreen} />}
      {!DEV_MODE && <Stack.Screen name="ChangePass" component={ChangePassScreen} />}
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
      <Stack.Screen name="CreateOrder" component={CreateOrderScreen} />
      {/* <Stack.Screen name="Invoice" component={InvoiceScreen} /> */}
      <Stack.Screen name="Invoice" component={InvoiceScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen}/>
      <Stack.Screen name="Policy" component={PolicyScreen} />
      <Stack.Screen name="TermOfUse" component={TermOfUseScreen} />
      <Stack.Screen name="CustomerSupport" component={CustomerSupportScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;