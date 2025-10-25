<template>
  <div class="h-screen w-full flex justify-center items-center bg-gray-50">
    <div class="form">
      <div class="form-header">
        <h1 class="form-title">{{ $t('create_account_title') }}</h1>
        <p class="form-subtitle">{{ $t('create_account_subtitle') }}</p>
      </div>
      <form @submit.prevent="submitForm" class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <!-- First Name -->
        <div class="flex-column">
          <label>{{ $t('first_name') }}</label>
          <div class="inputForm" :class="{ 'error-border': firstNameError }">
            <input
              v-model="form.first_name"
              type="text"
              class="input"
              :placeholder="$t('first_name')"
              @blur="validateFirstName"
              @input="validateFirstName"
            />
          </div>
          <span v-if="firstNameError" class="error-text">{{ firstNameError }}</span>
        </div>

        <!-- Last Name -->
        <div class="flex-column">
          <label>{{ $t('last_name') }}</label>
          <div class="inputForm" :class="{ 'error-border': lastNameError }">
            <input
              v-model="form.last_name"
              type="text"
              class="input"
              :placeholder="$t('last_name')"
              @blur="validateLastName"
              @input="validateLastName"
            />
          </div>
          <span v-if="lastNameError" class="error-text">{{ lastNameError }}</span>
        </div>

        <!-- Email -->
        <div class="flex-column">
          <label>{{ $t('email') }}</label>
          <div class="inputForm" :class="{ 'error-border': emailError }">
            <input
              v-model="form.email"
              type="email"
              class="input"
              :placeholder="$t('email')"
              @blur="validateEmail"
              @input="validateEmail"
            />
          </div>
          <span v-if="emailError" class="error-text">{{ emailError }}</span>
        </div>

        <!-- Password -->
        <div class="flex-column">
          <label>{{ $t('password') }}</label>
          <div class="inputForm" :class="{ 'error-border': passwordError }">
            <input
              v-model="form.password"
              type="password"
              class="input"
              :placeholder="$t('password')"
              @blur="validatePassword"
              @input="validatePassword"
            />
          </div>
          <span v-if="passwordError" class="error-text">{{ passwordError }}</span>
        </div>

        <!-- Phone -->
        <div class="flex-column">
          <label>{{ $t('phone') }}</label>
          <div class="inputForm" :class="{ 'error-border': phoneError }">
            <input
              v-model="form.phone"
              type="text"
              class="input"
              :placeholder="$t('phone')"
              @blur="validatePhone"
              @input="validatePhone"
            />
          </div>
          <span v-if="phoneError" class="error-text">{{ phoneError }}</span>
        </div>

        <!-- Address -->
        <div class="flex-column">
          <label>{{ $t('Address') }}</label>
          <div class="inputForm" :class="{ 'error-border': addressError }">
            <input
              v-model="form.address"
              type="text"
              class="input"
              :placeholder="$t('Address')"
              @blur="validateAddress"
              @input="validateAddress"
            />
          </div>
          <span v-if="addressError" class="error-text">{{ addressError }}</span>
        </div>

        <!-- Area -->
        <div class="flex-column col-span-2">
          <label>{{ $t('area') }}</label>
          <div class="inputForm" :class="{ 'error-border': areaError }" style="position: relative;">
            <input
              v-model="form.area"
              type="text"
              class="input"
              :placeholder="$t('area_placeholder')"
              @input="filterAreas(); validateArea()"
              @focus="showAreaList = true"
              @blur="hideAreaList(); validateArea()"
              autocomplete="off"
            />
            <!-- Dropdown danh sách khu vực -->
            <div v-if="showAreaList && filteredAreas.length > 0" class="area-dropdown">
              <div
                v-for="area in filteredAreas"
                :key="area"
                class="area-option"
                @mousedown="selectArea(area)"
              >
                <span class="area-icon">📍</span>
                <span class="area-name">{{ area }}</span>
              </div>
            </div>
          </div>
          <span v-if="areaError" class="error-text">{{ areaError }}</span>
        </div>

        <!-- Submit Button -->
        <div class="col-span-2">
          <button type="submit" class="button-submit" :disabled="isLoading">
            <span v-if="isLoading">{{ $t('Registering') }}</span>
            <span v-else>{{ $t('Register') }}</span>
          </button>
        </div>

        <!-- Success Message -->
        <p v-if="isSubmitted" class="p col-span-2">
          {{ $t('Account created for', { email: form.email }) }}
        </p>

        <!-- Login Link -->
        <div class="flex justify-center items-center col-span-2">
          <p class="text-center">
            {{ $t('have_an_account') }}
            <NuxtLink to="/" class="span font-semibold">
              {{ $t('Login') }}
            </NuxtLink>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconAmoz from '~/assets/icons/BigLogo.svg'
