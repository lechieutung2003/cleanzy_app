import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import BottomTabBar from '../../components/BottomTabBar';
import FavoriteCard from '../../components/FavoriteCard';
import useFavoriteViewModel from '../../viewmodels/FavoriteScreen/useFavoriteViewModel';

export default function FavoriteScreen() {
  const navigation = useNavigation();
  const { favorites, loading, error, query, setQuery, handleSearch, removeFavorite } = useFavoriteViewModel();

  const handleRemoveFavorite = async (favoriteId: string, title: string) => {
    Alert.alert(
      'Remove Favorite',
      `Are you sure you want to remove "${title}" from favorites?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const result = await removeFavorite(favoriteId);
            if (!result.success) {
              Alert.alert('Error', result.error || 'Failed to remove favorite');
            }
          },
        },
      ]
    );
  };

  const handleOpenService = (favorite: any) => {
    // Navigate to ServiceDetail với đầy đủ service data và flag isFavorite
    (navigation as any).navigate('ServiceDetail', {
      service: {
        id: favorite.serviceTypeId,
        title: favorite.title,
        rating: favorite.rating,
        price: favorite.price,
        image: favorite.image,
        about: favorite.about,
      },
      isFavorite: true, // Flag để ServiceDetail biết service này đã được favorite
      favoriteId: favorite.id, // ID của favorite record để có thể xóa
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <Header onNotificationPress={() => {}} />

      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search"
        onSearchPress={handleSearch}
      />

      <Text style={styles.title}>Favorite Order</Text>

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

      {/* Empty state */}
      {!loading && !error && favorites.length === 0 && (
        <View style={styles.centerContent}>
          <Text style={styles.emptyText}>💚 No favorites yet</Text>
          <Text style={styles.emptySubtext}>
            Add services to favorites from the home screen
          </Text>
        </View>
      )}

      {/* Favorites List */}
      {!loading && !error && favorites.length > 0 && (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {favorites.map(item => (
            <FavoriteCard
              key={item.id}
              title={item.title}
              sizeLabel={item.sizeLabel}
              price={item.price}
              imageSource={item.image}
              favorited={true}
              onPress={() => handleOpenService(item)}
              onToggleFavorite={() => handleRemoveFavorite(item.id, item.title)}
            />
          ))}
        </ScrollView>
      )}

      <BottomTabBar activeTab="favorites" />
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
  emptyText: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});