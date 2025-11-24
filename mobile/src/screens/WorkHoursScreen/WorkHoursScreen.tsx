import React, { useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../../components/Header';
import PrimaryButton from '../../components/PrimaryButton';
import DateTimePickerInput from '../../components/DateTimePickerInput';

interface WorkSession {
    id: string;
    date: string;
    checkIn: string;
    checkOut: string | null;
    duration: string;
    status: 'active' | 'completed';
}

export default function WorkHoursScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [currentCheckIn, setCurrentCheckIn] = useState<Date | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Mock data - thay thế bằng API call
    const [workSessions] = useState<WorkSession[]>([
        {
            id: '1',
            date: '2024-11-17',
            checkIn: '08:00',
            checkOut: '17:00',
            duration: '9h 0m',
            status: 'completed',
        },
        {
            id: '2',
            date: '2024-11-16',
            checkIn: '08:30',
            checkOut: '17:30',
            duration: '9h 0m',
            status: 'completed',
        },
        {
            id: '3',
            date: '2024-11-15',
            checkIn: '08:15',
            checkOut: '16:45',
            duration: '8h 30m',
            status: 'completed',
        },
    ]);

    const handleCheckIn = async () => {
        setLoading(true);
        try {
            // TODO: Call API to check in
            await new Promise(resolve => setTimeout(resolve, 1000));

            setIsCheckedIn(true);
            setCurrentCheckIn(new Date());

            Alert.alert('Success', 'Check-in successful!');
        } catch (error) {
            Alert.alert('Error', 'Failed to check in. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        setLoading(true);
        try {
            // TODO: Call API to check out
            await new Promise(resolve => setTimeout(resolve, 1000));

            setIsCheckedIn(false);
            setCurrentCheckIn(null);

            Alert.alert('Success', 'Check-out successful!');
        } catch (error) {
            Alert.alert('Error', 'Failed to check out. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getCurrentTime = () => {
        const now = new Date();
        return now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const getCurrentDate = () => {
        const now = new Date();
        return now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getWorkDuration = () => {
        if (!currentCheckIn) return '0h 0m';

        const now = new Date();
        const diff = now.getTime() - currentCheckIn.getTime();
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);

        return `${hours}h ${minutes}m`;
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header title="Work Hours" showBack />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Current Status Card */}
                <View style={styles.statusCard}>
                    <View style={styles.statusHeader}>
                        <View style={styles.statusIconContainer}>
                            <Text style={styles.clockEmoji}>⏰</Text>
                        </View>
                        <View style={styles.statusTextContainer}>
                            <Text style={styles.currentTime}>{getCurrentTime()}</Text>
                            <Text style={styles.currentDate}>{getCurrentDate()}</Text>
                        </View>
                    </View>

                    {isCheckedIn && (
                        <View style={styles.workingInfo}>
                            <View style={styles.workingRow}>
                                <Text style={styles.workingLabel}>Check-in time:</Text>
                                <Text style={styles.workingValue}>
                                    {currentCheckIn?.toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: false
                                    })}
                                </Text>
                            </View>
                            <View style={styles.workingRow}>
                                <Text style={styles.workingLabel}>Duration:</Text>
                                <Text style={styles.workingValue}>{getWorkDuration()}</Text>
                            </View>
                        </View>
                    )}

                    <View style={styles.statusBadge}>
                        <View style={[
                            styles.statusDot,
                            { backgroundColor: isCheckedIn ? '#10b981' : '#ef4444' }
                        ]} />
                        <Text style={styles.statusText}>
                            {isCheckedIn ? 'Working' : 'Not Working'}
                        </Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    {!isCheckedIn ? (
                        <PrimaryButton
                            title="Check In"
                            onPress={handleCheckIn}
                            loading={loading}
                            style={styles.checkInButton}
                        />
                    ) : (
                        <TouchableOpacity
                            style={styles.checkOutButton}
                            onPress={handleCheckOut}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.checkOutButtonText}>Check Out</Text>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                {/* Work History */}
                <View style={styles.historySection}>
                    <View style={styles.historyHeader}>
                        <Text style={styles.historyTitle}>Work History</Text>
                        <TouchableOpacity>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Date Filter */}
                    <View style={styles.dateFilterContainer}>
                        <Text style={styles.filterLabel}>Filter by date:</Text>
                        <DateTimePickerInput
                            label=""
                            value={selectedDate}
                            onChange={setSelectedDate}
                            mode="date"
                        />
                    </View>

                    {/* Work Sessions List */}
                    <View style={styles.sessionsList}>
                        {workSessions.map((session) => (
                            <View key={session.id} style={styles.sessionCard}>
                                <View style={styles.sessionHeader}>
                                    <Text style={styles.sessionDate}>
                                        {new Date(session.date).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </Text>
                                    <View style={[
                                        styles.sessionStatusBadge,
                                        { backgroundColor: session.status === 'completed' ? '#d1fae5' : '#fef3c7' }
                                    ]}>
                                        <Text style={[
                                            styles.sessionStatusText,
                                            { color: session.status === 'completed' ? '#059669' : '#f59e0b' }
                                        ]}>
                                            {session.status === 'completed' ? 'Completed' : 'Active'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.sessionDetails}>
                                    <View style={styles.sessionTimeRow}>
                                        <View style={styles.timeItem}>
                                            <Text style={styles.timeLabel}>Check In</Text>
                                            <Text style={styles.timeValue}>{session.checkIn}</Text>
                                        </View>

                                        <Text style={styles.arrowIconText}>→</Text>

                                        <View style={styles.timeItem}>
                                            <Text style={styles.timeLabel}>Check Out</Text>
                                            <Text style={styles.timeValue}>
                                                {session.checkOut || '--:--'}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.durationContainer}>
                                        <Text style={styles.durationIconText}>⏱</Text>
                                        <Text style={styles.durationText}>{session.duration}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 20,
    },
    statusCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    statusIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E8F5F1',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    clockEmoji: {
        fontSize: 28,
        color: '#0F7B5E',
    },
    statusTextContainer: {
        flex: 1,
    },
    currentTime: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0F7B5E',
    },
    currentDate: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    workingInfo: {
        backgroundColor: '#F8FFFE',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    workingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    workingLabel: {
        fontSize: 14,
        color: '#666',
    },
    workingValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0F7B5E',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    actionButtons: {
        marginTop: 20,
    },
    checkInButton: {
        backgroundColor: '#0F7B5E',
    },
    checkOutButton: {
        backgroundColor: '#ef4444',
        borderRadius: 25,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkOutButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    historySection: {
        marginTop: 32,
        marginBottom: 20,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    historyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0F7B5E',
    },
    viewAllText: {
        fontSize: 14,
        color: '#0F7B5E',
        textDecorationLine: 'underline',
    },
    dateFilterContainer: {
        marginBottom: 16,
    },
    filterLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    sessionsList: {
        gap: 12,
    },
    sessionCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    sessionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    sessionDate: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    sessionStatusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    sessionStatusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    sessionDetails: {
        gap: 12,
    },
    sessionTimeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    timeItem: {
        flex: 1,
        alignItems: 'center',
    },
    timeLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 4,
    },
    timeValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0F7B5E',
    },
    arrowIconText: {
        fontSize: 18,
        color: '#D1D5DB',
        marginHorizontal: 8,
    },
    durationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FFFE',
        padding: 8,
        borderRadius: 8,
    },
    durationIconText: {
        fontSize: 14,
        color: '#0F7B5E',
        marginRight: 6,
    },
    durationText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0F7B5E',
    },
});