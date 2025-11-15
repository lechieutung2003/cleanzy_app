import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
// @ts-ignore
import CustomerService from '../../services/customer';

export default function useHeaderViewModel() {
  const navigation = useNavigation();
  const [avatarSource, setAvatarSource] = useState<{ uri: string } | null>(null);
  const [location, setLocation] = useState('');

  // Fetch user profile data and location
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const customerInfo = await CustomerService.getCustomerInfo();
        
        // Set avatar if available
        if (customerInfo.img) {
          setAvatarSource({ uri: customerInfo.img });
        }
        
        // Set location from address and area
        if (customerInfo.address && customerInfo.area) {
          setLocation(`${customerInfo.address}, ${customerInfo.area}`);
        } else if (customerInfo.area) {
          setLocation(customerInfo.area);
        } else if (customerInfo.address) {
          setLocation(customerInfo.address);
        }
      } catch (error) {
        console.error('Error fetching customer data:', error);
        // Keep default values on error
      }
    };
    
    fetchUserData();
  }, []);

  const handleNotificationPress = () => {
    console.log('Notification pressed');
    // TODO: Navigate to notifications screen
  };

  const handleAvatarPress = () => {
    (navigation as any).navigate('Profile');
  };

  return {
    avatarSource,
    location,
    handleNotificationPress,
    handleAvatarPress,
  };
}
