// Dynamic form fields configuration based on property category
// Each category has specific required and optional fields

export interface FieldConfig {
  name: string;
  label: string;
  type: 'number' | 'select' | 'text';
  required: boolean;
  placeholder?: string;
  options?: string[];
  suffix?: string;
  description?: string;
}

export interface CategoryFieldsConfig {
  requiredFields: string[];
  optionalFields: string[];
  hiddenFields: string[];
}

// Fields configuration for each category
export const PROPERTY_FIELDS_BY_CATEGORY: Record<string, CategoryFieldsConfig> = {
  'can-ho': {
    requiredFields: ['bedrooms', 'bathrooms', 'floor_number'],
    optionalFields: ['furniture_status', 'direction', 'parking_slots', 'year_built'],
    hiddenFields: ['road_width', 'land_area', 'number_of_floors']
  },
  'villa': {
    requiredFields: ['bedrooms', 'bathrooms'],
    optionalFields: ['furniture_status', 'direction', 'parking_slots', 'year_built', 'land_area', 'number_of_floors'],
    hiddenFields: ['floor_number', 'road_width']
  },
  'nha-pho': {
    requiredFields: ['bedrooms', 'bathrooms', 'number_of_floors'],
    optionalFields: ['furniture_status', 'direction', 'parking_slots', 'year_built', 'road_width'],
    hiddenFields: ['floor_number', 'land_area']
  },
  'dat-nen': {
    requiredFields: ['legal_status', 'direction'],
    optionalFields: ['road_width', 'land_area'],
    hiddenFields: ['bedrooms', 'bathrooms', 'furniture_status', 'floor_number', 'parking_slots', 'year_built', 'number_of_floors']
  },
  'shophouse': {
    requiredFields: ['number_of_floors', 'road_width'],
    optionalFields: ['bedrooms', 'bathrooms', 'parking_slots', 'direction', 'furniture_status'],
    hiddenFields: ['floor_number', 'land_area', 'year_built']
  },
  'condotel': {
    requiredFields: ['bedrooms', 'bathrooms', 'floor_number', 'furniture_status'],
    optionalFields: ['direction', 'parking_slots', 'year_built'],
    hiddenFields: ['road_width', 'land_area', 'number_of_floors']
  },
  'studio': {
    requiredFields: ['bathrooms', 'floor_number', 'furniture_status'],
    optionalFields: ['direction', 'parking_slots'],
    hiddenFields: ['bedrooms', 'road_width', 'land_area', 'number_of_floors', 'year_built']
  }
};

// Field definitions with labels and options
export const FIELD_DEFINITIONS: Record<string, FieldConfig> = {
  bedrooms: {
    name: 'bedrooms',
    label: 'Số phòng ngủ',
    type: 'number',
    required: false,
    placeholder: '3',
    suffix: 'phòng'
  },
  bathrooms: {
    name: 'bathrooms',
    label: 'Số phòng tắm',
    type: 'number',
    required: false,
    placeholder: '2',
    suffix: 'phòng'
  },
  floor_number: {
    name: 'floor_number',
    label: 'Tầng số',
    type: 'number',
    required: false,
    placeholder: '15',
    description: 'Tầng của căn hộ trong tòa nhà'
  },
  number_of_floors: {
    name: 'number_of_floors',
    label: 'Số tầng',
    type: 'number',
    required: false,
    placeholder: '3',
    description: 'Tổng số tầng của ngôi nhà'
  },
  furniture_status: {
    name: 'furniture_status',
    label: 'Tình trạng nội thất',
    type: 'select',
    required: false,
    options: ['Chưa có nội thất', 'Nội thất cơ bản', 'Nội thất đầy đủ', 'Nội thất cao cấp']
  },
  direction: {
    name: 'direction',
    label: 'Hướng',
    type: 'select',
    required: false,
    options: ['Đông', 'Tây', 'Nam', 'Bắc', 'Đông Bắc', 'Đông Nam', 'Tây Bắc', 'Tây Nam']
  },
  parking_slots: {
    name: 'parking_slots',
    label: 'Chỗ đậu xe',
    type: 'number',
    required: false,
    placeholder: '2',
    suffix: 'xe'
  },
  year_built: {
    name: 'year_built',
    label: 'Năm xây dựng',
    type: 'number',
    required: false,
    placeholder: '2020'
  },
  legal_status: {
    name: 'legal_status',
    label: 'Giấy tờ pháp lý',
    type: 'select',
    required: false,
    options: ['Sổ đỏ/Sổ hồng', 'Sổ hồng riêng', 'Giấy tờ hợp lệ', 'Đang chờ sổ']
  },
  road_width: {
    name: 'road_width',
    label: 'Độ rộng mặt tiền',
    type: 'number',
    required: false,
    placeholder: '6',
    suffix: 'm',
    description: 'Độ rộng mặt tiền đường'
  },
  land_area: {
    name: 'land_area',
    label: 'Diện tích đất',
    type: 'number',
    required: false,
    placeholder: '150',
    suffix: 'm²',
    description: 'Diện tích đất (nếu khác với diện tích sàn)'
  }
};

// Helper function to check if a field should be shown
export function shouldShowField(categorySlug: string, fieldName: string): boolean {
  const config = PROPERTY_FIELDS_BY_CATEGORY[categorySlug];
  if (!config) return true; // Show all fields if category not found
  
  return !config.hiddenFields.includes(fieldName);
}

// Helper function to check if a field is required
export function isFieldRequired(categorySlug: string, fieldName: string): boolean {
  const config = PROPERTY_FIELDS_BY_CATEGORY[categorySlug];
  if (!config) return false;
  
  return config.requiredFields.includes(fieldName);
}

// Get all visible fields for a category
export function getVisibleFields(categorySlug: string): string[] {
  const config = PROPERTY_FIELDS_BY_CATEGORY[categorySlug];
  if (!config) return Object.keys(FIELD_DEFINITIONS);
  
  return [...config.requiredFields, ...config.optionalFields];
}
