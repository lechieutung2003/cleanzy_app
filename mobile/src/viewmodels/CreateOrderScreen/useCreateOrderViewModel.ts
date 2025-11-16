import { useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import orderService from '../../services/order';
import customerService from '../../services/customer';
import serviceTypeService from '../../services/serviceType';


interface CustomerInfo {
  id: string;
  name: string;
  phone_number: string;
  address: string;
  email?: string;
}

interface ServiceType {
  id: string;
  name: string;
  price_per_m2: number;
  description?: string;
}

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

export default function useCreateOrderViewModel() {
  const route = useRoute<any>();
  const serviceFromParams = route.params?.service; // Nhận service từ params
  
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<OrderFormData>({
    service_type: serviceFromParams?.id || '1fd520d16a2b45bf836269d5af828b60',
    area_m2: 20,
    requested_hours: 1,
    preferred_start_time: new Date(),
    preferred_end_time: new Date(Date.now() + 3600000), // +1 hour
    estimated_hours: 1,
    cost_confirm: 0,
    payment_method: 'CASH',
    note: '',
  });

  // Load customer info
  useEffect(() => {
    loadCustomerInfo();
  }, []);

  // Load service types
  useEffect(() => {
    if (serviceFromParams) {
      // Nếu có service từ params, set luôn
      setSelectedServiceType({
        id: serviceFromParams.id,
        name: serviceFromParams.name,
        price_per_m2: serviceFromParams.price_per_m2,
        description: serviceFromParams.description,
      });
      setServiceTypes([serviceFromParams]); // Set vào array để tránh lỗi
    } else {
      // Nếu không, load từ API
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
        estimated_hours: calculateEstimatedHours(formData.area_m2),
      }));
    }
  }, [selectedServiceType, formData.area_m2]);

  const loadCustomerInfo = async () => {
    try {
      const data = await customerService.getCustomerInfo();
      setCustomerInfo(data);
    } catch (err: any) {
      console.error('Error loading customer info:', err);
      setError(err.message || 'Failed to load customer information');
    }
  };

  const loadServiceTypes = async () => {
    try {
      const data = await serviceTypeService.getServiceTypeById('1fd520d16a2b45bf836269d5af828b60');
      
      // Wrap single object vào array
      const serviceType = {
        id: data.id,
        name: data.name,
        price_per_m2: data.price_per_m2,
        description: data.description,
      };
      
      setServiceTypes([serviceType]);
      setSelectedServiceType(serviceType);
      setFormData(prev => ({
        ...prev,
        service_type: data.id,
      }));
    } catch (err: any) {
      console.error('Error loading service types:', err);
      setError(err.message || 'Failed to load service types');
    }
  };

  const calculateEstimatedHours = (area: number): number => {
    // Ước tính: 1 giờ cho 20m2
    return Math.ceil(area / 20);
  };

  const updateFormField = <K extends keyof OrderFormData>(
    field: K,
    value: OrderFormData[K]
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const selectServiceType = (serviceTypeId: string) => {
    const service = serviceTypes.find(s => s.id === serviceTypeId);
    if (service) {
      setSelectedServiceType(service);
      setFormData(prev => ({
        ...prev,
        service_type: serviceTypeId,
      }));
    }
  };

  const calculateTotalHours = (): number => {
    const diff = formData.preferred_end_time.getTime() - formData.preferred_start_time.getTime();
    return Math.round(diff / 3600000); // Convert ms to hours
  };

  const createOrder = async (): Promise<{
    success: boolean;
    order_id?: string;
    data?: any;
    paymentInfo?: PaymentInfo;
    error?: string;
  }> => {
    if (!customerInfo) {
      return { success: false, error: 'Customer information not loaded' };
    }

    setLoading(true);
    setError(null);

    try {
      const orderPayload = {
        customer: customerInfo.id,
        service_type: selectedServiceType?.id || '', 
        area_m2: formData.area_m2,
        requested_hours: formData.requested_hours,
        preferred_start_time: formData.preferred_start_time.toISOString(),
        preferred_end_time: formData.preferred_end_time.toISOString(),
        estimated_hours: formData.estimated_hours,
        cost_confirm: formData.cost_confirm,
        payment_method: formData.payment_method,
        note: formData.note,
      };

      const response = await orderService.createOrder(orderPayload);
      console.log('Order created successfully:', response);

      // Check if payment info is available (for BANK_TRANSFER)
      if (response.payment) {
        return {
          success: true,
          order_id: response.id, // Add order_id from response
          data: response,
          paymentInfo: response.payment,
        };
      }

      return {
        success: true,
        order_id: response.id, // Add order_id from response
        data: response,
      };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create order';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    customerInfo,
    serviceTypes,
    selectedServiceType,
    formData,
    loading,
    error,
    
    // Computed
    totalHours: calculateTotalHours(),
    totalPrice: formData.cost_confirm,
    
    // Actions
    updateFormField,
    selectServiceType,
    createOrder,
    refreshCustomerInfo: loadCustomerInfo,
    refreshServiceTypes: loadServiceTypes,
  };
}