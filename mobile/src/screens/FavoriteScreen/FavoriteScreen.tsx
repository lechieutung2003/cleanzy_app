import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import BottomTabBar from '../../components/BottomTabBar';
import FavoriteCard from '../../components/FavoriteCard';

export default function FavoriteScreen() {
  const [query, setQuery] = useState('');

  const favorites = [
    {
      id: 'f1',
      title: 'Regular Clean',
      size: '1 square meter',
      price: '30.000 VNĐ',
      image: require('../../assets/cleaning_basket.png'),
    },
    {
      id: 'f2',
      title: 'Deep Clean',
      size: '1 square meter',
      price: '50.000 VNĐ',
      image: require('../../assets/cleaning_basket2.png'),
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

      <Text style={styles.title}>Favorite Order</Text>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {favorites.map(item => (
          <FavoriteCard
            key={item.id}
            title={item.title}
            sizeLabel={item.size}
            price={item.price}
            imageSource={item.image}
            favorited={true}
            onPress={() => console.log('Open', item.id)}
            onToggleFavorite={() => console.log('Toggle fav', item.id)}
          />
        ))}
      </ScrollView>

      <BottomTabBar
        activeTab="favorites"
      />
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
  list: {
    paddingBottom: 24,
  },
});