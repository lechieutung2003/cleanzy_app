import { useState, useEffect, useCallback } from 'react';
// @ts-ignore
import FavoriteService from '../../services/favorite';
// @ts-ignore
import ServiceTypeService from '../../services/serviceType';

interface Favorite {
  id: string;
  serviceTypeId: string;
  title: string;
  sizeLabel: string;
  price: string;
  priceValue: number;
  image: any;
  rating: number;
  about: string;
}

export default function useFavoriteViewModel() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Lấy danh sách favorites (chỉ có id, service_type, customer)
      const response = await FavoriteService.getFavorites({ page: 1, page_size: 12 });
      console.log('Favorites response:', response);
      
      if (!response.results || response.results.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      // 2. Fetch thông tin đầy đủ từ ServiceType cho mỗi favorite
      const favoritesWithDetails = await Promise.all(
        response.results.map(async (item: any) => {
          try {
            // Fetch service type detail
            const serviceType = await ServiceTypeService.getServiceTypeById(item.service_type);
            console.log('Service type detail:', serviceType);

            return {
              id: item.id, // Favorite ID
              serviceTypeId: item.service_type, // ServiceType ID
              title: serviceType.name,
              sizeLabel: '1 square meter',
              price: `${serviceType.price_per_m2.toLocaleString()} VND / 1m2`,
              priceValue: serviceType.price_per_m2,
              image: serviceType.img ? { uri: serviceType.img } : require('../../assets/cleaning_basket.png'),
              rating: parseFloat(serviceType.star) || 4.5,
              about: serviceType.about || `Professional ${serviceType.name} service`,
            };
          } catch (err) {
            console.error('Error fetching service type:', item.service_type, err);
            // Fallback nếu không fetch được service type
            return {
              id: item.id,
              serviceTypeId: item.service_type,
              title: 'Unknown Service',
              sizeLabel: '1 square meter',
              price: 'N/A',
              priceValue: 0,
              image: require('../../assets/cleaning_basket.png'),
              rating: 0,
              about: 'Service details not available',
            };
          }
        })
      );
      
      setFavorites(favoritesWithDetails);
    } catch (err: any) {
      console.error('Error fetching favorites:', err);
      setError(err?.message || 'Failed to load favorites');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleSearch = useCallback(() => {
    console.log('Search:', query);
    // TODO: implement search filtering
  }, [query]);

  const removeFavorite = useCallback(async (favoriteId: string) => {
    try {
      await FavoriteService.deleteFavorite(favoriteId);
      
      // Update UI sau khi xóa thành công
      setFavorites(prev => prev.filter(item => item.id !== favoriteId));
      
      return { success: true };
    } catch (err: any) {
      console.error('Error removing favorite:', err);
      return { success: false, error: err?.message || 'Failed to remove favorite' };
    }
  }, []);

  return {
    favorites,
    loading,
    error,
    query,
    setQuery,
    handleSearch,
    refetch: fetchFavorites,
    removeFavorite,
  };
}
