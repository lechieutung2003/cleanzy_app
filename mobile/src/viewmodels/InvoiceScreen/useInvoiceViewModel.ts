import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigation, NavigationProp, useRoute, RouteProp } from '@react-navigation/native';
import OAuthService from '../../services/oauth';
import InvoiceService from '../../services/invoice';

type RootStackParamList = {
  Invoice: {
    orderId?: number | string;
    invoice?: Partial<InvoiceData>;
  };
  Home: undefined;
};

export interface InvoiceData {
  name: string;
  phone: string;
  address: string;
  type: string;
  area: string;        // ví dụ: "20 m2"
  startTime: string;   // ISO string hoặc text đã format
  endTime: string;     // ISO string hoặc text đã format
  note?: string;
  duration?: string;   // ví dụ: "1 hour"
  method?: string;     // ví dụ: "Cash"
  price?: number;      // đơn vị VND
  vat?: number;        // ví dụ: 0.1 (10%)
}

function formatDateTime(input?: string) {
  if (!input) return '';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}
${d.toLocaleDateString()}`;
}

function formatCurrencyVND(n?: number) {
  if (typeof n !== 'number') return '';
  return n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
}

export default function useInvoiceViewModel() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Invoice'>>();

  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);

  const load = useCallback(async () => {
    const params = route.params || {};
    // Nếu có data invoice gửi sẵn từ màn trước thì dùng luôn
    if (params.invoice) {
      const inv = params.invoice;
      setInvoice({
        name: inv.name || '',
        phone: inv.phone || '',
        address: inv.address || '',
        type: inv.type || '',
        area: inv.area || '',
        startTime: inv.startTime || '',
        endTime: inv.endTime || '',
        note: inv.note || '',
        duration: inv.duration || '',
        method: inv.method || '',
        price: inv.price,
        vat: inv.vat ?? 0.1,
      });
      return;
    }

    // Nếu không có sẵn thì fetch theo orderId
    if (!params.orderId) return;
    setLoading(true);
    try {
      const token = await OAuthService.getAccessToken?.();
      const data = await InvoiceService.getInvoice(params.orderId as string | number, token || '');
      // Map dữ liệu từ API về đúng shape
      setInvoice({
        name: data?.customer_name ?? '',
        phone: data?.customer_phone ?? '',
        address: data?.address ?? '',
        type: data?.service_type ?? '',
        area: data?.area_text ?? (data?.area ? `${data.area} m2` : ''),
        startTime: formatDateTime(data?.start_time),
        endTime: formatDateTime(data?.end_time),
        note: data?.note ?? '',
        duration: data?.duration_text ?? '',
        method: data?.payment_method ?? '',
        price: data?.price_total ?? data?.price,
        vat: typeof data?.vat === 'number' ? data.vat : 0.1,
      });
    } finally {
      setLoading(false);
    }
  }, [route.params]);

  useEffect(() => {
    load();
  }, [load]);

  const totals = useMemo(() => {
    const price = invoice?.price ?? 0;
    const vat = invoice?.vat ?? 0;
    const vatAmount = Math.round(price * vat);
    const grand = price + vatAmount;
    return {
      priceText: formatCurrencyVND(price),
      vatText: `VAT ${(vat * 100).toFixed(0)}%`,
      grandText: formatCurrencyVND(grand),
    };
  }, [invoice]);

  const onCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onHome = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);

  return {
    loading,
    invoice,
    totals,
    onCancel,
    onHome,
  };
}