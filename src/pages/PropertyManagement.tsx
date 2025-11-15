import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  ArrowLeft,
  Eye
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";

interface Property {
  id: string;
  title: string;
  type: string;
  price: number;
  location: string;
  status: string;
  created_at: string;
}

const PropertyManagement = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    fetchProperties();
  }, [isAdmin, navigate]);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast.error("Không thể tải danh sách bất động sản");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bất động sản này?")) return;

    try {
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast.success("Đã xóa bất động sản thành công");
      fetchProperties();
    } catch (error) {
      console.error("Error deleting property:", error);
      toast.error("Không thể xóa bất động sản");
    }
  };

  const filteredProperties = properties.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " VNĐ";
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Quản lý Bất Động Sản
                </h1>
                <p className="text-gray-600 mt-1">
                  Tổng cộng {filteredProperties.length} bất động sản
                </p>
              </div>
            </div>
            <Link to="/admin/properties/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Thêm BĐS mới
              </Button>
            </Link>
          </div>

          {/* Search & Filter */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm theo tiêu đề hoặc địa điểm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Properties Table */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách bất động sản</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Đang tải...</div>
              ) : filteredProperties.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Không tìm thấy bất động sản nào
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tiêu đề</TableHead>
                        <TableHead>Loại</TableHead>
                        <TableHead>Giá</TableHead>
                        <TableHead>Địa điểm</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Ngày tạo</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProperties.map((property) => (
                        <TableRow key={property.id}>
                          <TableCell className="font-medium max-w-xs truncate">
                            {property.title}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{property.type}</Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {formatPrice(property.price)}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {property.location}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={property.status === "Có sẵn" ? "default" : "secondary"}
                            >
                              {property.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {formatDate(property.created_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Link to={`/property/${property.id}`} target="_blank">
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link to={`/admin/properties/edit/${property.id}`}>
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDelete(property.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PropertyManagement;
