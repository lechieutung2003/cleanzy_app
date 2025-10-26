import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  onSearchPress?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search',
  onSearchPress,
}) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
      />
      <TouchableOpacity style={styles.searchButton} onPress={onSearchPress}>
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
