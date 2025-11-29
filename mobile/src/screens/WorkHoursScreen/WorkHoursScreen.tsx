import React from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../../components/Header';
import EmployeeBottomTabBar from '../../components/EmployeeBottomTabBar';
import PrimaryButton from '../../components/PrimaryButton';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import useWorkHoursViewModel from '../../viewmodels/WorkHoursScreen/useWorkHoursViewModel';

export default function WorkHoursScreen() {
    const navigation = useNavigation();
    const vm = useWorkHoursViewModel();

    const workingStatus = vm.getCurrentWorkingStatus();

    return (
        <SafeAreaView style={styles.container}>
            <Header showSearch={false} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Status Card - Updated */}
                {vm.hasWorkingHours && (
                    <View style={styles.statusCard}>
                        <View style={styles.statusHeader}>
                            <View style={styles.statusIconContainer}>
                                <Text style={styles.clockIcon}>🕐</Text>
                            </View>
                            <View style={styles.statusTextContainer}>
                                <Text style={styles.statusLabel}>Today's Working Hours</Text>
                                <Text style={styles.statusTime}>
                                    {vm.formatHHmm(vm.startTime)} - {vm.formatHHmm(vm.endTime)}
                                </Text>
                            </View>
                        </View>

                        {/* Status Badge */}
                        <View style={styles.statusBadgeContainer}>
                            <View
                                style={[
                                    styles.statusBadge,
                                    workingStatus === 'working'
                                        ? styles.statusBadgeWorking
                                        : styles.statusBadgeNotWorking,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.statusBadgeText,
                                        workingStatus === 'working'
                                            ? styles.statusBadgeTextWorking
                                            : styles.statusBadgeTextNotWorking,
                                    ]}
                                >
                                    {workingStatus === 'working' ? '● Currently Working' : '○ Not Working'}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Declare Working Hours Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Declare Working Hours</Text>
                        <Text style={styles.cardSubtitle}>Set your work start and end time</Text>
                    </View>

                    <View style={styles.timeInputRow}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={styles.label}>Start Time</Text>
                            <TouchableOpacity
                                style={[styles.inputBox, vm.startTime && styles.inputBoxActive]}
                                onPress={() => vm.setShowStartPicker(true)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.inputIcon]}>🕐</Text>
                                <Text style={[styles.inputText, vm.startTime && styles.inputTextActive]}>
                                    {vm.startTime ? vm.formatHHmm(vm.startTime) : 'Select'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <Text style={styles.label}>End Time</Text>
                            <TouchableOpacity
                                style={[styles.inputBox, vm.endTime && styles.inputBoxActive]}
                                onPress={() => vm.setShowEndPicker(true)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.inputIcon]}>🕑</Text>
                                <Text style={[styles.inputText, vm.endTime && styles.inputTextActive]}>
                                    {vm.endTime ? vm.formatHHmm(vm.endTime) : 'Select'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <DateTimePickerModal
                        isVisible={vm.showStartPicker}
                        mode="time"
                        is24Hour
                        date={vm.startTime ?? new Date()}
                        onConfirm={(date) => {
                            vm.setShowStartPicker(false);
                            vm.setStartTime(date);
                        }}
                        onCancel={() => vm.setShowStartPicker(false)}
                    />
                    <DateTimePickerModal
                        isVisible={vm.showEndPicker}
                        mode="time"
                        is24Hour
                        date={vm.endTime ?? new Date()}
                        onConfirm={(date) => {
                            vm.setShowEndPicker(false);
                            vm.setEndTime(date);
                        }}
                        onCancel={() => vm.setShowEndPicker(false)}
                    />

                    <PrimaryButton
                        title={vm.loading ? 'Submitting...' : 'Submit Working Hours'}
                        onPress={vm.handleSubmitHours}
                        loading={vm.loading}
                        style={{ marginTop: 16 }}
                    />

                    <Text style={styles.helpText}>
                        Your working hours will be recorded and can be reviewed later.
                    </Text>
                </View>

                {/* Time Off Card */}
                <View style={[styles.card, styles.cardTimeOff]}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitleTimeOff}>Request Time Off</Text>
                        <Text style={styles.cardSubtitle}>Clear your schedule for the day</Text>
                    </View>

                    <Text style={styles.timeOffDescription}>
                        Request a full day off by clicking the button below. This will clear all working hours.
                    </Text>

                    <PrimaryButton
                        title="Request Time Off"
                        onPress={vm.handleRequestTimeOff}
                        style={{ backgroundColor: '#ef4444', marginTop: 12 }}
                    />
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>

            <EmployeeBottomTabBar activeTab="workhours" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 120,
    },

    // Status Card
    statusCard: {
        backgroundColor: '#ECFDF5',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#0F7B5E',
        shadowColor: '#0F7B5E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 14,
        backgroundColor: '#D1FAE5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    clockIcon: {
        fontSize: 28,
    },
    statusTextContainer: {
        flex: 1,
    },
    statusLabel: {
        fontSize: 12,
        color: '#047857',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    statusTime: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0F7B5E',
        marginTop: 4,
    },

    // Status Badge
    statusBadgeContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignItems: 'center',
    },
    statusBadgeWorking: {
        backgroundColor: '#DBEAFE',
        borderWidth: 1,
        borderColor: '#0EA5E9',
    },
    statusBadgeNotWorking: {
        backgroundColor: '#FEE2E2',
        borderWidth: 1,
        borderColor: '#EF4444',
    },
    statusBadgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    statusBadgeTextWorking: {
        color: '#0369A1',
    },
    statusBadgeTextNotWorking: {
        color: '#991B1B',
    },

    // Main Card
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    cardHeader: {
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F7B5E',
        marginBottom: 4,
    },
    cardTitleTimeOff: {
        fontSize: 18,
        fontWeight: '700',
        color: '#DC2626',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 13,
        color: '#9CA3AF',
    },

    // Time Input
    timeInputRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    inputBox: {
        height: 52,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        justifyContent: 'space-between',
    },
    inputBoxActive: {
        borderColor: '#0F7B5E',
        backgroundColor: '#ECFDF5',
    },
    inputIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    inputText: {
        fontSize: 16,
        color: '#9CA3AF',
        fontWeight: '500',
        flex: 1,
    },
    inputTextActive: {
        color: '#0F7B5E',
        fontWeight: '600',
    },

    // Time Off Card
    cardTimeOff: {
        borderLeftWidth: 4,
        borderLeftColor: '#DC2626',
        backgroundColor: '#FEF2F2',
    },
    timeOffDescription: {
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 20,
        marginBottom: 12,
    },

    // Help Text
    helpText: {
        marginTop: 16,
        fontSize: 12,
        color: '#9CA3AF',
        lineHeight: 18,
        fontStyle: 'italic',
    },
});