import { ref, computed, watch, onMounted } from 'vue'
import { ElNotification } from 'element-plus'
import customerApi from '@/services/dss/users/customer'
import '@/assets/css/form.css'

definePageMeta({
  layout: 'anonymous'
})

const form = ref({
  email: '',
  password: '',
  first_name: '',
  last_name: '',
  phone: '',
  address: '',
  area: ''
})

const isLoading = ref(false)
const isSubmitted = ref(false)
const emailError = ref('')
const passwordError = ref('')
const areaError = ref('')
const addressError = ref('')
const phoneError = ref('')
const firstNameError = ref('')
const lastNameError = ref('')

// Area search functionality
const showAreaList = ref(false)
const filteredAreas = ref<string[]>([])

// Fallback static areas (Vietnamese)
const staticAreas = [
  'Hải Châu', 'Ngũ Hành Sơn', 'Liên Chiểu', 'Sơn Trà', 'Cẩm Lệ', 'Thanh Khê'
]

// Get translated areas with fallback
const allAreas = computed(() => {
  return staticAreas
})

// Initialize with all areas
onMounted(() => {
  filteredAreas.value = allAreas.value
})

// Area search functions
const filterAreas = () => {
  const searchTerm = form.value.area.toLowerCase()
  if (!searchTerm) {
    filteredAreas.value = allAreas.value
    return
  }
  
  filteredAreas.value = allAreas.value.filter(area => 
    area.toLowerCase().includes(searchTerm)
  )
}

const hideAreaList = () => {
  setTimeout(() => {
    showAreaList.value = false
  }, 200)
}

const selectArea = (area: string) => {
  form.value.area = area
  showAreaList.value = false
}

const validateFirstName = () => {
  if (!form.value.first_name.trim()) {
    firstNameError.value = 'Họ không được để trống'
  } else if (form.value.first_name.length > 50) {
    firstNameError.value = 'Họ không được vượt quá 50 ký tự'
  } else {
    firstNameError.value = ''
  }
}

const validateLastName = () => {
  if (!form.value.last_name.trim()) {
    lastNameError.value = 'Tên không được để trống'
  } else if (form.value.last_name.length > 150) {
    lastNameError.value = 'Tên không được vượt quá 150 ký tự'
  } else {
    lastNameError.value = ''
  }
}

const validateEmail = () => {
  if (!form.value.email) {
    emailError.value = 'Email không được để trống'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    emailError.value = 'Email không hợp lệ'
  } else {
    emailError.value = ''
  }
}

const validatePassword = () => {
  if (!form.value.password) {
    passwordError.value = 'Mật khẩu không được để trống'
  } else if (form.value.password.length < 6) {
    passwordError.value = 'Mật khẩu phải có ít nhất 6 ký tự'
  } else {
    passwordError.value = ''
  }
}

const validatePhone = () => {
  if (!form.value.phone.trim()) {
    phoneError.value = 'Số điện thoại không được để trống'
  } else if (form.value.phone.length > 20) {
    phoneError.value = 'Số điện thoại không được vượt quá 20 ký tự'
  } else if (!/^[0-9+\-\s()]+$/.test(form.value.phone)) {
    phoneError.value = 'Số điện thoại chỉ được chứa số và các ký tự đặc biệt'
  } else {
    phoneError.value = ''
  }
}

const validateAddress = () => {
  if (!form.value.address.trim()) {
    addressError.value = 'Địa chỉ không được để trống'
  } else if (form.value.address.length > 255) {
    addressError.value = 'Địa chỉ không được vượt quá 255 ký tự'
  } else {
    addressError.value = ''
  }
}

const validateArea = () => {
  if (!form.value.area.trim()) {
    areaError.value = 'Khu vực không được để trống'
  } else if (!allAreas.value.includes(form.value.area)) {
    areaError.value = 'Khu vực không hợp lệ, vui lòng chọn từ danh sách'
  } else {
    areaError.value = ''
  }
}

const validateForm = () => {
  validateFirstName()
  validateLastName()
  validateEmail()
  validatePassword()
  validatePhone()
  validateAddress()
  validateArea()
  
  return !firstNameError.value && 
         !lastNameError.value && 
         !emailError.value && 
         !passwordError.value && 
         !phoneError.value && 
         !addressError.value && 
         !areaError.value
}

