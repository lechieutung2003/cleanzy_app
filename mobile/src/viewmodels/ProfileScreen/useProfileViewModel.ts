import { useState, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
// @ts-ignore
import CustomerService from '../../services/customer';

interface CustomerInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  area: string;
  img: string | null;
}

export default function useProfileViewModel() {
  const navigation = useNavigation();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch customer info khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      fetchCustomerInfo();
    }, [])
  );

  const fetchCustomerInfo = async () => {
    try {
      setLoading(true);
      const response = await CustomerService.getCustomerInfo();
      console.log('Customer info:', response);
      setCustomerInfo(response);
    } catch (error) {
      console.error('Error fetching customer info:', error);
    } finally {
      setLoading(false);
    }
  };

  const onEditProfile = useCallback(() => {
    (navigation as any).navigate('EditProfile');
  }, [navigation]);

  const onChangePassword = useCallback(() => {
    console.log('Change Password');
    // TODO: Navigate to ChangePassword screen
  }, []);

  const onPrivacyPolicy = useCallback(() => {
    console.log('Privacy Policy');
    // TODO: Navigate to PrivacyPolicy screen
  }, []);

  const onTermsOfUse = useCallback(() => {
    console.log('Terms of Use');
    // TODO: Navigate to TermsOfUse screen
  }, []);

  const onLogout = useCallback(() => {
    console.log('Logout');
    // TODO: Clear token and navigate to PreLogin
    (navigation as any).navigate('PreLogin');
  }, [navigation]);

  const onSupport = useCallback(() => {
    console.log('Support');
    // TODO: Open support/chat
  }, []);

  const onBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Menu items
  const menuItems = [
    {
      id: 1,
      title: 'Edit Profile',
      icon: require('../../assets/edit_icon.png'),
      onPress: onEditProfile,
    },
    {
      id: 2,
      title: 'Change Password',
      icon: require('../../assets/pass_icon.png'),
      onPress: onChangePassword,
    },
    {
      id: 3,
      title: 'Privacy Policy',
      icon: require('../../assets/protect_icon.png'),
      onPress: onPrivacyPolicy,
    },
    {
      id: 4,
      title: 'Terms of Use',
      icon: require('../../assets/book_icon.png'),
      onPress: onTermsOfUse,
    },
  ];

  return {
    customerInfo,
    loading,
    menuItems,
    onLogout,
    onSupport,
    onBack,
    onEditProfile,
  };
}
