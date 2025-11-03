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

type FilterType = 'pending' | 'in-progress' | 'confirmed' | 'completed' | 'rejected';

export default function HistoryScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  // const [token, setToken] = useState<string | null>(null);
  
  // useEffect(() => {
  //   OAuthService.getAccessToken().then(setToken);
  // }, []);
  
  const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6InVzZXJzOnZpZXctbWluZSIsImV4cCI6MTc2MjEwODIxOCwiaXNzdWVyIjoiQWxwaGEiLCJzdWIiOiJhZmQzZmU2NS1iNWU2LTRiODItYWVjOC1iZmE1ZjY5ZTUxYTkiLCJhdWQiOiJlam5JeDJ3c1N3NzNsdkpyR0FPM0NYTzExMVNpa3BseURQSjlCZEVuIiwiaWF0IjoxNzYyMTA0NjE4LCJpc1N0YWZmIjpmYWxzZSwiaXNTdXBlcnVzZXIiOmZhbHNlLCJpc0d1ZXN0Ijp0cnVlLCJlbWFpbCI6Imd1ZXN0MUBnbWFpbC5jb20ifQ.eIQdTE0pTIP0ctfVJyorlW37rfLL7-zUoPDagOlLaG2BS0OsyGuEKpsmaEAWKl2c-YpCEYzBViCYmMmIlgYQqdH9WX8AIR9cYjrWix2aD7fkClaO50mJhf9NGjS26reOlntfvYPDuqTZVhXuhV1cTn-BN3s03iUw1hxYQIpFEreNhN_n-yZp7Jci568LVB478-sZ6touvvaMrCSMqO0QlBPGtzCdP4lXgIhJDXFxaBJkl95TupYb3YVgxZQKRXqNSkDcjbxK3IF3k5qKjLxfqpAKS804DAGwqUlRtj_-JLLi0CIF9iJnSbTOAxn3cCt6SITc_Kkq8GynfDe9aTq6tQ9xp_mU1Tar4aWh0YqKrT19hgZhjv3M27QFN3xgXk4Z6vUfdDb9x6lXuWQ2WG6ufaUrt7EuRppNqpFfMxf_rVAyM2i7JZNMkscbflWzM8Ypt-77GXUdFiE74VrWU__fh27ZfFB7UCWMjvFQY0uAMi36_bQqGfUinmLF05qDTU57npxdiTCYYO9-B0XgTXWOIhP5OsZIuDDgLwkMcaDqK03PmQYF_OubbvQZlJTuRIBHm89TpgFYPrFg4TJsMEwzPKiieFHxesPcytkMOr4xItiJFKH4dcx4A3KNmAyYVTOQk4H_JiSnHT5X_rRwm_QZ60rbntswSgrCdQSpo7-npcE';
  
  const { orders, loading, error } = useHistoryViewModel(token || '');

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
            title={order.id}
            startTime={order.preferred_start_time}
            endTime={order.preferred_end_time}
            status={order.status}
            imageSource={order.image}
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
