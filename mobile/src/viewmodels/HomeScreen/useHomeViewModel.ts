import { useState, useEffect, useCallback } from 'react';
import ServiceTypeService from '../../services/serviceType';

interface Service {
  id: string;
  title: string;
  rating: number;
  fromText: string;
  price: string;
  image: any;
  about?: string;
}

export default function useHomeViewModel() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ServiceTypeService.getServiceTypes({ page: 1, page_size: 12 });
      console.log('Service types response:', response);
      
      // Map API response to component format
      const mappedServices = response.results?.map((service: any) => ({
        id: service.id,
        title: service.name,
        rating: parseFloat(service.star) || 4.5,
        fromText: `From 1 square meter`,
        price: `${service.price_per_m2.toLocaleString()} VNĐ`,
        image: service.img ? { uri: service.img } : require('../../assets/cleaning_basket.png'),
        about: service.about,
      })) || [];
      
      setServices(mappedServices);
    } catch (err: any) {
      console.error('Error fetching service types:', err);
      setError(err?.message || 'Failed to load services');
      // Fallback to empty array on error
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleSearch = useCallback(() => {
    console.log('Search:', query);
    // TODO: implement search filtering
  }, [query]);

  return {
    services,
    loading,
    error,
    query,
    setQuery,
    handleSearch,
    refetch: fetchServices,
  };
}
