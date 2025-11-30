import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import EmployeeService from '../../services/employee';

export default function useEmployeeHeaderViewModel() {
    const navigation = useNavigation<any>();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const data = await EmployeeService.getMyProfile();
            setProfile(data);
        } catch (error) {
            console.error('EmployeeHeader - loadProfile error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationPress = () => {
        // Navigate to notifications screen
        // navigation.navigate('Notifications');
        console.log('Notification pressed');
    };

    const handleAvatarPress = () => {
        // Navigate to profile screen
        if (profile) {
            navigation.navigate('Profile', { 
                employeeData: profile 
            });
        }
        // console.log('Avatar pressed');
    };

    const avatarSource = profile?.avatar
        ? { uri: profile.avatar }
        : null;

    const fullName = profile
        ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Employee'
        : 'Employee';

    const workArea = profile?.area || null;

    return {
        profile,
        loading,
        avatarSource,
        fullName,
        workArea,
        handleNotificationPress,
        handleAvatarPress,
        refresh: loadProfile,
    };
}