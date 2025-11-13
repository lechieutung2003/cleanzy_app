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

  // Fuzzy search helper - tìm kiếm mờ
  const fuzzyMatch = (str: string, pattern: string): boolean => {
    const strLower = str.toLowerCase();
    const patternLower = pattern.toLowerCase();
    
    // Exact match hoặc contains
    if (strLower.includes(patternLower)) return true;
    
    // Check từng ký tự có xuất hiện theo thứ tự không
    let patternIdx = 0;
    for (let i = 0; i < strLower.length && patternIdx < patternLower.length; i++) {
      if (strLower[i] === patternLower[patternIdx]) {
        patternIdx++;
      }
    }
    return patternIdx === patternLower.length;
  };

  const handleSearch = () => {
    const keyword = searchText.trim();
    if (!keyword) return;

    // Danh sách các trang với từ khóa tìm kiếm
    const pages = [
      // Tabs
      { keywords: ['home', 'trang chủ', 'chu'], action: () => onTabChange?.('home') },
      { keywords: ['favorite', 'yêu thích', 'thích', 'fav'], action: () => onTabChange?.('favorites') },
      { keywords: ['history', 'lịch sử', 'lich su', 'his'], action: () => onTabChange?.('history') },
      
      // Stack screens
      { keywords: ['profile', 'hồ sơ', 'ho so', 'tài khoản', 'tai khoan', 'pro'], action: () => navigation.navigate('Profile') },
      { keywords: ['edit profile', 'sửa hồ sơ', 'sua ho so', 'edit'], action: () => navigation.navigate('EditProfile') },
      { keywords: ['service', 'dịch vụ', 'dich vu', 'ser'], action: () => navigation.navigate('ServiceDetail') },
      { keywords: ['order', 'đặt hàng', 'dat hang', 'tạo đơn', 'tao don', 'ord'], action: () => navigation.navigate('CreateOrder') },
      { keywords: ['payment', 'thanh toán', 'thanh toan', 'pay'], action: () => navigation.navigate('Payment') },
      { keywords: ['pending payment', 'chờ thanh toán', 'cho thanh toan', 'pending'], action: () => navigation.navigate('PendingPayment') },
      { keywords: ['support', 'hỗ trợ', 'ho tro', 'customer support', 'sup'], action: () => navigation.navigate('CustomerSupport') },
      { keywords: ['change password', 'đổi mật khẩu', 'doi mat khau', 'password', 'pass'], action: () => navigation.navigate('ChangePassword') },
      { keywords: ['change pass', 'đổi pass'], action: () => navigation.navigate('ChangePass') },
      { keywords: ['policy', 'chính sách', 'chinh sach', 'pol'], action: () => navigation.navigate('Policy') },
      { keywords: ['term', 'điều khoản', 'dieu khoan', 'terms of use'], action: () => navigation.navigate('TermOfUse') },
      { keywords: ['forgot password', 'quên mật khẩu', 'quen mat khau', 'forgot'], action: () => navigation.navigate('ForgotPassword') },
    ];

    // Tìm trang phù hợp nhất
    for (const page of pages) {
      for (const kw of page.keywords) {
        if (fuzzyMatch(kw, keyword)) {
          page.action();
          setSearchText('');
          return;
        }
      }
    }
    
    // Không tìm thấy - giữ nguyên text để user biết
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
