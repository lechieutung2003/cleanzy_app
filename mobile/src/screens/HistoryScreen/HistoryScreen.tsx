import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import OrderCard from '../../components/OrderCard';
import BottomTabBar from '../../components/BottomTabBar';
import useHistoryViewModel from '../../viewmodels/HistoryScreen/useHistoryViewModel';
import OAuthService from '../../services/oauth';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import InvoiceScreen from '../InvoiceScreen/InvoiceScreen';

type FilterType = 'pending' | 'in-progress' | 'confirmed' | 'completed' | 'rejected';

export default function HistoryScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('pending');
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
    { value: 'in-progress', label: 'In progress' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Rejected' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      {/* Header */}
      <Header
        onNotificationPress={() => console.log('Notification pressed')}
      />

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search"
        onSearchPress={() => console.log('Search:', searchQuery)}
      />

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

      {/* Bottom Navigation */}
      <BottomTabBar
        activeTab="history"
      />
    </SafeAreaView>
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
