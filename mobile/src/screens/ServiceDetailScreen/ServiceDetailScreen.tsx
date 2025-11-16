import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
// @ts-ignore
import FavoriteService from '../../services/favorite';

const { height, width } = Dimensions.get('window');

export default function ServiceDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const service = (route.params as any)?.service || {};
  const initialFavoriteState = (route.params as any)?.isFavorite || false;
  const favoriteId = (route.params as any)?.favoriteId;

  const [isFavorite, setIsFavorite] = useState(initialFavoriteState);

  const {
    id,
    title = 'Regular Clean',
    rating = 4.5,
    price = '30,000 VND / 1m2',
    image,
    about = 'Keep your space neat and fresh with our regular cleaning service. We tidy up, dust, and vacuum to maintain daily cleanliness — without using harsh chemicals.',
  } = service;

  const toggleFavorite = async () => {
    try {
      if (!isFavorite) {
        // Thêm vào favorites
        const response = await FavoriteService.addFavorite({
          service_name: title,
          service_type: id,
        });
        console.log('Added to favorites:', response);
        setIsFavorite(true);
        Alert.alert('Success', 'Added to favorites!');
      } else {
        // Xóa khỏi favorites (nếu có favoriteId)
        if (favoriteId) {
          await FavoriteService.deleteFavorite(favoriteId);
          console.log('Removed from favorites');
        }
        setIsFavorite(false);
        Alert.alert('Success', 'Removed from favorites!');
      }
    } catch (error: any) {
      console.error('Toggle favorite error:', error);
      Alert.alert('Error', error.message || 'Failed to update favorites');
    }
  };

  const handleCreateOrder = () => {
    (navigation as any).navigate('CreateOrder', { 
    service: {
      id: id,
      name: title,
      price_per_m2: parseFloat(price.replace(/[^\d]/g, '')) || 30000,
      description: about,
    }
  });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#12603b" />

      {/* === 1. Top Section (1/3) === */}
      <View style={styles.topContainer}>
        <ImageBackground
          source={require('../../assets/background_service.png')}
          style={styles.bgImage}
          resizeMode="cover"
          imageStyle={styles.bgImageStyle} // thêm border radius
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Image
              source={require('../../assets/back_button_white.png')}
              style={styles.backButtonImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </ImageBackground>

        {/* Main Image trồi xuống thêm */}
        <View style={styles.imageContainer}>
          <Image
            source={
              image?.uri ? { uri: image.uri } : image || require('../../assets/cleaning_basket2.png')
            }
            style={styles.serviceImage}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* === 2. Middle Section (1/3) === */}
      <View style={styles.middleContainer}>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>★ {rating.toFixed(1)}</Text>
        </View>

        <Text style={styles.title}>{title}</Text>

        <View style={styles.priceTag}>
          <Text style={styles.priceText}>{price}</Text>
        </View>

        <Text style={styles.aboutTitle}>About</Text>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 10 }}
        >
          <Text style={styles.aboutText}>{about}</Text>
        </ScrollView>
      </View>

      {/* === 3. Bottom Section (1/3) === */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
          <Text style={styles.heartIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.createOrderButton}
          onPress={handleCreateOrder}
          activeOpacity={0.85}
        >
          <Text style={styles.createOrderText}>Create Order</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },

  /* --------- Top Section --------- */
  topContainer: {
    height: height * 0.30,
    backgroundColor: '#12603b',
    position: 'relative',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'visible',
  },
  bgImage: {
    flex: 1,
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  bgImageStyle: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,

  },
  backIcon: {
    color: '#12603b',
    fontSize: 24,
    fontWeight: '700',
  },
  backButtonImage: {
    width: 58,  
    height: 58,
  },
  imageContainer: {
    position: 'absolute',
    bottom: -height * 0.12,
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
  },
  serviceImage: {
    width: width * 0.65,
    height: width * 0.65,
  },

  /* --------- Middle Section --------- */
  middleContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: height * 0.15,
    justifyContent: 'flex-start',
  },
ratingBadge: {
  alignSelf: 'flex-start',
  backgroundColor: '#E5E7EB', // xám nhạt đầy khối
  borderRadius: 20,           // bo tròn 20px
  paddingHorizontal: 15,
  paddingVertical: 8,
  marginBottom: 12,
  
},


  ratingText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 13,
  },
  title: {
    fontSize: 25,
    fontWeight: '800',
    color: '#12603b',
    marginBottom: 8,
    lineHeight: 32,
  },
  priceTag: {
  backgroundColor: '#E5E7EB',   // nền xám nhẹ
  borderRadius: 20,             // bo tròn mềm
  paddingHorizontal: 12,
  paddingVertical: 6,
  alignSelf: 'flex-start',
  marginBottom: 20,
},
priceText: {
  fontWeight: '600',
  color: '#111827',             // màu chữ đậm, tương phản hơn trên nền xám
  fontSize: 16,
},

  aboutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  aboutText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 22,
  },

  /* --------- Bottom Section --------- */
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    paddingTop: 12,
  },
 favoriteButton: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
   
  },
  createOrderButton: {
    backgroundColor: '#12603b',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 16,
    paddingVertical: 16,
  },
  heartIcon: {
    fontSize: 30,
    color: '#d1d5db',
  },
  createOrderText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});
