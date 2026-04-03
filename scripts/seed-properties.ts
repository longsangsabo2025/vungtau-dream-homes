/**
 * Seed 20 realistic Vũng Tàu property listings into Supabase.
 *
 * Usage:  npx tsx scripts/seed-properties.ts
 *
 * Reads SUPABASE_SERVICE_ROLE_KEY and VITE_SUPABASE_URL from .env
 * (falls back to .env.local).
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

// ---------------------------------------------------------------------------
// ENV
// ---------------------------------------------------------------------------
config({ path: resolve(__dirname, "../.env") });
config({ path: resolve(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing env vars. Ensure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env"
  );
  process.exit(1);
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---------------------------------------------------------------------------
// DATA — 20 realistic listings
// ---------------------------------------------------------------------------

interface PropertySeed {
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image_url: string;
  description: string;
  type: string;
  status: string;
  address_detail: string;
  district: string;
  ward: string;
  latitude: number;
  longitude: number;
  year_built: number | null;
  floor_number?: number;
  total_floors?: number;
  parking_slots?: number;
  direction: string;
  legal_status: string;
  furniture_status: string;
  is_featured: boolean;
  features: string[];
  extra_images: string[];
}

const properties: PropertySeed[] = [
  // ---- APARTMENTS ----
  {
    title: "Căn hộ Vũng Tàu Melody 3PN view biển Bãi Sau",
    price: 4_800_000_000,
    location: "Võ Thị Sáu, Phường Thắng Tam, Vũng Tàu",
    bedrooms: 3,
    bathrooms: 2,
    area: 95,
    image_url: "https://picsum.photos/seed/vtm01/800/600",
    description:
      "Căn hộ Vũng Tàu Melody tầng cao, view biển Bãi Sau tuyệt đẹp. Thiết kế 3 phòng ngủ rộng rãi, phòng khách thoáng mát với ban công lớn. Nội thất gỗ tự nhiên cao cấp, bếp mở hiện đại. Dự án có hồ bơi tầng thượng, gym, khu BBQ và an ninh 24/7. Cách bãi biển chỉ 200m, thuận tiện đi bộ xuống tắm biển mỗi ngày.",
    type: "Căn hộ",
    status: "Có sẵn",
    address_detail: "88 Võ Thị Sáu, Phường Thắng Tam",
    district: "Thành phố Vũng Tàu",
    ward: "Phường Thắng Tam",
    latitude: 10.3462,
    longitude: 107.0872,
    year_built: 2022,
    floor_number: 18,
    total_floors: 25,
    parking_slots: 1,
    direction: "Đông",
    legal_status: "Sổ hồng",
    furniture_status: "Đầy đủ nội thất",
    is_featured: true,
    features: ["View biển", "Hồ bơi", "Phòng gym", "An ninh 24/7", "Ban công", "Thang máy"],
    extra_images: [
      "https://picsum.photos/seed/vtm01a/800/600",
      "https://picsum.photos/seed/vtm01b/800/600",
      "https://picsum.photos/seed/vtm01c/800/600",
    ],
  },
  {
    title: "Căn hộ The Sóng 2PN tầng 20 view biển Thùy Vân",
    price: 4_200_000_000,
    location: "Thùy Vân, Phường 2, Vũng Tàu",
    bedrooms: 2,
    bathrooms: 2,
    area: 72,
    image_url: "https://picsum.photos/seed/vts02/800/600",
    description:
      "Căn hộ The Sóng - dự án biểu tượng mới của Vũng Tàu. Tầng 20 view trực diện biển Thùy Vân, ban công rộng đón gió biển. Nội thất bàn giao cơ bản chất lượng cao. Tiện ích: hồ bơi vô cực 400m2, sky bar, gym & yoga studio, khu vui chơi trẻ em, bãi biển riêng. Cơ hội đầu tư cho thuê du lịch sinh lời cao.",
    type: "Căn hộ",
    status: "Hot",
    address_detail: "Tầng 20, Block A, The Sóng, Thùy Vân",
    district: "Thành phố Vũng Tàu",
    ward: "Phường 2",
    latitude: 10.3445,
    longitude: 107.0856,
    year_built: 2023,
    floor_number: 20,
    total_floors: 30,
    parking_slots: 1,
    direction: "Đông Nam",
    legal_status: "Sổ hồng",
    furniture_status: "Cơ bản",
    is_featured: true,
    features: ["View biển", "Hồ bơi", "Phòng gym", "An ninh 24/7", "Thang máy", "Ban công"],
    extra_images: [
      "https://picsum.photos/seed/vts02a/800/600",
      "https://picsum.photos/seed/vts02b/800/600",
    ],
  },
  {
    title: "Căn hộ Gold Coast Nha Trang view biển 1PN",
    price: 1_950_000_000,
    location: "Trần Phú, Phường 5, Vũng Tàu",
    bedrooms: 1,
    bathrooms: 1,
    area: 50,
    image_url: "https://picsum.photos/seed/vtgc03/800/600",
    description:
      "Căn hộ 1 phòng ngủ tại khu vực Trần Phú, view biển Bãi Trước lãng mạn. Thiết kế tối ưu không gian, nội thất hiện đại đầy đủ. Phù hợp cho cặp đôi hoặc đầu tư cho thuê ngắn hạn. Gần Bạch Dinh, công viên Bãi Trước, các nhà hàng hải sản nổi tiếng. Tòa nhà có hồ bơi, phòng tập, dịch vụ lễ tân 24/7.",
    type: "Căn hộ",
    status: "Có sẵn",
    address_detail: "15 Trần Phú, Phường 5",
    district: "Thành phố Vũng Tàu",
    ward: "Phường 5",
    latitude: 10.3534,
    longitude: 107.0745,
    year_built: 2021,
    floor_number: 12,
    total_floors: 20,
    parking_slots: 1,
    direction: "Tây",
    legal_status: "Sổ hồng",
    furniture_status: "Đầy đủ nội thất",
    is_featured: false,
    features: ["View biển", "Hồ bơi", "An ninh 24/7", "Thang máy", "Điều hòa"],
    extra_images: [
      "https://picsum.photos/seed/vtgc03a/800/600",
      "https://picsum.photos/seed/vtgc03b/800/600",
    ],
  },
  {
    title: "Căn hộ CSJ Tower 2PN giá tốt Phường Thắng Nhì",
    price: 2_650_000_000,
    location: "Nguyễn Hữu Cảnh, Phường Thắng Nhì, Vũng Tàu",
    bedrooms: 2,
    bathrooms: 2,
    area: 68,
    image_url: "https://picsum.photos/seed/vtcsj04/800/600",
    description:
      "Căn hộ CSJ Tower vị trí trung tâm thành phố Vũng Tàu, cách biển Bãi Sau 500m. 2 phòng ngủ thoáng mát, view thành phố đẹp. Nội thất bàn giao cơ bản, dễ dàng tùy chỉnh theo sở thích. Khu vực sầm uất, gần chợ Vũng Tàu, siêu thị Lotte, bệnh viện Lê Lợi. Phù hợp gia đình trẻ hoặc cho thuê dài hạn.",
    type: "Căn hộ",
    status: "Có sẵn",
    address_detail: "45 Nguyễn Hữu Cảnh, Phường Thắng Nhì",
    district: "Thành phố Vũng Tàu",
    ward: "Phường Thắng Nhì",
    latitude: 10.3501,
    longitude: 107.0801,
    year_built: 2020,
    floor_number: 8,
    total_floors: 22,
    parking_slots: 1,
    direction: "Nam",
    legal_status: "Sổ hồng",
    furniture_status: "Cơ bản",
    is_featured: false,
    features: ["View thành phố", "Thang máy", "An ninh 24/7", "Bãi đậu xe"],
    extra_images: [
      "https://picsum.photos/seed/vtcsj04a/800/600",
    ],
  },

  // ---- HOUSES ----
  {
    title: "Nhà phố 4 tầng mặt tiền Lê Hồng Phong",
    price: 9_500_000_000,
    location: "Lê Hồng Phong, Phường 4, Vũng Tàu",
    bedrooms: 4,
    bathrooms: 4,
    area: 280,
    image_url: "https://picsum.photos/seed/vtnh05/800/600",
    description:
      "Nhà phố 4 tầng mặt tiền đường Lê Hồng Phong, tuyến đường sầm uất nhất Vũng Tàu. Mặt tiền 6m, thiết kế hiện đại, tầng trệt kinh doanh, 3 tầng trên để ở. 4 phòng ngủ rộng, sân thượng rộng rãi nhìn ra núi Lớn. Pháp lý sổ hồng chính chủ, sẵn sàng công chứng. Vị trí vàng, phù hợp vừa ở vừa kinh doanh.",
    type: "Nhà phố",
    status: "Có sẵn",
    address_detail: "256 Lê Hồng Phong, Phường 4",
    district: "Thành phố Vũng Tàu",
    ward: "Phường 4",
    latitude: 10.3521,
    longitude: 107.0789,
    year_built: 2019,
    total_floors: 4,
    parking_slots: 2,
    direction: "Nam",
    legal_status: "Sổ hồng",
    furniture_status: "Cơ bản",
    is_featured: true,
    features: ["Bãi đậu xe", "Sân thượng", "View thành phố"],
    extra_images: [
      "https://picsum.photos/seed/vtnh05a/800/600",
      "https://picsum.photos/seed/vtnh05b/800/600",
    ],
  },
  {
    title: "Nhà 3 tầng hẻm ô tô Phường Thắng Tam gần biển",
    price: 5_200_000_000,
    location: "Phan Chu Trinh, Phường Thắng Tam, Vũng Tàu",
    bedrooms: 3,
    bathrooms: 3,
    area: 180,
    image_url: "https://picsum.photos/seed/vtnh06/800/600",
    description:
      "Nhà 3 tầng mới xây hẻm ô tô rộng 6m tại Phường Thắng Tam, cách biển Bãi Sau chỉ 300m. Thiết kế hiện đại thoáng mát, phòng khách rộng, bếp mở. Tầng thượng có mái che phù hợp làm khu BBQ gia đình. Khu vực dân cư văn minh, an ninh tốt, gần trường học và chợ Thắng Tam.",
    type: "Nhà phố",
    status: "Có sẵn",
    address_detail: "Hẻm 12 Phan Chu Trinh, Phường Thắng Tam",
    district: "Thành phố Vũng Tàu",
    ward: "Phường Thắng Tam",
    latitude: 10.3478,
    longitude: 107.0865,
    year_built: 2023,
    total_floors: 3,
    parking_slots: 1,
    direction: "Đông",
    legal_status: "Sổ hồng",
    furniture_status: "Đầy đủ nội thất",
    is_featured: false,
    features: ["Gần biển", "Bãi đậu xe", "Sân thượng", "An ninh 24/7"],
    extra_images: [
      "https://picsum.photos/seed/vtnh06a/800/600",
      "https://picsum.photos/seed/vtnh06b/800/600",
    ],
  },
  {
    title: "Nhà cấp 4 mặt tiền Long Sơn giá rẻ",
    price: 1_800_000_000,
    location: "Xã Long Sơn, Vũng Tàu",
    bedrooms: 2,
    bathrooms: 1,
    area: 120,
    image_url: "https://picsum.photos/seed/vtnh07/800/600",
    description:
      "Nhà cấp 4 mặt tiền đường nhựa tại xã Long Sơn, diện tích đất rộng 200m2. Nhà hiện trạng 2 phòng ngủ, sân vườn rộng trồng cây ăn trái. Không khí trong lành, yên tĩnh, phù hợp nghỉ dưỡng hoặc đầu tư chờ tăng giá. Cách trung tâm Vũng Tàu 20 phút, gần cảng Gò Dầu và KCN Cái Mép.",
    type: "Nhà phố",
    status: "Có sẵn",
    address_detail: "Đường liên xã Long Sơn",
    district: "Thành phố Vũng Tàu",
    ward: "Xã Long Sơn",
    latitude: 10.3812,
    longitude: 107.0987,
    year_built: 2015,
    total_floors: 1,
    parking_slots: 2,
    direction: "Đông Nam",
    legal_status: "Sổ đỏ",
    furniture_status: "Cơ bản",
    is_featured: false,
    features: ["Sân vườn", "Bãi đậu xe"],
    extra_images: [
      "https://picsum.photos/seed/vtnh07a/800/600",
    ],
  },
  {
    title: "Nhà phố 2 tầng Nguyễn An Ninh gần chợ",
    price: 3_800_000_000,
    location: "Nguyễn An Ninh, Phường 7, Vũng Tàu",
    bedrooms: 3,
    bathrooms: 2,
    area: 150,
    image_url: "https://picsum.photos/seed/vtnh08/800/600",
    description:
      "Nhà phố 2 tầng khu vực Nguyễn An Ninh, Phường 7. Gần chợ Rạch Dừa, siêu thị Co.opmart, trường tiểu học và mầm non. Nhà mới sửa sang, sân trước rộng đậu xe hơi thoải mái. Phòng ngủ tầng trên thoáng mát, phòng khách tầng trệt rộng rãi. Khu dân cư đông đúc, thuận tiện sinh hoạt hàng ngày.",
    type: "Nhà phố",
    status: "Có sẵn",
    address_detail: "67 Nguyễn An Ninh, Phường 7",
    district: "Thành phố Vũng Tàu",
    ward: "Phường 7",
    latitude: 10.3587,
    longitude: 107.0678,
    year_built: 2018,
    total_floors: 2,
    parking_slots: 1,
    direction: "Bắc",
    legal_status: "Sổ hồng",
    furniture_status: "Cơ bản",
    is_featured: false,
    features: ["Gần chợ", "Gần trường học", "Bãi đậu xe"],
    extra_images: [
      "https://picsum.photos/seed/vtnh08a/800/600",
    ],
  },

  // ---- VILLAS ----
  {
    title: "Biệt thự biển Bãi Sau 5PN có hồ bơi riêng",
    price: 25_000_000_000,
    location: "Phan Chu Trinh, Phường 2, Vũng Tàu",
    bedrooms: 5,
    bathrooms: 6,
    area: 450,
    image_url: "https://picsum.photos/seed/vtbt09/800/600",
    description:
      "Biệt thự nghỉ dưỡng cao cấp sát biển Bãi Sau, khuôn viên 450m2 với hồ bơi riêng 60m2. Thiết kế tropical hiện đại, 5 phòng ngủ en-suite, phòng khách đôi với trần cao 6m. Khu BBQ ngoài trời, sân vườn nhiệt đới, garage 3 xe. Nội thất nhập khẩu châu Âu, hệ thống smart home điều khiển bằng giọng nói. Phù hợp nghỉ dưỡng gia đình hoặc kinh doanh homestay cao cấp.",
    type: "Villa",
    status: "Hot",
    address_detail: "22 Phan Chu Trinh, Phường 2",
    district: "Thành phố Vũng Tàu",
    ward: "Phường 2",
    latitude: 10.3435,
    longitude: 107.0898,
    year_built: 2021,
    total_floors: 2,
    parking_slots: 3,
    direction: "Đông",
    legal_status: "Sổ hồng",
    furniture_status: "Đầy đủ nội thất",
    is_featured: true,
    features: [
      "View biển", "Hồ bơi", "Sân vườn", "Bãi đậu xe", "An ninh 24/7", "Gần biển",
    ],
    extra_images: [
      "https://picsum.photos/seed/vtbt09a/800/600",
      "https://picsum.photos/seed/vtbt09b/800/600",
      "https://picsum.photos/seed/vtbt09c/800/600",
    ],
  },
  {
    title: "Villa nghỉ dưỡng Hồ Tràm Strip 4PN",
    price: 18_500_000_000,
    location: "Hồ Tràm, Xuyên Mộc, Bà Rịa - Vũng Tàu",
    bedrooms: 4,
    bathrooms: 4,
    area: 380,
    image_url: "https://picsum.photos/seed/vtbt10/800/600",
    description:
      "Villa trong khu nghỉ dưỡng Hồ Tràm Strip, bãi biển riêng dài 2.2km. Kiến trúc mở, tầm nhìn trực diện biển từ mọi phòng. Hồ bơi infinity riêng, sân vườn nhiệt đới, khu nướng BBQ. Quản lý chuyên nghiệp bởi đơn vị quốc tế, cam kết lợi nhuận cho thuê 8%/năm. Casino, sân golf 18 lỗ, spa 5 sao trong khu resort.",
    type: "Biệt thự",
    status: "Nổi bật",
    address_detail: "Villa R12, Hồ Tràm Strip Resort",
    district: "Huyện Xuyên Mộc",
    ward: "Xã Phước Thuận",
    latitude: 10.4567,
    longitude: 107.3812,
    year_built: 2022,
    total_floors: 2,
    parking_slots: 2,
    direction: "Đông",
    legal_status: "Sổ hồng",
    furniture_status: "Đầy đủ nội thất",
    is_featured: true,
    features: [
      "View biển", "Hồ bơi", "Sân vườn", "Bãi đậu xe", "An ninh 24/7", "Gần biển",
    ],
    extra_images: [
      "https://picsum.photos/seed/vtbt10a/800/600",
      "https://picsum.photos/seed/vtbt10b/800/600",
    ],
  },
  {
    title: "Villa mini Bãi Trước 3PN view biển lãng mạn",
    price: 12_000_000_000,
    location: "Quang Trung, Phường 1, Vũng Tàu",
    bedrooms: 3,
    bathrooms: 3,
    area: 220,
    image_url: "https://picsum.photos/seed/vtbt11/800/600",
    description:
      "Villa mini view biển Bãi Trước tuyệt đẹp, đặc biệt vào hoàng hôn. Khuôn viên 220m2, thiết kế Địa Trung Hải với sân vườn hoa giấy. 3 phòng ngủ lớn, master bedroom có jacuzzi. Bếp mở đảo trung tâm, phòng rượu nhỏ. Gần Bạch Dinh, nhà thờ Đức Bà, phù hợp gia đình cao cấp hoặc cho thuê du lịch premium.",
    type: "Villa",
    status: "Có sẵn",
    address_detail: "10 Quang Trung, Phường 1",
    district: "Thành phố Vũng Tàu",
    ward: "Phường 1",
    latitude: 10.3498,
    longitude: 107.0712,
    year_built: 2020,
    total_floors: 2,
    parking_slots: 2,
    direction: "Tây",
    legal_status: "Sổ hồng",
    furniture_status: "Đầy đủ nội thất",
    is_featured: true,
    features: ["View biển", "Sân vườn", "Bãi đậu xe", "An ninh 24/7"],
    extra_images: [
      "https://picsum.photos/seed/vtbt11a/800/600",
      "https://picsum.photos/seed/vtbt11b/800/600",
    ],
  },

  // ---- LAND ----
  {
    title: "Đất nền sổ đỏ Phú Mỹ Gold City 100m2",
    price: 1_200_000_000,
    location: "Phú Mỹ Gold City, Thị xã Phú Mỹ",
    bedrooms: 0,
    bathrooms: 0,
    area: 100,
    image_url: "https://picsum.photos/seed/vtdn12/800/600",
    description:
      "Đất nền dự án Phú Mỹ Gold City, sổ đỏ riêng từng nền, hạ tầng hoàn thiện 100%. Mặt tiền đường nội bộ 12m, vỉa hè 3m. Gần KCN Phú Mỹ - Cái Mép, trung tâm hành chính thị xã Phú Mỹ. Tiềm năng tăng giá mạnh khi cao tốc Biên Hòa - Vũng Tàu hoàn thành. Hỗ trợ vay ngân hàng 70%, trả góp 0% lãi suất 12 tháng.",
    type: "Đất nền",
    status: "Có sẵn",
    address_detail: "Lô B21, Phú Mỹ Gold City",
    district: "Thị xã Phú Mỹ",
    ward: "Phường Phú Mỹ",
    latitude: 10.5435,
    longitude: 107.0621,
    year_built: null,
    direction: "Đông",
    legal_status: "Sổ đỏ",
    furniture_status: "Không nội thất",
    is_featured: false,
    features: [],
    extra_images: [
      "https://picsum.photos/seed/vtdn12a/800/600",
    ],
  },
  {
    title: "Đất thổ cư Long Điền 200m2 gần biển Long Hải",
    price: 2_400_000_000,
    location: "Long Điền, Bà Rịa - Vũng Tàu",
    bedrooms: 0,
    bathrooms: 0,
    area: 200,
    image_url: "https://picsum.photos/seed/vtdn13/800/600",
    description:
      "Đất thổ cư 100% tại huyện Long Điền, cách biển Long Hải chỉ 1.5km. Mặt tiền đường nhựa 8m, xe container ra vào thoải mái. Khu vực đang phát triển mạnh với nhiều dự án resort, du lịch. Phù hợp xây homestay, nhà nghỉ phục vụ du lịch biển. Sổ đỏ chính chủ, sang tên nhanh trong ngày.",
    type: "Đất nền",
    status: "Có sẵn",
    address_detail: "QL44A, Thị trấn Long Hải",
    district: "Huyện Long Điền",
    ward: "Thị trấn Long Hải",
    latitude: 10.4123,
    longitude: 107.1456,
    year_built: null,
    direction: "Nam",
    legal_status: "Sổ đỏ",
    furniture_status: "Không nội thất",
    is_featured: false,
    features: ["Gần biển"],
    extra_images: [
      "https://picsum.photos/seed/vtdn13a/800/600",
    ],
  },
  {
    title: "Đất nền khu dân cư Chí Linh 80m2 đã có sổ",
    price: 3_200_000_000,
    location: "Khu dân cư Chí Linh, Vũng Tàu",
    bedrooms: 0,
    bathrooms: 0,
    area: 80,
    image_url: "https://picsum.photos/seed/vtdn14/800/600",
    description:
      "Đất nền khu dân cư Chí Linh, vị trí đắc địa trung tâm Vũng Tàu. Diện tích 5x16m, hẻm ô tô rộng 6m. Khu vực hiện hữu dân cư đông đúc, đầy đủ tiện ích: chợ, trường, bệnh viện, ngân hàng. Giá tốt so với thị trường, phù hợp xây nhà ở hoặc đầu tư. Pháp lý rõ ràng, sổ hồng riêng, xây dựng ngay.",
    type: "Đất nền",
    status: "Nổi bật",
    address_detail: "Đường số 3, KDC Chí Linh",
    district: "Thành phố Vũng Tàu",
    ward: "Phường Nguyễn An Ninh",
    latitude: 10.3621,
    longitude: 107.0534,
    year_built: null,
    direction: "Tây Bắc",
    legal_status: "Sổ hồng",
    furniture_status: "Không nội thất",
    is_featured: false,
    features: ["Gần chợ", "Gần trường học"],
    extra_images: [
      "https://picsum.photos/seed/vtdn14a/800/600",
    ],
  },
  {
    title: "Đất mặt tiền đường Tỉnh Lộ 44A Long Hải 500m2",
    price: 8_000_000_000,
    location: "TL44A, Long Hải, Long Điền",
    bedrooms: 0,
    bathrooms: 0,
    area: 500,
    image_url: "https://picsum.photos/seed/vtdn15/800/600",
    description:
      "Đất mặt tiền đường Tỉnh Lộ 44A, khu vực đông khách du lịch. Mặt tiền 15m, chiều sâu 33m, thổ cư 300m2. Phù hợp xây khách sạn, nhà hàng, showroom. Đối diện bãi biển Long Hải đang được đầu tư nâng cấp thành khu du lịch quốc tế. Tiềm năng kinh doanh và tăng giá cực lớn khi hạ tầng hoàn thiện.",
    type: "Đất nền",
    status: "Có sẵn",
    address_detail: "Mặt tiền TL44A, Long Hải",
    district: "Huyện Long Điền",
    ward: "Thị trấn Long Hải",
    latitude: 10.4098,
    longitude: 107.1501,
    year_built: null,
    direction: "Đông",
    legal_status: "Sổ đỏ",
    furniture_status: "Không nội thất",
    is_featured: true,
    features: ["Gần biển"],
    extra_images: [
      "https://picsum.photos/seed/vtdn15a/800/600",
    ],
  },

  // ---- MORE APARTMENTS / CONDOTELS ----
  {
    title: "Condotel Aria Vũng Tàu 1PN view biển tầng cao",
    price: 2_800_000_000,
    location: "Thùy Vân, Phường 2, Vũng Tàu",
    bedrooms: 1,
    bathrooms: 1,
    area: 55,
    image_url: "https://picsum.photos/seed/vtcd16/800/600",
    description:
      "Condotel Aria Vũng Tàu tầng 22, view trực diện biển Thùy Vân. Đơn vị quản lý vận hành chuyên nghiệp, cam kết lợi nhuận cho thuê hấp dẫn. Tiện ích 5 sao: hồ bơi tràn viền, nhà hàng buffet, sky lounge, spa, phòng hội nghị. Chủ sở hữu được nghỉ dưỡng miễn phí 15 đêm/năm. Đầu tư an toàn, thu nhập thụ động ổn định.",
    type: "Condotel",
    status: "Hot",
    address_detail: "Tầng 22, Aria Vũng Tàu, Thùy Vân",
    district: "Thành phố Vũng Tàu",
    ward: "Phường 2",
    latitude: 10.3440,
    longitude: 107.0862,
    year_built: 2023,
    floor_number: 22,
    total_floors: 28,
    parking_slots: 1,
    direction: "Đông",
    legal_status: "Sổ hồng",
    furniture_status: "Đầy đủ nội thất",
    is_featured: true,
    features: ["View biển", "Hồ bơi", "Phòng gym", "An ninh 24/7", "Thang máy"],
    extra_images: [
      "https://picsum.photos/seed/vtcd16a/800/600",
      "https://picsum.photos/seed/vtcd16b/800/600",
    ],
  },
  {
    title: "Căn hộ penthouse Bãi Sau 4PN duplex 180m2",
    price: 12_500_000_000,
    location: "Thùy Vân, Phường Thắng Tam, Vũng Tàu",
    bedrooms: 4,
    bathrooms: 3,
    area: 180,
    image_url: "https://picsum.photos/seed/vtph17/800/600",
    description:
      "Căn penthouse duplex tầng 24-25, view biển Bãi Sau 270 độ ngoạn mục. Thiết kế 2 tầng sang trọng: tầng dưới phòng khách đôi + bếp mở + 2 phòng ngủ, tầng trên master suite + phòng ngủ + sân thượng riêng 50m2. Nội thất cao cấp Italy, sàn đá marble, hệ thống đèn chandelier pha lê. Chỉ 4 căn penthouse duy nhất trong dự án.",
    type: "Căn hộ",
    status: "Nổi bật",
    address_detail: "Tầng 24-25, Block B, Bãi Sau Tower",
    district: "Thành phố Vũng Tàu",
    ward: "Phường Thắng Tam",
    latitude: 10.3455,
    longitude: 107.0880,
    year_built: 2022,
    floor_number: 24,
    total_floors: 25,
    parking_slots: 2,
    direction: "Đông Nam",
    legal_status: "Sổ hồng",
    furniture_status: "Đầy đủ nội thất",
    is_featured: true,
    features: [
      "View biển", "Sân thượng", "Bãi đậu xe", "Thang máy", "An ninh 24/7",
    ],
    extra_images: [
      "https://picsum.photos/seed/vtph17a/800/600",
      "https://picsum.photos/seed/vtph17b/800/600",
      "https://picsum.photos/seed/vtph17c/800/600",
    ],
  },

  // ---- SHOPHOUSE ----
  {
    title: "Shophouse mặt tiền biển Thùy Vân kinh doanh",
    price: 15_000_000_000,
    location: "Thùy Vân, Phường 2, Vũng Tàu",
    bedrooms: 2,
    bathrooms: 2,
    area: 120,
    image_url: "https://picsum.photos/seed/vtsh18/800/600",
    description:
      "Shophouse mặt tiền đường Thùy Vân - con đường du lịch đẹp nhất Vũng Tàu. Tầng trệt rộng 60m2 kinh doanh nhà hàng, quán café hoặc cửa hàng. 2 tầng trên để ở với 2 phòng ngủ. Vị trí đắc địa ngay bãi biển, lưu lượng khách du lịch quanh năm cực lớn. Doanh thu cho thuê ước tính 50-80 triệu/tháng.",
    type: "Shophouse",
    status: "Có sẵn",
    address_detail: "Mặt tiền Thùy Vân, Phường 2",
    district: "Thành phố Vũng Tàu",
    ward: "Phường 2",
    latitude: 10.3448,
    longitude: 107.0851,
    year_built: 2020,
    total_floors: 3,
    parking_slots: 0,
    direction: "Đông",
    legal_status: "Sổ hồng",
    furniture_status: "Cơ bản",
    is_featured: false,
    features: ["Gần biển", "View biển"],
    extra_images: [
      "https://picsum.photos/seed/vtsh18a/800/600",
      "https://picsum.photos/seed/vtsh18b/800/600",
    ],
  },

  // ---- RENTAL APARTMENTS ----
  {
    title: "Cho thuê căn hộ 2PN full nội thất Bãi Trước",
    price: 12_000_000,
    location: "Hạ Long, Phường 2, Vũng Tàu",
    bedrooms: 2,
    bathrooms: 1,
    area: 65,
    image_url: "https://picsum.photos/seed/vtct19/800/600",
    description:
      "Cho thuê căn hộ 2 phòng ngủ đầy đủ nội thất tại khu vực Bãi Trước. View biển cực đẹp từ ban công, đón gió biển mát mẻ. Nội thất mới, máy lạnh, máy giặt, bếp đầy đủ dụng cụ, wifi tốc độ cao. Tòa nhà có bảo vệ 24/7, hầm xe rộng rãi. Phù hợp chuyên gia nước ngoài, gia đình nhỏ hoặc cho thuê du lịch ngắn hạn.",
    type: "Căn hộ",
    status: "Có sẵn",
    address_detail: "38 Hạ Long, Phường 2",
    district: "Thành phố Vũng Tàu",
    ward: "Phường 2",
    latitude: 10.3488,
    longitude: 107.0735,
    year_built: 2019,
    floor_number: 6,
    total_floors: 15,
    parking_slots: 1,
    direction: "Tây Nam",
    legal_status: "Sổ hồng",
    furniture_status: "Đầy đủ nội thất",
    is_featured: false,
    features: ["View biển", "Điều hòa", "Nội thất đầy đủ", "An ninh 24/7", "Wifi miễn phí"],
    extra_images: [
      "https://picsum.photos/seed/vtct19a/800/600",
      "https://picsum.photos/seed/vtct19b/800/600",
    ],
  },

  // ---- ADDITIONAL HOUSE ----
  {
    title: "Nhà phố 5 tầng mặt tiền Bacu kinh doanh khách sạn",
    price: 35_000_000_000,
    location: "Bacu, Phường 1, Vũng Tàu",
    bedrooms: 8,
    bathrooms: 10,
    area: 400,
    image_url: "https://picsum.photos/seed/vtks20/800/600",
    description:
      "Nhà phố 5 tầng mặt tiền đường Bacu - khu phố Tây sầm uất nhất Vũng Tàu. Hiện đang kinh doanh khách sạn mini 8 phòng, doanh thu ổn định 80-120 triệu/tháng. Tầng trệt cho thuê kinh doanh quán ăn/bar. Tầng thượng có sân thượng rộng view biển Bãi Trước. Vị trí cực hiếm, phù hợp đầu tư kinh doanh hospitality.",
    type: "Nhà mặt tiền",
    status: "Nổi bật",
    address_detail: "12 Bacu, Phường 1",
    district: "Thành phố Vũng Tàu",
    ward: "Phường 1",
    latitude: 10.3505,
    longitude: 107.0725,
    year_built: 2017,
    total_floors: 5,
    parking_slots: 0,
    direction: "Đông Nam",
    legal_status: "Sổ hồng",
    furniture_status: "Đầy đủ nội thất",
    is_featured: true,
    features: ["Sân thượng", "View biển", "Gần biển", "An ninh 24/7"],
    extra_images: [
      "https://picsum.photos/seed/vtks20a/800/600",
      "https://picsum.photos/seed/vtks20b/800/600",
      "https://picsum.photos/seed/vtks20c/800/600",
    ],
  },
];

// ---------------------------------------------------------------------------
// Category slug lookup
// ---------------------------------------------------------------------------

function categorySlugForType(type: string): string {
  const map: Record<string, string> = {
    "Căn hộ": "can-ho",
    Villa: "villa",
    "Biệt thự": "biet-thu",
    "Nhà phố": "nha-pho",
    "Nhà mặt tiền": "nha-pho",
    "Đất nền": "dat-nen",
    "Đất thổ cư": "dat-nen",
    Shophouse: "shophouse",
    Condotel: "condotel",
    Studio: "studio",
  };
  return map[type] ?? "can-ho";
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("=== SEED PROPERTIES — VungTauLand ===\n");

  // Fetch category & feature maps
  const { data: cats } = await supabase.from("categories").select("id, slug");
  const catMap = new Map((cats ?? []).map((c) => [c.slug, c.id]));
  console.log(`Found ${catMap.size} categories`);

  const { data: feats } = await supabase.from("property_features").select("id, name");
  const featMap = new Map((feats ?? []).map((f) => [f.name, f.id]));
  console.log(`Found ${featMap.size} features\n`);

  let inserted = 0;
  let skipped = 0;

  for (const prop of properties) {
    // Check if property with same title already exists
    const { data: existing } = await supabase
      .from("properties")
      .select("id")
      .eq("title", prop.title)
      .maybeSingle();

    if (existing) {
      console.log(`  SKIP  ${prop.title} (already exists)`);
      skipped++;
      continue;
    }

    const { features, extra_images, ...row } = prop;
    const categoryId = catMap.get(categorySlugForType(prop.type));

    const insertPayload: Record<string, unknown> = {
      ...row,
      category_id: categoryId ?? null,
      published_at: new Date().toISOString(),
    };

    const { data: inserted_prop, error } = await supabase
      .from("properties")
      .insert(insertPayload)
      .select("id")
      .single();

    if (error) {
      console.log(`  FAIL  ${prop.title}: ${error.message}`);
      continue;
    }

    const propId = inserted_prop.id;

    // Insert primary image into property_images
    await supabase.from("property_images").insert({
      property_id: propId,
      image_url: prop.image_url,
      is_primary: true,
      display_order: 1,
    });

    // Insert extra images
    for (let i = 0; i < extra_images.length; i++) {
      await supabase.from("property_images").insert({
        property_id: propId,
        image_url: extra_images[i],
        is_primary: false,
        display_order: i + 2,
      });
    }

    // Insert feature mappings
    for (const fname of features) {
      const fid = featMap.get(fname);
      if (fid) {
        await supabase
          .from("property_feature_mapping")
          .insert({ property_id: propId, feature_id: fid });
      }
    }

    console.log(`  OK    ${prop.title} (${propId})`);
    inserted++;
  }

  // Summary
  console.log("\n--- SUMMARY ---");
  console.log(`  Inserted: ${inserted}`);
  console.log(`  Skipped:  ${skipped}`);
  console.log(`  Failed:   ${properties.length - inserted - skipped}`);

  const { count } = await supabase
    .from("properties")
    .select("*", { count: "exact", head: true });
  console.log(`  Total properties in DB: ${count}`);
  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
