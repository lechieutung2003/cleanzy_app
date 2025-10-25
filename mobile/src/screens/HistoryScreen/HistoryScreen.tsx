import React, { useState } from 'react';
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

type FilterType = 'pending' | 'in-progress' | 'confirmed' | 'completed' | 'rejected';

export default function HistoryScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - replace with real data from API
  const orders = [
    {
      id: '1',
      title: 'Regular Clean',
      startTime: '19:55, October 31, 2025',
      endTime: '21:55, October 31, 2025',
      status: 'pending' as const,
      image: require('../../assets/cleaning_basket.png'),
    },
    {
      id: '2',
      title: 'Deep Clean',
      startTime: '19:55, October 31, 2025',
      endTime: '21:55, October 31, 2025',
      status: 'pending' as const,
      image: require('../../assets/cleaning_basket2.png'),
    },
  ];

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
            title={order.title}
            startTime={order.startTime}
            endTime={order.endTime}
            status={order.status}
            imageSource={order.image}
          />
        ))}
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomTabBar
        activeTab="history"
        onHomePress={() => console.log('Home pressed')}
        onFavoritesPress={() => console.log('Favorites pressed')}
        onHistoryPress={() => console.log('History pressed')}
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
