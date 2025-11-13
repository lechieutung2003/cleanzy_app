import React, { useRef } from 'react';
import {
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  View,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SearchBar from '../../components/SearchBar';
import ServiceCard, { CARD_WIDTH } from '../../components/ServiceCard';
import useHomeViewModel from '../../viewmodels/HomeScreen/useHomeViewModel';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SPACING = 20;
const ITEM_SIZE = CARD_WIDTH + SPACING;

export default function HomeScreen() {
  const navigation = useNavigation();
  const scrollX = useRef(new Animated.Value(0)).current;
  const { services, loading, error, query, setQuery, handleSearch } = useHomeViewModel();

  return (
    <>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search"
        onSearchPress={handleSearch}
      />

      <Text style={styles.title}>All Services</Text>

      {/* Loading state */}
      {loading && (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#11804d" />
        </View>
      )}

      {/* Error state */}
      {error && !loading && (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {/* Animated Carousel */}
      {!loading && !error && services.length > 0 && (
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
                  onPress={() => {
                    (navigation as any).navigate('ServiceDetail', { service: item });
                  }}
                  onAdd={() => console.log('Add', item.id)}
                />
              </Animated.View>
            );
          }}
        />
      )}
    </>
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    marginTop: 8,
  },
});