const submitForm = async () => {
  if (!validateForm()) {
    ElNotification({
      title: 'Vui lòng kiểm tra lại thông tin',
      message: 'Có một số trường thông tin chưa hợp lệ. Vui lòng sửa lại!',
      type: 'warning',
      duration: 5000
    })
    return
  }

  isLoading.value = true
  try {
    const response = await customerApi.registerCustomer(form.value)
    
    isSubmitted.value = true
    ElNotification({
      title: 'Thành công',
      message: 'Tài khoản đã được tạo thành công!',
      type: 'success',
      duration: 5000
    })
    
    // Reset form và lỗi sau khi đăng ký thành công
    form.value = {
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      phone: '',
      address: '',
      area: ''
    }
    firstNameError.value = ''
    lastNameError.value = ''
    emailError.value = ''
    passwordError.value = ''
    phoneError.value = ''
    addressError.value = ''
    areaError.value = ''
  } catch (error: any) {
    console.log('Registration error:', error)
    let errorMessage = 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại!'
    
    if (error?.status === 400 || error?.response?.status === 400) {
      // Thử nhiều cách lấy error data
      const errorData = error?._data || error?.data || error?.response?.data || error?.response?._data
      console.log('Error data from backend:', errorData)
      
      if (errorData && typeof errorData === 'object') {
        if (errorData?.email) {
          const emailMsg = Array.isArray(errorData.email) ? errorData.email[0] : errorData.email
          emailError.value = emailMsg
          errorMessage = 'Email này đã được sử dụng!'
        }
        if (errorData?.password) {
          const passwordMsg = Array.isArray(errorData.password) ? errorData.password[0] : errorData.password
          passwordError.value = passwordMsg
          errorMessage = 'Lỗi mật khẩu: ' + passwordMsg
        }
        if (errorData?.phone) {
          const phoneMsg = Array.isArray(errorData.phone) ? errorData.phone[0] : errorData.phone
          phoneError.value = phoneMsg
          errorMessage = 'Số điện thoại này đã được sử dụng!'
        }
        if (errorData?.address) {
          const addressMsg = Array.isArray(errorData.address) ? errorData.address[0] : errorData.address
          addressError.value = addressMsg
          errorMessage = 'Lỗi địa chỉ: ' + addressMsg
        }
        if (errorData?.area) {
          const areaMsg = Array.isArray(errorData.area) ? errorData.area[0] : errorData.area
          areaError.value = areaMsg
          errorMessage = 'Lỗi khu vực: ' + areaMsg
        }
        if (errorData?.first_name) {
          const firstNameMsg = Array.isArray(errorData.first_name) ? errorData.first_name[0] : errorData.first_name
          firstNameError.value = firstNameMsg
          errorMessage = 'Lỗi họ: ' + firstNameMsg
        }
        if (errorData?.last_name) {
          const lastNameMsg = Array.isArray(errorData.last_name) ? errorData.last_name[0] : errorData.last_name
          lastNameError.value = lastNameMsg
          errorMessage = 'Lỗi tên: ' + lastNameMsg
        }
        if (errorData?.non_field_errors) {
          const nonFieldMsg = Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors[0] : errorData.non_field_errors
          errorMessage = nonFieldMsg
        }
        
        const errorKeys = Object.keys(errorData)
        if (errorKeys.length > 1) {
          errorMessage = 'Có một số lỗi trong thông tin đăng ký. Vui lòng kiểm tra lại các trường có đánh dấu đỏ!'
        }
      }
    } else if (error?.status === 500 || error?.response?.status === 500) {
      errorMessage = 'Lỗi server. Vui lòng thử lại sau!'
    } else if (error?.code === 'NETWORK_ERROR' || !error?.response) {
      errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet!'
    }
    
    ElNotification({
      title: 'Đăng ký thất bại',
      message: errorMessage,
      type: 'error',
      duration: 8000
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.form {
  width: 70%;
  max-width: 80%; 
  height: 87%;
  padding: 40px; 
  background-color: #fff; 
  border-radius: 10px; 
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); 
  margin-top: 5%;
}

.input {
  width: 400px; 
}

.error-text {
  color: #ef4444;
  font-size: 14px;
  margin-top: 4px;
  display: block;
}

.error-border {
  border-color: #ef4444 !important;
  border-width: 2px !important;
}

/* Area search dropdown styles */
.area-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 250px;
  overflow-y: auto;
  background: white;
  border: 2px solid #e5e7eb;
  border-top: none;
  border-radius: 0 0 12px 12px;
  z-index: 1000;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.area-option {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: all 0.2s ease;
  font-size: 14px;
}

.area-option:last-child {
  border-bottom: none;
  border-radius: 0 0 10px 10px;
}

.area-option:hover {
  background-color: #f8fafc;
  border-left: 3px solid #2d79f3;
  padding-left: 13px;
}

.area-option:active {
  background-color: #e5e7eb;
}

.area-icon {
  margin-right: 8px;
  font-size: 16px;
}

.area-name {
  flex: 1;
  font-weight: 500;
  color: #374151;
}

/* Scrollbar styling */
.area-dropdown::-webkit-scrollbar {
  width: 6px;
}

.area-dropdown::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.area-dropdown::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.area-dropdown::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>