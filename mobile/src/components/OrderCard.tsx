import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface OrderCardProps {
  title: string;
  startTime: string;
  endTime: string;
  imageSource?: any;
  status?: 'pending' | 'confirmed' | 'in-progress';
}

const OrderCard: React.FC<OrderCardProps> = ({
  title,
  startTime,
  endTime,
  imageSource,
  status = 'pending',
}) => {
  return (
    <View style={styles.card}>
      {/* Order Image */}
      <Image
        source={imageSource || require('../assets/cleaning_basket.png')}
        style={styles.image}
      />

      {/* Order Details */}
      <View style={styles.details}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.time}>Start: {startTime}</Text>
        <Text style={styles.time}>End: {endTime}</Text>
      </View>
    </View>
  );
};

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
  image: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 16,
    resizeMode: 'contain',
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#047857',
    marginBottom: 8,
  },
  time: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
});

export default OrderCard;
