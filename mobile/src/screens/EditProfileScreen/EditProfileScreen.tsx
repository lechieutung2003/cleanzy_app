import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ImageBackground,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import EmployeeService from '../../services/employee';
import CustomerService from '../../services/customer';

const { height, width } = Dimensions.get('window');

// Danh sách Area từ backend
const AREA_CHOICES = [
  "Hải Châu", "Ngũ Hành Sơn", "Liên Chiểu", "Sơn Trà", "Cẩm Lệ", "Thanh Khê",
  "An Hải", "An Khê", "An Thắng", "Avương", "Bà Nà", "Bàn Thạch", "Bến Giằng",
  "Bến Hiên", "Chiên Đàn", "Đắc Pring", "Đại Lộc", "Điện Bàn", "Điện Bàn Bắc",
  "Điện Bàn Đông", "Điện Bàn Tây", "Đồng Dương", "Đông Giang", "Đức Phú",
  "Duy Nghĩa", "Duy Xuyên", "Gò Nổi", "Hà Nha", "Hải Vân", "Hiệp Đức",
  "Hòa Cường", "Hòa Khánh", "Hòa Tiến", "Hòa Vang", "Hòa Xuân", "Hoàng Sa",
  "Hội An", "Hội An Đông", "Hội An Tây", "Hùng Sơn", "Hương Trà", "Khâm Đức",
  "La Dêê", "La Êê", "Lãnh Ngọc", "Nam Giang", "Nam Phước", "Nam Trà My",
  "Nông Sơn", "Núi Thành", "Phú Ninh", "Phú Thuận", "Phước Chánh", "Phước Hiệp",
  "Phước Năng", "Phước Thành", "Phước Trà", "Quảng Phú", "Quế Phước", "Quế Sơn",
  "Quế Sơn Trung", "Sơn Cẩm Hà", "Sông Kôn", "Sông Vàng", "Tam Anh", "Tam Hải",
  "Tam Kỳ", "Tam Mỹ", "Tam Xuân", "Tân Hiệp", "Tây Giang", "Tây Hồ", "Thăng An",
  "Thăng Bình", "Thăng Điền", "Thăng Phú", "Thăng Trường", "Thạnh Bình",
  "Thạnh Mỹ", "Thu Bồn", "Thượng Đức", "Tiên Phước", "Trà Đốc", "Trà Giáp",
  "Trà Leng", "Trà Liên", "Trà Linh", "Trà My", "Trà Tân", "Trà Tập", "Trà Vân",
  "Việt An", "Vu Gia", "Xuân Phú"
];

interface CustomerInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  area: string;
  img: string | null;
}

