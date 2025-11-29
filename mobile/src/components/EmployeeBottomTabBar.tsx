import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

type EmployeeTab = 'workhours' | 'orders' | 'salary';

interface EmployeeBottomTabBarProps {
    activeTab?: EmployeeTab;
    onTabPress?: (tab: EmployeeTab) => void;
}

const EmployeeBottomTabBar: React.FC<EmployeeBottomTabBarProps> = ({
    activeTab = 'workhours',
    onTabPress,
}) => {
    const navigation = useNavigation();

    const handlePress = (tab: EmployeeTab) => {
        if (onTabPress) onTabPress(tab);
        if (tab === 'workhours') navigation.navigate('WorkHours' as never);
        if (tab === 'orders') navigation.navigate('MyOrderScreen' as never); 
        if (tab === 'salary') navigation.navigate('SalaryScreen' as never); 
    };

    const renderTab = (tab: EmployeeTab, icon: any) => (
        <TouchableOpacity style={styles.tab} onPress={() => handlePress(tab)}>
            <Image
                source={icon}
                style={[
                    styles.icon,
                    { tintColor: activeTab === tab ? '#047857' : '#9ca3af' },
                ]}
                resizeMode="contain"
            />
            {activeTab === tab && <View style={styles.activeDot} />}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {renderTab('workhours', require('../assets/clock.png'))}
            {renderTab('orders', require('../assets/order.png'))}
            {renderTab('salary', require('../assets/salary.png'))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    tab: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    icon: {
        width: 28,
        height: 28,
    },
    activeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#047857',
        marginTop: 4,
    },
});

export default EmployeeBottomTabBar;