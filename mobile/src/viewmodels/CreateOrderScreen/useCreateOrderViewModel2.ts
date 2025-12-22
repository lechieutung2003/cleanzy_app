import { useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import orderService from '../../services/order';
import customerService from '../../services/customer';
import serviceTypeService from '../../services/serviceType';

interface CustomerInfo { id: string; name: string; phone: string; address: string; email?: string; area?: string; }
interface ServiceType { id: string; name: string; price_per_m2: number; description?: string; }

interface OrderFormData {
  service_type: string;
  area_m2: number;
  requested_hours: number;
  preferred_start_time: Date;
  preferred_end_time: Date;
  estimated_hours: number;
  cost_confirm: number;
  payment_method: 'CASH' | 'BANK_TRANSFER';
  note: string;
}

interface PaymentInfo {
  payment_id: string;
  payment_url: string;
  qr_code: string;
  order_code: number;
  account_number: string;
  account_name: string;
  amount: number;
  status: string;
  transfer_content: string;
  bank_name: string;
}

export default function useCreateOrderViewModel2() {
  const route = useRoute<any>();
  const serviceFromParams = route.params?.selectedServiceType ?? route.params?.service ?? null;
  const incomingForm = route.params?.formData;
  console.log('useCreateOrderViewModel2 - incomingForm:', incomingForm);
  const incomingCustomer = route.params?.customerInfo;

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseDates = (f: any) => {
    if (!f) return null;
    const clone = { ...f };
    if (clone.preferred_start_time && typeof clone.preferred_start_time === 'string') clone.preferred_start_time = new Date(clone.preferred_start_time);
    if (clone.preferred_end_time && typeof clone.preferred_end_time === 'string') clone.preferred_end_time = new Date(clone.preferred_end_time);
    return clone;
  };

  const defaultForm: OrderFormData = {
    service_type: serviceFromParams?.id || '1fd520d16a2b45bf836269d5af828b60',
    area_m2: 20,
    requested_hours: 1,
    preferred_start_time: new Date(),
    preferred_end_time: new Date(Date.now() + 3600000),
    estimated_hours: 1,
    cost_confirm: 0,
    payment_method: 'CASH',
    note: '',
  };

  const [formData, setFormData] = useState<OrderFormData>(() => {
    if (incomingForm) {
      const parsed = parseDates(incomingForm);
      return { ...defaultForm, ...parsed } as OrderFormData;
    }
    return defaultForm;
  });

  console.log('useCreateOrderViewModel2 - formData:', formData);

  useEffect(() => {
    console.log('Incoming customer info:', incomingCustomer);
    if (incomingCustomer) setCustomerInfo(incomingCustomer);
    else loadCustomerInfo();
  }, [incomingCustomer]);

  useEffect(() => {
    if (serviceFromParams) {
      const svc: ServiceType = {
        id: serviceFromParams.id,
        name: serviceFromParams.name,
        price_per_m2: serviceFromParams.price_per_m2,
        description: serviceFromParams.description,
      };
      setServiceTypes([svc]);
      setSelectedServiceType(svc);
      setFormData(prev => ({ ...prev, service_type: svc.id }));
    } else {
      loadServiceTypes();
    }
  }, [serviceFromParams]);

  useEffect(() => {
    if (incomingForm) {
      const parsed = parseDates(incomingForm);
      setFormData(prev => ({ ...prev, ...(parsed ?? {}) }));
    }
  }, [incomingForm]);

  useEffect(() => {
    if (selectedServiceType && formData.area_m2) {
      const cost = selectedServiceType.price_per_m2 * formData.area_m2;
      setFormData(prev => ({ ...prev, cost_confirm: cost, estimated_hours: calculateEstimatedHours(prev.area_m2) }));
    }
  }, [selectedServiceType, formData.area_m2]);

  const loadCustomerInfo = async () => {
    try {
      const data = await customerService.getCustomerInfo();
      console.log('Loaded customer info:', data);
      setCustomerInfo(data);
    } catch (err: any) {
      setError(err?.message ?? 'Không thể tải thông tin khách hàng');
    }
  };

  const loadServiceTypes = async () => {
    try {
      const data = await serviceTypeService.getServiceTypeById('1fd520d16a2b45bf836269d5af828b60');
      const serviceType = { id: data.id, name: data.name, price_per_m2: data.price_per_m2, description: data.description };
      setServiceTypes([serviceType]);
      setSelectedServiceType(serviceType);
      setFormData(prev => ({ ...prev, service_type: data.id }));
    } catch (err: any) {
      setError(err?.message ?? 'Không thể tải loại dịch vụ');
    }
  };

  const calculateEstimatedHours = (area: number): number => Math.ceil(area / 20);

  const updateFormField = <K extends keyof OrderFormData>(field: K, value: OrderFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotalHours = (): number => {
    try {
      const diff = formData.preferred_end_time.getTime() - formData.preferred_start_time.getTime();
      return Math.max(0, Math.round(diff / 3600000));
    } catch {
      return 0;
    }
  };

  const createOrder = async (proposedPrice?: number): Promise<{
    success: boolean;
    order_id?: string;
    data?: any;
    paymentInfo?: PaymentInfo;
    error?: string;
  } | null> => {
    if (!customerInfo) return { success: false, error: 'Chưa có thông tin khách hàng' };
    setLoading(true);
    setError(null);
    try {
      const orderPayload = {
        customer: customerInfo.id,
        service_type: selectedServiceType?.id || formData.service_type,
        area_m2: formData.area_m2,
        requested_hours: formData.requested_hours,
        preferred_start_time: formData.preferred_start_time.toISOString(),
        preferred_end_time: formData.preferred_end_time.toISOString(),
        estimated_hours: formData.estimated_hours,
        cost_confirm: proposedPrice ?? formData.cost_confirm,
        payment_method: formData.payment_method,
        note: formData.note,
      };

      const response = await orderService.createOrder(orderPayload);

      if (response.payment) {
        return { success: true, order_id: response.id, data: response, paymentInfo: response.payment };
      }
      return { success: true, order_id: response.id, data: response };
    } catch (err: any) {
      const msg = err?.message ?? 'Không thể tạo đơn hàng';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  return {
    customerInfo,
    serviceTypes,
    selectedServiceType,
    formData,
    loading,
    error,
    totalHours: calculateTotalHours(),
    totalPrice: formData.cost_confirm,
    updateFormField,
    createOrder,
  };
}