import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  GestureResponderEvent,
  Dimensions,
  ImageBackground,
} from 'react-native';

const { width } = Dimensions.get('window');
export const CARD_WIDTH = Math.min(280, Math.floor(width * 0.65)); // phóng to hơn xíu
const CARD_HEIGHT = Math.floor(CARD_WIDTH * 1.15);

type Props = {
  title: string;
  rating?: number;
  fromText?: string;
  price?: string;
  image?: any;
  onPress?: (e: GestureResponderEvent) => void;
  onAdd?: (e: GestureResponderEvent) => void;
};

export default function ServiceCard({
  title,
  rating = 4.5,
  fromText = 'From 1 square meter',
  price = '30.000 VND',
  image,
  onPress,
  onAdd,
}: Props) {
  const bg = require('../assets/background_service.png'); // 🌈 hình nền gradient

  return (
    <TouchableOpacity activeOpacity={0.95} style={styles.wrapper} onPress={onPress}>
      <ImageBackground
        source={bg}
        style={styles.card}
        imageStyle={styles.bgImage}
      >
        {/* Hình sản phẩm trồi lên */}
        <View style={styles.imageWrap}>
          <Image
            source={image || require('../assets/cleaning_basket.png')}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Nội dung */}
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.rating}>
            <Text style={styles.ratingText}>★ {rating.toFixed(1)}</Text>
          </View>

          <Text style={styles.fromText}>{fromText}</Text>
          <Text style={styles.price}>{price}</Text>
        </View>

        {/* Nút thêm */}
        <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
          <Text style={styles.plus}>＋</Text>
        </TouchableOpacity>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginVertical: 12,
    overflow: 'visible',
  },
  card: {
    flex: 1,
    borderRadius: 22,
    padding: 18,
    paddingTop: 60,
    justifyContent: 'flex-end',
    elevation: 6,
  },
  bgImage: {
    borderRadius: 22,
    resizeMode: 'cover',
  },
  imageWrap: {
    position: 'absolute',
    top: -50, // trồi ra khỏi card
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 3,
  },
  image: {
    width: CARD_WIDTH * 0.8,
    height: CARD_WIDTH * 0.7,
  },
  content: {
    zIndex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  rating: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 8,
  },
  ratingText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  fromText: {
    color: '#d6ffd6',
    fontSize: 13,
  },
  price: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  addBtn: {
    position: 'absolute',
    right: 16,
    bottom: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  plus: {
    color: '#11804d',
    fontSize: 26,
    fontWeight: '700',
  },
});