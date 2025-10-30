import React, { useState, useRef } from 'react';
import {
  SafeAreaView,
  StatusBar,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  View,
} from 'react-native';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import BottomTabBar from '../../components/BottomTabBar';
import ServiceCard, { CARD_WIDTH } from '../../components/ServiceCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SPACING = 20;
const ITEM_SIZE = CARD_WIDTH + SPACING;

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  const scrollX = useRef(new Animated.Value(0)).current;

  const services = [
    {
      id: 's1',
      title: 'Regular Clean',
      rating: 4.5,
      fromText: 'From 1 square meter',
      price: '30.000 VNĐ',
      image: require('../../assets/cleaning_basket.png'),
    },
    {
      id: 's2',
      title: 'Deep Clean',
      rating: 4.3,
      fromText: 'From 1 square meter',
      price: '50.000 VNĐ',
      image: require('../../assets/cleaning_basket2.png'),
    },
    {
      id: 's3',
      title: 'Laundry',
      rating: 4.7,
      fromText: 'Per kg',
      price: '20.000 VNĐ',
      image: require('../../assets/cleaning_basket.png'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <Header onNotificationPress={() => {}} />

      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search"
        onSearchPress={() => console.log('Search:', query)}
      />

      <Text style={styles.title}>Service</Text>

      {/* Animated Carousel */}
      <Animated.FlatList
        data={services}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_SIZE}
        decelerationRate="fast"
        bounces={false}
        contentContainerStyle={{
          paddingHorizontal: (SCREEN_WIDTH - ITEM_SIZE) / 2,
          alignItems: 'center',
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 1) * ITEM_SIZE,
            index * ITEM_SIZE,
            (index + 1) * ITEM_SIZE,
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.88, 1.08, 0.88],
            extrapolate: 'clamp',
          });

          const translateY = scrollX.interpolate({
            inputRange,
            outputRange: [20, -10, 20], // card giữa hơi trồi lên
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              style={{
                transform: [{ scale }, { translateY }],
                marginRight: SPACING,
              }}
            >
              <ServiceCard
              title={item.title}
                rating={item.rating}
                fromText={item.fromText}
                price={item.price}
                image={item.image}
                onPress={() => console.log('Open', item.id)}
                onAdd={() => console.log('Add', item.id)}
              />
            </Animated.View>
          );
        }}
      />

      <BottomTabBar activeTab="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginVertical: 16,
  },
});