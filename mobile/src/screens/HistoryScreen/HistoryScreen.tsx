import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import OrderCard from '../../components/OrderCard';
import useHistoryViewModel from '../../viewmodels/HistoryScreen/useHistoryViewModel';
import OAuthService from '../../services/oauth';
import { useHistoryFilter } from '../../contexts/HistoryFilterContext';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import InvoiceScreen from '../InvoiceScreen/InvoiceScreen';

type FilterType = 'pending' | 'paid' | 'in-progress' | 'confirmed' | 'completed' | 'rejected';

export default function HistoryScreen() {
  const { filter: activeFilter, setFilter: setActiveFilter } = useHistoryFilter();
  const [searchQuery, setSearchQuery] = useState('');

  type RootStackParamList = {
    Invoice: { orderId: string };
  };

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // const [token, setToken] = useState<string | null>(null);

  // useEffect(() => {
  //   OAuthService.getAccessToken().then(setToken);
  // }, []);

  const { orders, loading, error } = useHistoryViewModel();

  console.log('Orders:', orders);

  const filteredOrders = orders.filter(order => order.status === activeFilter);

  const filters: { value: FilterType; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'PAID', label: 'Paid' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
];

  return (
    <>
      {/* Title */}
      <Text style={styles.title}>History Order</Text>

      {/* Filter Tabs - Horizontal Scroll */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {filters.map(filter => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.filterButton,
                activeFilter === filter.value && styles.filterButtonActive,
              ]}
              onPress={() => setActiveFilter(filter.value)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter.value && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Order List */}
      <ScrollView style={styles.orderList} showsVerticalScrollIndicator={false}>
        {filteredOrders.map(order => (
          <OrderCard
            key={order.id}
            title={order.service_details.name}
            startTime={order.preferred_start_time}
            endTime={order.preferred_end_time}
            status={order.status}
            imageSource={order.image}
            onPress={() => navigation.navigate('Invoice', { orderId: order.id })}
          />
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginVertical: 16,
  },
  filterWrapper: {
    marginBottom: 16,
  },
  filterContainer: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  filterButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#047857',
    backgroundColor: 'white',
    marginRight: 12,
  },
  filterButtonActive: {
    backgroundColor: '#047857',
  },
  filterText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#047857',
  },
  filterTextActive: {
    color: 'white',
  },
  orderList: {
    flex: 1,
    marginBottom: 8,
  },
});
