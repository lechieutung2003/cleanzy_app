import React, { useState, useMemo } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Image, Text, FlatList, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { useHistoryFilter } from '../contexts/HistoryFilterContext';

interface SearchBarProps {
  placeholder?: string;
  onTabChange?: (tab: 'home' | 'favorites' | 'history') => void;
}

interface PageOption {
  id: string;
  label: string;
  keywords: string[];
  action: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search',
  onTabChange,
}) => {
  const navigation = useNavigation<NavigationProp<any>>();
  const { setFilter } = useHistoryFilter();
  const [searchText, setSearchText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Danh sách tất cả các trang
  const allPages: PageOption[] = useMemo(() => [
    // Tabs
    { 
      id: 'home', 
      label: 'Home', 
      keywords: ['home', 'trang chủ', 'chu'], 
      action: () => {
        if (onTabChange) onTabChange('home');
      }
    },
    { 
      id: 'favorite', 
      label: 'Favorite', 
      keywords: ['favorite', 'yêu thích', 'thích', 'fav'], 
      action: () => {
        if (onTabChange) onTabChange('favorites');
      }
    },
    { 
      id: 'history', 
      label: 'History', 
      keywords: ['history', 'lịch sử', 'lich su', 'his'], 
      action: () => {
        if (onTabChange) onTabChange('history');
      }
    },
    
    // History with status filters
    { 
      id: 'history-pending', 
      label: 'History - Pending', 
      keywords: ['pending', 'chờ xử lý', 'cho xu ly'], 
      action: () => {
        if (onTabChange) {
          setFilter('pending');
          onTabChange('history');
        }
      }
    },
    { 
      id: 'history-inprogress', 
      label: 'History - In Progress', 
      keywords: ['in progress', 'in-progress', 'đang thực hiện', 'dang thuc hien', 'progress'], 
      action: () => {
        if (onTabChange) {
          setFilter('in-progress');
          onTabChange('history');
        }
      }
    },
    { 
      id: 'history-confirmed', 
      label: 'History - Confirmed', 
      keywords: ['confirmed', 'đã xác nhận', 'da xac nhan', 'xac nhan'], 
      action: () => {
        if (onTabChange) {
          setFilter('confirmed');
          onTabChange('history');
        }
      }
    },
    { 
      id: 'history-completed', 
      label: 'History - Completed', 
      keywords: ['completed', 'hoàn thành', 'hoan thanh', 'done'], 
      action: () => {
        if (onTabChange) {
          setFilter('completed');
          onTabChange('history');
        }
      }
    },
    { 
      id: 'history-rejected', 
      label: 'History - Rejected', 
      keywords: ['rejected', 'từ chối', 'tu choi', 'reject'], 
      action: () => {
        if (onTabChange) {
          setFilter('rejected');
          onTabChange('history');
        }
      }
    },
    
    // Stack screens
    { id: 'profile', label: 'Profile', keywords: ['profile', 'hồ sơ', 'ho so', 'tài khoản', 'tai khoan', 'pro'], action: () => navigation.navigate('Profile') },
    { id: 'logout', label: 'Logout', keywords: ['logout', 'đăng xuất', 'dang xuat', 'log out', 'sign out'], action: () => navigation.navigate('Profile') },
    { id: 'edit-profile', label: 'Edit Profile', keywords: ['edit profile', 'sửa hồ sơ', 'sua ho so', 'edit'], action: () => navigation.navigate('EditProfile') },
    { id: 'service', label: 'Service Detail', keywords: ['service', 'dịch vụ', 'dich vu', 'ser'], action: () => navigation.navigate('ServiceDetail') },
    { id: 'order', label: 'Create Order', keywords: ['order', 'đặt hàng', 'dat hang', 'tạo đơn', 'tao don', 'ord'], action: () => navigation.navigate('CreateOrder') },
    { id: 'payment', label: 'Payment', keywords: ['payment', 'thanh toán', 'thanh toan', 'pay'], action: () => navigation.navigate('Payment') },
    { id: 'pending', label: 'Pending Payment', keywords: ['pending payment', 'chờ thanh toán', 'cho thanh toan'], action: () => navigation.navigate('PendingPayment') },
    { id: 'support', label: 'Customer Support', keywords: ['support', 'hỗ trợ', 'ho tro', 'customer support', 'sup'], action: () => navigation.navigate('CustomerSupport') },
    { id: 'change-password', label: 'Change Password', keywords: ['change password', 'đổi mật khẩu', 'doi mat khau', 'password', 'pass'], action: () => navigation.navigate('ChangePassword') },
    { id: 'change-pass', label: 'Change Pass', keywords: ['change pass', 'đổi pass'], action: () => navigation.navigate('ChangePass') },
    { id: 'policy', label: 'Policy', keywords: ['policy', 'chính sách', 'chinh sach', 'pol'], action: () => navigation.navigate('Policy') },
    { id: 'term', label: 'Terms of Use', keywords: ['term', 'điều khoản', 'dieu khoan', 'terms of use'], action: () => navigation.navigate('TermOfUse') },
    { id: 'forgot', label: 'Forgot Password', keywords: ['forgot password', 'quên mật khẩu', 'quen mat khau', 'forgot'], action: () => navigation.navigate('ForgotPassword') },
  ], [navigation, onTabChange, setFilter]);

  // Fuzzy search helper
  const fuzzyMatch = (str: string, pattern: string): boolean => {
    const strLower = str.toLowerCase();
    const patternLower = pattern.toLowerCase();
    
    if (strLower.includes(patternLower)) return true;
    
    let patternIdx = 0;
    for (let i = 0; i < strLower.length && patternIdx < patternLower.length; i++) {
      if (strLower[i] === patternLower[patternIdx]) {
        patternIdx++;
      }
    }
    return patternIdx === patternLower.length;
  };

  // Lọc gợi ý dựa trên input
  const suggestions = useMemo(() => {
    const keyword = searchText.trim();
    if (!keyword) return [];

    return allPages.filter(page => 
      page.keywords.some(kw => fuzzyMatch(kw, keyword)) || 
      fuzzyMatch(page.label, keyword)
    ).slice(0, 5); // Giới hạn 5 gợi ý
  }, [searchText, allPages]);

  const handleTextChange = (text: string) => {
    setSearchText(text);
    setShowSuggestions(text.trim().length > 0);
  };

  const handleSelectSuggestion = (page: PageOption) => {
    console.log('Selected page:', page.label);
    setShowSuggestions(false);
    setSearchText('');
    // Thực hiện action ngay lập tức
    try {
      page.action();
      console.log('Action executed for:', page.label);
    } catch (error) {
      console.error('Error executing action:', error);
    }
  };

  const handleSearch = () => {
    if (suggestions.length > 0) {
      handleSelectSuggestion(suggestions[0]);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          value={searchText}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          onSubmitEditing={handleSearch}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 300)}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Image
            source={require('../assets/search_icon.png')}
            style={styles.searchIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {suggestions.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.suggestionItem,
                pressed && styles.suggestionItemPressed
              ]}
              onPress={() => {
                console.log('Pressed:', item.label);
                handleSelectSuggestion(item);
              }}
            >
              <Image
                source={require('../assets/search_icon.png')}
                style={styles.suggestionIcon}
              />
              <Text style={styles.suggestionText}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    zIndex: 9999,
  },
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
    elevation: 2,
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
  suggestionsContainer: {
    position: 'absolute',
    top: 70,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 10000,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: 'white',
  },
  suggestionItemPressed: {
    backgroundColor: '#f3f4f6',
  },
  suggestionIcon: {
    width: 20,
    height: 20,
    tintColor: '#6b7280',
    marginRight: 12,
  },
  suggestionText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
});

export default SearchBar;