export default function EditProfileScreen({ navigation }: any) {
  const route = useRoute<any>();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showAreaPicker, setShowAreaPicker] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');

  const fetchProfileInfo = useCallback(async () => {
    setLoading(true);
    try {
      console.log('EditProfileScreen - fetchProfileInfo called with params:', route.params);
      if (route.params?.EmployeeData) {
        const emp = route.params.EmployeeData;
        const data: CustomerInfo = {
          id: emp.id || '',
          name: emp.name || '',
          email: emp.email || '',
          phone: emp.phone || '',
          address: emp.address || '',
          area: emp.area || '',
          img: emp.avatar || null,
        };
        setCustomerInfo(data);
        setName(data.name || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setAddress(data.address || '');
        setArea(data.area || '');
      } else {
        const data = await CustomerService.getCustomerInfo();
        setCustomerInfo(data);
        setName(data.name || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setAddress(data.address || '');
        setArea(data.area || '');
      }
    } catch (error) {
      console.error('Failed to fetch profile info:', error);
    } finally {
      setLoading(false);
    }
  }, [route.params]);

  useFocusEffect(
    useCallback(() => {
      fetchProfileInfo();
    }, [fetchProfileInfo])
  );

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const emailChanged = email !== customerInfo?.email;
      const updateData: any = {};
      if (name !== customerInfo?.name) updateData.name = name;
      if (emailChanged) updateData.email = email;
      if (phone !== customerInfo?.phone) updateData.phone = phone;
      if (address !== customerInfo?.address) updateData.address = address;
      if (area !== customerInfo?.area) updateData.area = area;

      if (Object.keys(updateData).length > 0) {
        let updatedData;
        if (route.params?.EmployeeData) {
          console.log(route.params);
          console.log('Updating profile as Employee with data:', updateData);
          // Nếu là nhân viên thì gọi EmployeeService.updateMyProfile
          updatedData = await EmployeeService.updateMyProfile(updateData);
        } else {
          console.log('Updating profile as Customer with data:', updateData);
          // Nếu là khách thì gọi CustomerService.updateCustomerInfo
          updatedData = await CustomerService.updateCustomerInfo(updateData);
        }
        setCustomerInfo(updatedData);

        if (emailChanged) {
          Alert.alert(
            'Email Updated',
            'Your email has been updated successfully. Please log out and log in again with your new email.',
            [
              {
                text: 'OK',
                onPress: async () => {
                  const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
                  await AsyncStorage.removeItem('access_token');
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'PreLogin' }],
                  });
                }
              }
            ]
          );
          return;
        }

        Alert.alert('Success', 'Profile updated successfully!');
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile info:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form values to original
    if (customerInfo) {
      setName(customerInfo.name || '');
      setEmail(customerInfo.email || '');
      setPhone(customerInfo.phone || '');
      setAddress(customerInfo.address || '');
      setArea(customerInfo.area || '');
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#047857" />
      </View>
    );
  }

  const avatarSource = customerInfo?.img
    ? { uri: customerInfo.img }
    : require('../../assets/avt.png');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#12603b" />

      {/* Background xanh đậm full screen */}
      <ImageBackground
        source={require('../../assets/background_profile.png')}
        style={styles.backgroundFull}
        resizeMode="cover"
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Image
            source={require('../../assets/back_button_white.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Profile Card với background xanh nhạt */}
        <ImageBackground
          source={require('../../assets/background_profile2.png')}
          style={styles.profileCard}
          resizeMode="cover"
          imageStyle={styles.profileCardImage}
        >
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <Image source={avatarSource} style={styles.avatar} />
          </View>

          {/* Name và Edit Button */}
          <View style={styles.nameEditContainer}>
            {isEditing ? (
              <TextInput
                style={styles.nameInput}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#9ca3af"
                textAlign="center"
              />
            ) : (
              <Text style={styles.name}>{customerInfo?.name || 'Guest'}</Text>
            )}
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEdit}
              activeOpacity={0.8}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields - Thay thế menu items */}
          <View style={styles.formContainer}>
            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter email"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={isEditing}
              />
            </View>

            {/* Phone */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter phone"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
                editable={isEditing}
              />
            </View>

            {/* Address */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="Enter address"
                placeholderTextColor="#9ca3af"
                editable={isEditing}
              />
            </View>

            {/* Area - Picker */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Area</Text>
              <TouchableOpacity
                style={[styles.input, styles.pickerButton]}
                onPress={() => isEditing && setShowAreaPicker(true)}
                disabled={!isEditing}
              >
                <Text style={[styles.pickerText, !area && styles.placeholderText]}>
                  {area || 'Select area'}
                </Text>
                <Text style={styles.dropdownIcon}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Buttons - Chỉ hiện khi đang edit */}
          {isEditing && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={handleSave}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          )}
        </ImageBackground>
      </ImageBackground>

      {/* Area Picker Modal */}
      <Modal
        visible={showAreaPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAreaPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Area</Text>
              <TouchableOpacity onPress={() => setShowAreaPicker(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={AREA_CHOICES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.areaItem,
                    area === item && styles.areaItemSelected
                  ]}
                  onPress={() => {
                    setArea(item);
                    setShowAreaPicker(false);
                  }}
                >
                  <Text style={[
                    styles.areaItemText,
                    area === item && styles.areaItemTextSelected
                  ]}>
                    {item}
                  </Text>
                  {area === item && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#12603b',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#12603b',
  },
  backgroundFull: {
    flex: 1,
    width: '100%',
    paddingTop: 16,
  },
  backButton: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
    marginTop: 8,
  },
  backIcon: {
    width: 58,
    height: 58,
  },
  profileCard: {
    flex: 1,
    marginTop: height * 0.12,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'visible',
    paddingTop: 80,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  profileCardImage: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  avatarContainer: {
    position: 'absolute',
    top: -70,
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0f2f1',
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 10,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 56,
  },
  nameEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  nameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#047857',
    paddingBottom: 4,
    minWidth: 200,
  },
  editButton: {
    position: 'absolute',
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#047857',
  },
  formContainer: {
    gap: 16,
    marginBottom: 32,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    color: '#9ca3af',
    marginLeft: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: '#111827',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#6b7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.7,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalClose: {
    fontSize: 24,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  areaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  areaItemSelected: {
    backgroundColor: '#f0fdf4',
  },
  areaItemText: {
    fontSize: 16,
    color: '#111827',
  },
  areaItemTextSelected: {
    color: '#047857',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 20,
    color: '#047857',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#047857',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#047857',
  },
  confirmButton: {
    backgroundColor: '#047857',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});