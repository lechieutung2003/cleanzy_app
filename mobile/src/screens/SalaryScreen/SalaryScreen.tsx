import React from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import Header from '../../components/EmployeeHeader';
import EmployeeBottomTabBar from '../../components/EmployeeBottomTabBar';
import useSalaryViewModel from '../../viewmodels/SalaryScreen/useSalaryViewModel';
import dayjs from 'dayjs';

export default function SalaryScreen() {
    const vm = useSalaryViewModel();

    return (
        <SafeAreaView style={styles.container}>
            <Header />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={vm.loading} onRefresh={vm.refresh} />}
            >
                {/* show current month only */}
                <View style={styles.monthNav}>
                    <Text style={styles.monthText}>{dayjs(vm.currentMonth).format('MMMM YYYY')}</Text>
                </View>

                <View style={styles.card}>
                    {vm.loading && !vm.fromCache ? (
                        <ActivityIndicator />
                    ) : (
                        <>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <View>
                                    <Text style={styles.title}>Salary (hourly) — current month</Text>
                                    <Text style={styles.amount}>
                                        {vm.hourlyRate ? `${Number(vm.hourlyRate).toLocaleString()} đ / hour` : 'No data'}
                                    </Text>
                                    <Text style={styles.amountSecondary}>
                                        Total Salary: {vm.totalPay ? `${Number(vm.totalPay).toLocaleString()} đ` : '0 đ'}
                                    </Text>
                                </View>
                                {vm.fromCache && <Text style={styles.cacheLabel}>Cached</Text>}
                            </View>

                            <View style={styles.metricsRow}>
                                <View style={styles.metric}>
                                    <Text style={styles.metricLabel}>Completed orders</Text>
                                    <Text style={styles.metricValue}>{vm.orders ?? vm.data?.completed_orders_count ?? 0}</Text>
                                </View>
                                <View style={styles.metric}>
                                    <Text style={styles.metricLabel}>Total hours</Text>
                                    <Text style={styles.metricValue}>{vm.totalHours ?? vm.data?.total_hours_worked ?? 0}</Text>
                                </View>
                            </View>
                        </>
                    )}
                </View>

                {/* Insights (current month only) */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Insights (this month)</Text>

                    <View style={{ marginBottom: 12 }}>
                        <Text style={styles.sectionSubtitle}>Average pay per working day</Text>
                        <Text style={styles.insightBig}>{vm.avgPayPerDay ? `${vm.avgPayPerDay.toLocaleString()} đ` : '0 đ'}</Text>
                        <Text style={styles.sectionSubtitle}>Estimated working days: {vm.workingDaysEstimate}</Text>
                    </View>

                    <Text style={styles.sectionSubtitle}>Hourly rate & total</Text>
                    <Image source={{ uri: vm.quickChartBarUrl() }} style={styles.chart} resizeMode="contain" />

                    <Text style={[styles.sectionSubtitle, { marginTop: 12 }]}>Hours utilization (worked vs expected)</Text>
                    <Image source={{ uri: vm.quickChartDonutUrl() }} style={styles.smallChart} resizeMode="contain" />

                    <View style={styles.smallStatsRow}>
                        <View style={styles.smallStat}>
                            <Text style={styles.smallStatLabel}>Orders / hour</Text>
                            <Text style={styles.smallStatValue}>{vm.ordersPerHour ?? 0}</Text>
                        </View>
                        <View style={styles.smallStat}>
                            <Text style={styles.smallStatLabel}>Utilization</Text>
                            <Text style={styles.smallStatValue}>{vm.utilizationPercent}%</Text>
                        </View>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            <EmployeeBottomTabBar activeTab="salary" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    content: { padding: 16, paddingBottom: 120 },
    monthNav: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    monthText: { fontSize: 16, fontWeight: '700', color: '#0F7B5E' },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F3F4F6' },
    title: { fontSize: 14, color: '#6B7280' },
    amount: { fontSize: 20, fontWeight: '800', color: '#0F7B5E', marginTop: 8 },
    amountSecondary: { fontSize: 18, fontWeight: '700', color: '#111827', marginTop: 6 },
    metricsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
    metric: { alignItems: 'center', flex: 1 },
    metricLabel: { fontSize: 12, color: '#9CA3AF' },
    metricValue: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 6 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0F7B5E', marginBottom: 6 },
    sectionSubtitle: { fontSize: 12, color: '#6B7280', marginBottom: 6 },
    insightBig: { fontSize: 20, fontWeight: '800', color: '#0F7B5E', marginBottom: 6 },
    chart: { width: '100%', height: 200, backgroundColor: '#fff' },
    smallChart: { width: '100%', height: 160, backgroundColor: '#fff' },
    smallStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
    smallStat: { flex: 1, alignItems: 'center' },
    smallStatLabel: { fontSize: 12, color: '#9CA3AF' },
    smallStatValue: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 6 },
    cacheLabel: { fontSize: 12, color: '#9CA3AF' },
});