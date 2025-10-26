import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ImageSourcePropType,
} from 'react-native';

type Props = {
  title: string;
  sizeLabel?: string;
  price: string;
  imageSource?: ImageSourcePropType;
  favorited?: boolean;
  onPress?: () => void;
  onToggleFavorite?: () => void;
};


export default function FavoriteCard({
  title,
  sizeLabel,
  price,
  imageSource,
  favorited = true,
  onPress,
  onToggleFavorite,
}: Props) {
  return (
    <TouchableOpacity activeOpacity={0.95} style={styles.card} onPress={onPress}>
      <TouchableOpacity
        style={styles.heartWrapper}
        onPress={(e) => {
          e.stopPropagation?.();
          onToggleFavorite?.();
        }}
      >
        {/* Heart icon - full filled red */}
        <Text style={{ fontSize: 22, color: '#ef4444' }}>❤️</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Text on left */}
        <View style={styles.textWrap}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>

          {sizeLabel ? (
            <Text style={styles.subtitle}>
              From <Text style={styles.subtitleBold}>{sizeLabel}</Text>
            </Text>
          ) : null}

          <Text style={styles.price}>{price}</Text>
        </View>

        {/* Image on right */}
        <Image
          source={imageSource ?? require('../assets/cleaning_basket.png')}
          style={styles.image}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  heartWrapper: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 2,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartImage: {
    width: 26,
    height: 26,
  },
  heartActive: {
    tintColor: '#ef4444', // red filled for favorited
  },
  heartInactive: {
    tintColor: '#d1d5db', // grey for not favorited
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 40, // add padding to avoid heart overlap
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#047857',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  subtitleBold: {
    fontWeight: '700',
  },
  price: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginLeft: 16,
    resizeMode: 'contain',
  },
});