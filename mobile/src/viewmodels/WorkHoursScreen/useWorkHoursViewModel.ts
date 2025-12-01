import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import dayjs from 'dayjs';
import EmployeeService from '../../services/employee';

type WorkingStatus = 'working' | 'not-working' | null;

export default function useWorkHoursViewModel() {
    const [loading, setLoading] = useState(false);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<Date | null>(null);

    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const formatHHmm = (d?: Date | null) => {
        if (!d) return '';
        const dd = dayjs(d);
        return dd.isValid() ? dd.format('HH:mm') : '';
    };

    const parseTimeToDate = (timeValue: any) => {
        if (!timeValue && timeValue !== '' && timeValue !== 0) return null;
        const s = String(timeValue).trim();
        if (!s) return null;

        const match = s.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
        if (match) {
            const hh = parseInt(match[1], 10);
            const mm = parseInt(match[2], 10);
            const ss = match[3] ? parseInt(match[3], 10) : 0;

            const now = new Date();
            now.setHours(hh, mm, ss, 0);
            return now;
        }
        return null;
    };

    const loadProfile = async () => {
        setLoading(true);
        try {
            const res = await EmployeeService.getMyProfile();
            const parsedStart = parseTimeToDate(res?.working_start_time);
            setStartTime(parsedStart);
            const parsedEnd = parseTimeToDate(res?.working_end_time);
            setEndTime(parsedEnd);
        } catch (err) {
            console.warn('Failed load profile', err);
            setStartTime(null);
            setEndTime(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const getCurrentWorkingStatus = (): WorkingStatus => {
        if (!startTime || !endTime) return null;

        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        const startTimeMin = startTime.getHours() * 60 + startTime.getMinutes();
        const endTimeMin = endTime.getHours() * 60 + endTime.getMinutes();

        if (currentTime >= startTimeMin && currentTime < endTimeMin) return 'working';
        return 'not-working';
    };

    const handleSubmitHours = async () => {
        if (!startTime && !endTime) {
            Alert.alert('Notice', 'Please select start or end time.');
            return;
        }
        if (startTime && endTime && endTime.getTime() < startTime.getTime()) {
            Alert.alert('Notice', 'End time must be later than start time.');
            return;
        }

        setLoading(true);
        try {
            const payload: any = {};
            if (startTime !== undefined) payload.working_start_time = startTime ? formatHHmm(startTime) : null;
            if (endTime !== undefined) payload.working_end_time = endTime ? formatHHmm(endTime) : null;

            const res = await EmployeeService.setWorkingHours(payload);
            if (res?.detail || res?.errors) {
                const msg = res.detail || JSON.stringify(res.errors);
                Alert.alert('Error', msg);
            } else {
                Alert.alert('Success', 'Working hours updated successfully.');
                await loadProfile();
            }
        } catch (e: any) {
            Alert.alert('Error', e?.message || 'Failed to update working hours.');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestTimeOff = async () => {
        Alert.alert(
            'Request Time Off',
            'Are you sure you want to request time off today?',
            [
                { text: 'Cancel', onPress: () => { }, style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const payload = { working_start_time: null, working_end_time: null };
                            const res = await EmployeeService.setWorkingHours(payload);
                            if (res?.detail || res?.errors) {
                                const msg = res.detail || JSON.stringify(res.errors);
                                Alert.alert('Error', msg);
                            } else {
                                Alert.alert('Success', 'Time-off request submitted.');
                                setStartTime(null);
                                setEndTime(null);
                                await loadProfile();
                            }
                        } catch (e: any) {
                            Alert.alert('Error', e?.message || 'Failed to send time-off request.');
                        } finally {
                            setLoading(false);
                        }
                    },
                    style: 'destructive',
                },
            ]
        );
    };

    return {
        loading,
        startTime,
        endTime,
        showStartPicker,
        showEndPicker,
        setShowStartPicker,
        setShowEndPicker,
        setStartTime,
        setEndTime,
        formatHHmm,
        loadProfile,
        handleSubmitHours,
        handleRequestTimeOff,
        getCurrentWorkingStatus,
        hasWorkingHours: Boolean(startTime || endTime),
    };
}