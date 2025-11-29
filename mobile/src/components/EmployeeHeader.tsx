import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import useEmployeeHeaderViewModel from '../viewmodels/EmployeeHeader/useEmployeeHeaderViewModel';

interface EmployeeHeaderProps {
    showProfile?: boolean;
}

const EmployeeHeader: React.FC<EmployeeHeaderProps> = ({ showProfile = true }) => {
    const {
        profile,
        loading,
        avatarSource,
        fullName,
        workArea,
        handleNotificationPress,
        handleAvatarPress,
    } = useEmployeeHeaderViewModel();

    console.log('EmployeeHeader - profile:', profile);


    return (
        <View style={styles.container}>
            {/* Avatar */}
            {showProfile && (
                <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.8}>
                    <Image
                        source={avatarSource || require('../assets/avt.png')}
                        style={styles.avatar}
                    />
                </TouchableOpacity>
            )}

            {/* Employee Info */}
            <View style={styles.infoContainer}>
                <Text style={styles.greeting}>Hello,</Text>
                <Text style={styles.name} numberOfLines={1}>
                    {loading ? 'Loading...' : fullName}
                </Text>
                {workArea && (
                    <View style={styles.areaContainer}>
                        <Image
                            source={require('../assets/location_icon.png')}
                            style={styles.locationIcon}
                        />
                        <Text style={styles.areaText}>{workArea}</Text>
                    </View>
                )}
            </View>

            {/* Notification Bell */}
            <TouchableOpacity onPress={handleNotificationPress} style={styles.notificationBtn}>
                <Image
                    source={require('../assets/noti_icon.png')}
                    style={styles.notificationIcon}
                />
                {/* Optional: Add badge for unread notifications */}
                {/* <View style={styles.badge} /> */}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 48,
        paddingBottom: 12,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#0F7B5E',
    },
    infoContainer: {
        flex: 1,
        marginLeft: 12,
    },
    greeting: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '400',
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginTop: 2,
    },
    areaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    locationIcon: {
        width: 14,
        height: 14,
        tintColor: '#0F7B5E',
        marginRight: 4,
    },
    areaText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    notificationBtn: {
        padding: 8,
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationIcon: {
        width: 24,
        height: 24,
        tintColor: '#f59e0b',
    },
    badge: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ef4444',
    },
});

export default EmployeeHeader;