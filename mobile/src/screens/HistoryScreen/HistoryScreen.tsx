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

type FilterType = 'pending' | 'in-progress' | 'confirmed' | 'completed' | 'rejected';

export default function HistoryScreen() {
  const { filter: activeFilter, setFilter: setActiveFilter } = useHistoryFilter();
  const [searchQuery, setSearchQuery] = useState('');
  // const [token, setToken] = useState<string | null>(null);
  
  // useEffect(() => {
  //   OAuthService.getAccessToken().then(setToken);
  // }, []);
  
  const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6InVzZXJzOnZpZXctbWluZSIsImV4cCI6MTc2MjY2MzcyNywiaXNzdWVyIjoiQWxwaGEiLCJzdWIiOiJhZmQzZmU2NS1iNWU2LTRiODItYWVjOC1iZmE1ZjY5ZTUxYTkiLCJhdWQiOiJlam5JeDJ3c1N3NzNsdkpyR0FPM0NYTzExMVNpa3BseURQSjlCZEVuIiwiaWF0IjoxNzYyNjYwMTI3LCJpc1N0YWZmIjpmYWxzZSwiaXNTdXBlcnVzZXIiOmZhbHNlLCJpc0d1ZXN0Ijp0cnVlLCJlbWFpbCI6Imd1ZXN0MUBnbWFpbC5jb20ifQ.O3RY5B7Nqc5qIE20qML7_BDmCgZCJUdltE5fQXpQe1SRiCtp9AxTmEj00p2OSnFfLFZooU7-st-f5jeCMJMkeIH7fTv3XHWAqk-EEH81yWbFXCcCSTajg9SYzpwHzPZMsdLmFU_0wUDAU58pW0Di3LyaWg9-lHhKYz1JHgPo2BPwU60yABAI5pwIoDxlTApua4t35leOR8xgRqvoYYbW7-xKYBkvSUS3dSG2ukPMuomcQncweGyYgbvuA5C0LpC-BgqnNL7WGwVbddpa4n9OVPv-LEIMh_B39xrVb-f9Mo7qZNnm8Vf1yojiBAGxNeISoUbKSIuB3YALMKGGjFRoKSXDU5kc3QD8qc4DHs9M-TxzgPshAqfM1R4bWkYjjGp9jZ243smfSMQRHg7mHFh3fYmFuVKdV5xxYucIvy6YU2r4HZZpvHn1aa5T0ZghPrJaKNrkH93X5kdKAIQoHiW7LAxE1k2mVp0sBkStaAY6zgHKuyJIgsUEy2Ei8kp1i69HgXYKoI5MW6jG2enyiy5IwzJ9-YOOJuj3p-Am58zqLyxdOjObbHpBt6PjaiOWoWVlL3MYyDLv5_u-ITvDDm6bYFaD3L58Oy37IhNYVXNBXSAL6KqgX2j8BfoQ6q1-Go9YsIxf6AIDTtzl1r4M-mkOU9MmC_xgHhcOa47PoqS4v7w';
  
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
