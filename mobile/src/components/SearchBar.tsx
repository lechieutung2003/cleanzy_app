import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

interface SearchBarProps {
  placeholder?: string;
  onTabChange?: (tab: 'home' | 'favorites' | 'history') => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search',
  onTabChange,
}) => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [searchText, setSearchText] = useState('');

  const handleSearch = () => {
    const keyword = searchText.trim().toLowerCase();
    
    // Điều hướng dựa trên từ khóa
    if (keyword === 'favorite' || keyword === 'favorites' || keyword === 'yêu thích') {
      if (onTabChange) {
        onTabChange('favorites');
      }
    } else if (keyword === 'profile' || keyword === 'hồ sơ' || keyword === 'tài khoản') {
      navigation.navigate('Profile');
    } else if (keyword === 'home' || keyword === 'trang chủ') {
      if (onTabChange) {
        onTabChange('home');
      }
    } else if (keyword === 'history' || keyword === 'lịch sử') {
      if (onTabChange) {
        onTabChange('history');
      }
    } else if (keyword === 'service' || keyword === 'dịch vụ') {
      navigation.navigate('ServiceDetail');
    } else if (keyword === 'order' || keyword === 'đặt hàng' || keyword === 'tạo đơn') {
      navigation.navigate('CreateOrder');
    } else if (keyword === 'payment' || keyword === 'thanh toán') {
      navigation.navigate('Payment');
    } else if (keyword === 'support' || keyword === 'hỗ trợ') {
      navigation.navigate('CustomerSupport');
    }
    // Xóa text sau khi search
    setSearchText('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={searchText}
        onChangeText={setSearchText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        onSubmitEditing={handleSearch}
        returnKeyType="search"
      />
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Image
          source={require('../assets/search_icon.png')}
          style={styles.searchIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingLeft: 20,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: '#1f2937',
    paddingVertical: 8,
  },
  searchButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#047857',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -1.5,
  },
  searchIcon: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
});

export default SearchBar;
