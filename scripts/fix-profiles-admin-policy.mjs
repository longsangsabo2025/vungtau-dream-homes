// Fix admin policies for profiles table
const SUPABASE_ACCESS_TOKEN = 'sbp_d9fd9f159ba3a08854384eedc801d9d3bc7d9c77';
const PROJECT_REF = 'rxjsdoylkflzsxlyccqh';

async function runSQL(sql, description) {
  console.log(`📌 ${description}...`);
  
  try {
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const data = await response.json();
    console.log(`   ✅ Success`);
    return { success: true, data };
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🔧 Fixing admin policies for profiles...\n');

  // 1. Check current admin policy
  const currentPolicy = await runSQL(`
    SELECT policyname, qual FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname LIKE '%Admin%';
  `, 'Check current admin policy');
  
  if (currentPolicy.data) {
    console.log('   Current policy:', currentPolicy.data);
  }

  // 2. Drop existing admin policy
  await runSQL(`
    DROP POLICY IF EXISTS "Admin can do anything with profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
  `, 'Drop existing admin policies');

  // 3. Create proper admin SELECT policy
  await runSQL(`
    CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (
      role = 'admin' OR
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
      )
    );
  `, 'Create admin SELECT policy');

  // 4. Create proper admin UPDATE policy  
  await runSQL(`
    CREATE POLICY "Admins can update all profiles"
    ON public.profiles FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
      )
    );
  `, 'Create admin UPDATE policy');

  // 5. Check admin user role
  const adminCheck = await runSQL(`
    SELECT id, full_name, email, role FROM public.profiles
    WHERE email LIKE '%admin%' OR role = 'admin';
  `, 'Check admin users');
  
  console.log('\n📋 Admin users found:');
  if (adminCheck.data) {
    adminCheck.data.forEach(u => {
      console.log(`   - ${u.email} | role: ${u.role}`);
    });
  }

  // 6. Update admin@vungtauland.store to have admin role
  await runSQL(`
    UPDATE public.profiles 
    SET role = 'admin' 
    WHERE email = 'admin@vungtauland.store';
  `, 'Set admin role for admin@vungtauland.store');

  // 7. Check all policies after fix
  const allPolicies = await runSQL(`
    SELECT policyname, cmd FROM pg_policies 
    WHERE tablename = 'profiles' AND schemaname = 'public';
  `, 'Verify all profiles policies');
  
  console.log('\n🔐 Final policies on profiles:');
  if (allPolicies.data) {
    allPolicies.data.forEach(p => {
      console.log(`   [${p.cmd}] ${p.policyname}`);
    });
  }

  console.log('\n✅ Done! Please refresh the admin page.');
}

main().catch(console.error);
