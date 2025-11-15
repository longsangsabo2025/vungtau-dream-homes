import psycopg2
from psycopg2 import sql

# Connection parameters từ Supabase
conn_params = {
    'user': 'postgres.rxjsdoylkflzsxlyccqh',
    'password': 'Acookingoil123',
    'host': 'aws-0-ap-southeast-1.pooler.supabase.com',
    'port': '5432',
    'dbname': 'postgres',
    'sslmode': 'require'
}

def setup_admin_policies():
    print('🔐 Đang cập nhật RLS policies cho admin...\n')
    
    try:
        # Connect to database
        print('⏳ Đang kết nối database...')
        conn = psycopg2.connect(**conn_params)
        conn.autocommit = True
        cur = conn.cursor()
        print('✅ Kết nối thành công!\n')
        
        # Step 1: Drop old policies
        print('1️⃣ Xóa policies cũ...')
        cur.execute('DROP POLICY IF EXISTS "Allow authenticated insert" ON properties')
        cur.execute('DROP POLICY IF EXISTS "Allow authenticated update" ON properties')
        cur.execute('DROP POLICY IF EXISTS "Allow authenticated delete" ON properties')
        print('✅ Đã xóa policies cũ\n')
        
        # Step 2: Create is_admin function
        print('2️⃣ Tạo function is_admin()...')
        function_sql = """
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT 
      (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
      (auth.jwt() ->> 'email') = 'admin@vungtauland.store'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
        """
        cur.execute(function_sql)
        print('✅ Function created\n')
        
        # Step 3: Create new policies
        print('3️⃣ Tạo admin policies mới...')
        
        # INSERT policy
        cur.execute("""
CREATE POLICY "Admin can insert properties" ON properties
  FOR INSERT 
  WITH CHECK (is_admin());
        """)
        print('  ✓ INSERT policy')
        
        # UPDATE policy
        cur.execute("""
CREATE POLICY "Admin can update properties" ON properties
  FOR UPDATE 
  USING (is_admin());
        """)
        print('  ✓ UPDATE policy')
        
        # DELETE policy
        cur.execute("""
CREATE POLICY "Admin can delete properties" ON properties
  FOR DELETE 
  USING (is_admin());
        """)
        print('  ✓ DELETE policy')
        
        # Step 4: Verify policies
        print('\n4️⃣ Kiểm tra policies...')
        cur.execute("""
            SELECT schemaname, tablename, policyname, cmd
            FROM pg_policies 
            WHERE tablename = 'properties'
            ORDER BY policyname;
        """)
        
        policies = cur.fetchall()
        print(f'\n📋 Policies hiện tại ({len(policies)} policies):')
        for policy in policies:
            print(f'  - {policy[2]} ({policy[3]})')
        
        print('\n✅ Hoàn tất cập nhật RLS policies!')
        print('\n🔐 Phân quyền:')
        print('  - SELECT: Public (tất cả mọi người)')
        print('  - INSERT: Chỉ admin')
        print('  - UPDATE: Chỉ admin')
        print('  - DELETE: Chỉ admin')
        print('\n🎉 Backend đã sẵn sàng cho admin!')
        
        # Close connection
        cur.close()
        conn.close()
        
    except psycopg2.OperationalError as e:
        print(f'\n❌ Lỗi kết nối: {e}')
        print('\n💡 Kiểm tra lại:')
        print('  - Host: aws-1-ap-southeast-1.pooler.supabase.com')
        print('  - Port: 6543')
        print('  - User: postgres.rxjsdoylkflzsxlyccqh')
        print('  - Password: Acookingoil123')
    except psycopg2.Error as e:
        print(f'\n❌ Lỗi SQL: {e}')
    except Exception as e:
        print(f'\n❌ Lỗi: {e}')

if __name__ == '__main__':
    setup_admin_policies()
