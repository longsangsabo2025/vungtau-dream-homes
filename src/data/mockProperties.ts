export interface Property {
  id: string;
  title: string;
  price: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  location: string;
  district: string;
  image: string;
  type: string;
  isHot: boolean;
  description: string;
}

export const mockProperties: Property[] = [
  {
    id: "1",
    title: "Biệt thự cao cấp view biển Bãi Sau",
    price: 15000000000,
    area: 250,
    bedrooms: 5,
    bathrooms: 4,
    location: "Bãi Sau, Thành phố Vũng Tàu",
    district: "tp-vungtau",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
    type: "Nhà",
    isHot: true,
    description: "Biệt thự sang trọng với view biển tuyệt đẹp, nội thất cao cấp"
  },
  {
    id: "2",
    title: "Đất nền dự án khu đô thị mới",
    price: 5000000000,
    area: 120,
    location: "Long Hải, Huyện Long Điền",
    district: "long-dien",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
    type: "Đất",
    isHot: true,
    description: "Đất nền vị trí đẹp, sổ hồng riêng, hạ tầng hoàn thiện"
  },
  {
    id: "3",
    title: "Chung cư The Sóng 2PN view thành phố",
    price: 3500000000,
    area: 75,
    bedrooms: 2,
    bathrooms: 2,
    location: "Trần Phú, Thành phố Vũng Tàu",
    district: "tp-vungtau",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80",
    type: "Chung cư",
    isHot: false,
    description: "Căn hộ hiện đại, đầy đủ nội thất, gần biển"
  },
  {
    id: "4",
    title: "Nhà phố mặt tiền đường lớn 4 tầng",
    price: 8500000000,
    area: 100,
    bedrooms: 4,
    bathrooms: 3,
    location: "Thùy Vân, Thành phố Vũng Tàu",
    district: "tp-vungtau",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
    type: "Nhà",
    isHot: false,
    description: "Nhà phố kinh doanh tốt, vị trí đắc địa"
  },
  {
    id: "5",
    title: "Cho thuê villa nghỉ dưỡng cao cấp",
    price: 50000000,
    area: 200,
    bedrooms: 4,
    bathrooms: 3,
    location: "Hồ Tràm, Huyện Xuyên Mộc",
    district: "xuyen-moc",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    type: "Cho thuê",
    isHot: true,
    description: "Villa nghỉ dưỡng sang trọng, view biển, hồ bơi riêng"
  },
  {
    id: "6",
    title: "Căn hộ studio cho thuê gần biển",
    price: 8000000,
    area: 35,
    bedrooms: 1,
    bathrooms: 1,
    location: "Thùy Vân, Thành phố Vũng Tàu",
    district: "tp-vungtau",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    type: "Cho thuê",
    isHot: false,
    description: "Studio hiện đại, đầy đủ nội thất, phù hợp cho người độc thân"
  },
  {
    id: "7",
    title: "Đất vườn 1000m² giá đầu tư",
    price: 3000000000,
    area: 1000,
    location: "Bàu Chinh, Huyện Châu Đức",
    district: "chau-duc",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80",
    type: "Đất",
    isHot: false,
    description: "Đất vườn rộng rãi, thích hợp làm nhà vườn nghỉ dưỡng"
  },
  {
    id: "8",
    title: "Nhà mặt tiền biển 3 tầng đẹp",
    price: 12000000000,
    area: 150,
    bedrooms: 5,
    bathrooms: 4,
    location: "Bãi Dứa, Thành phố Vũng Tàu",
    district: "tp-vungtau",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
    type: "Nhà",
    isHot: true,
    description: "Nhà mặt tiền biển tuyệt đẹp, view đắt giá"
  }
];
