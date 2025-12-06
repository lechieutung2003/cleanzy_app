import { useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import customerService from '../../services/customer';
import serviceTypeService from '../../services/serviceType';
import  OrderService  from '../../services/order';


interface CustomerInfo { id: string; name: string; phone_number: string; address: string; email?: string; }
interface ServiceType { id: string; name: string; price_per_m2: number; description?: string; }

export interface OrderFormData {
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

export default function useCreateOrderViewModel() {
  const route = useRoute<any>();
  const serviceFromParams = route.params?.service ?? null;

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const [formData, setFormData] = useState<OrderFormData>(defaultForm);

  // Load customer info
  useEffect(() => { loadCustomerInfo(); }, []);

  // Load service types
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

  // Calculate cost when area or service type changes
  useEffect(() => {
    if (selectedServiceType && formData.area_m2) {
      const cost = selectedServiceType.price_per_m2 * formData.area_m2;
      setFormData(prev => ({
        ...prev,
        cost_confirm: cost,
        estimated_hours: calculateEstimatedHours(prev.area_m2),
      }));
    }
  }, [selectedServiceType, formData.area_m2]);

  const loadCustomerInfo = async () => {
    try {
      setLoading(true);
      const data = await customerService.getCustomerInfo();
      setCustomerInfo(data);
    } catch (err: any) {
      setError(err?.message ?? 'Không thể tải thông tin khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const loadServiceTypes = async () => {
    try {
      setLoading(true);
      const data = await serviceTypeService.getServiceTypeById('1fd520d16a2b45bf836269d5af828b60');
      const svc: ServiceType = { id: data.id, name: data.name, price_per_m2: data.price_per_m2, description: data.description };
      setServiceTypes([svc]);
      setSelectedServiceType(svc);
      setFormData(prev => ({ ...prev, service_type: svc.id }));
    } catch (err: any) {
      setError(err?.message ?? 'Không thể tải loại dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const calculateEstimatedHours = (area: number): number => Math.ceil(area / 20);

  const updateFormField = <K extends keyof OrderFormData>(field: K, value: OrderFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const SmartPricing = async (formData: {
    service_id: string;
    area_m2: number;
    hours_peak: boolean;
    customer_id: string;
  }) => {
    try {
      const result = await OrderService.predictSmartPricing(formData);
      // console.log('Smart Pricing Result:', result);
      return result;
    } catch (err) {
      throw err;
    }
  }

  return {
    customerInfo,
    serviceTypes,
    selectedServiceType,
    formData,
    loading,
    error,
    updateFormField,
    SmartPricing,
  };
}