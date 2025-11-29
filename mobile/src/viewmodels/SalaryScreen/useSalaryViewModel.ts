import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import EmployeeService from '../../services/employee';

type SalaryData = {
    salary?: number | null;
    completed_orders_count?: number;
    total_hours_worked?: number;
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const cacheKeyForMonth = (monthKey: string) => `salary_cache_${monthKey}`;

export default function useSalaryViewModel() {
    const [loading, setLoading] = useState(false);
    const currentMonth = dayjs().startOf('month');
    const monthKey = currentMonth.format('YYYY-MM');

    const [data, setData] = useState<SalaryData | null>(null);
    const [history, setHistory] = useState<Array<{ month: string; salary: number }>>([]);
    const [fromCache, setFromCache] = useState(false);

    const readCache = useCallback(async (key: string) => {
        try {
            const raw = await AsyncStorage.getItem(key);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!parsed || !parsed.timestamp) return null;
            if (Date.now() - parsed.timestamp > CACHE_TTL) {
                await AsyncStorage.removeItem(key);
                return null;
            }
            return parsed.data;
        } catch (e) {
            console.warn('readCache error', e);
            return null;
        }
    }, []);

    const writeCache = useCallback(async (key: string, value: any) => {
        try {
            await AsyncStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), data: value }));
        } catch (e) {
            console.warn('writeCache error', e);
        }
    }, []);

    const normalizeProfileToSalary = (res: any): SalaryData => ({
        salary: res?.salary ?? res?.hourly_rate ?? res?.monthly_salary ?? null,
        completed_orders_count: res?.completed_orders_count ?? res?.completed_orders ?? 0,
        total_hours_worked: res?.total_hours_worked ?? res?.hours_worked ?? 0,
    });

    const loadSalary = useCallback(
        async (opts: { force?: boolean } = {}) => {
            const key = cacheKeyForMonth(monthKey);
            setLoading(true);
            setFromCache(false);

            try {
                if (!opts.force) {
                    const cached = await readCache(key);
                    if (cached) {
                        setData(cached.normalized);
                        setHistory(cached.history || []);
                        setFromCache(true);
                        (async () => {
                            try {
                                const resNet = await EmployeeService.getMyProfile();
                                const normalizedNet = normalizeProfileToSalary(resNet);
                                const fallbackHist = Array.from({ length: 6 }).map((_, i) => {
                                    const m2 = dayjs().subtract(i, 'month');
                                    return {
                                        month: m2.format('YYYY-MM'),
                                        salary: Math.round((normalizedNet.salary ?? 0) * (1 - i * 0.03)),
                                    };
                                }).reverse();
                                await writeCache(key, { normalized: normalizedNet, history: fallbackHist });
                                setData(normalizedNet);
                                setHistory(fallbackHist);
                                setFromCache(false);
                            } catch (_) { }
                        })();
                        setLoading(false);
                        return;
                    }
                }

                const res = await EmployeeService.getMyProfile();
                const normalized = normalizeProfileToSalary(res);

                const hist = Array.from({ length: 6 }).map((_, i) => {
                    const m2 = dayjs().subtract(i, 'month');
                    return {
                        month: m2.format('YYYY-MM'),
                        salary: Math.round((normalized.salary ?? 0) * (1 - i * 0.03)),
                    };
                }).reverse();

                setData(normalized);
                setHistory(hist);
                await writeCache(key, { normalized, history: hist });
                setFromCache(false);
            } catch (err) {
                console.warn('loadSalary error', err);
            } finally {
                setLoading(false);
            }
        },
        [monthKey, readCache, writeCache]
    );

    useEffect(() => {
        loadSalary({ force: false });
    }, [loadSalary]);

    const refresh = async () => {
        await loadSalary({ force: true });
    };

    const hourlyRate = Number(data?.salary ?? 0);
    const totalHours = Number(data?.total_hours_worked ?? 0);
    const totalPay = hourlyRate * totalHours;

    // estimate working days as hours / 8 (min 1)
    const workingDaysEstimate = Math.max(1, Math.round(totalHours / 8));
    const avgPayPerDay = workingDaysEstimate > 0 ? Math.round(totalPay / workingDaysEstimate) : 0;
    const orders = Number(data?.completed_orders_count ?? 0);
    const ordersPerHour = totalHours > 0 ? +(orders / totalHours).toFixed(2) : 0;

    const expectedHours = 160; // configurable heuristic
    const utilizationPercent = expectedHours > 0 ? Math.round((totalHours / expectedHours) * 100) : 0;
    const remainingHours = Math.max(0, expectedHours - totalHours);

    const quickChartBarUrl = () => {
        const labels = ['Avg / day', 'Total (đ)'];
        const dataSet = [avgPayPerDay, Math.round(totalPay)];
        const chart = {
            type: 'bar',
            data: { labels, datasets: [{ label: 'VND', data: dataSet, backgroundColor: ['#0F7B5E', '#06B6D4'] }] },
            options: { legend: { display: false }, scales: { yAxes: [{ ticks: { beginAtZero: true } }] } },
        };
        return `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chart))}&w=600&h=300`;
    };

    const quickChartDonutUrl = () => {
        const chart = {
            type: 'doughnut',
            data: {
                labels: ['Worked', 'Remaining'],
                datasets: [{ data: [Math.round(totalHours), Math.round(remainingHours)], backgroundColor: ['#0F7B5E', '#E5E7EB'] }],
            },
            options: { legend: { position: 'bottom' } },
        };
        return `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chart))}&w=400&h=240`;
    };

    const quickChartPieUrl = () => quickChartDonutUrl();

    const computeTotalPayFromProfile = (profile: any) => {
        const salaryRaw = profile?.salary ?? profile?.hourly_rate ?? profile?.hourlyRate ?? 0;
        const hoursRaw = profile?.total_hours_worked ?? profile?.hours_worked ?? profile?.hoursWorked ?? 0;
        const hourly = Number(salaryRaw) || 0;
        const hours = Number(hoursRaw) || 0;
        return hourly * hours;
    };

    return {
        loading,
        currentMonth,
        monthKey,
        data,
        history,
        refresh,
        quickChartBarUrl,
        quickChartDonutUrl,
        quickChartPieUrl, 
        fromCache,
        hourlyRate,
        totalPay,
        totalHours,
        workingDaysEstimate,
        avgPayPerDay,
        orders,
        ordersPerHour,
        utilizationPercent,
        expectedHours,
        computeTotalPayFromProfile,
    };
}