// Fix admin policies using role column
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

    console.log(`   ✅ Success`);
    return { success: true };
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🔧 Fixing admin policies to use role column...\n');

  // 1. Drop existing admin policies
  await runSQL(`
    DROP POLICY IF EXISTS "Admins can view all conversations" ON public.conversations;
    DROP POLICY IF EXISTS "Admins can update any conversation" ON public.conversations;
    DROP POLICY IF EXISTS "Admins can view all chat messages" ON public.chat_messages;
  `, 'Drop existing admin policies');

  // 2. Create admin view policy for conversations using role
  await runSQL(`
    CREATE POLICY "Admins can view all conversations"
      ON public.conversations FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role = 'admin'
        )
      );
  `, 'Create admin view policy for conversations');

  // 3. Create admin update policy for conversations using role
  await runSQL(`
    CREATE POLICY "Admins can update any conversation"
      ON public.conversations FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role = 'admin'
        )
      );
  `, 'Create admin update policy for conversations');

  // 4. Create admin view policy for chat_messages using role
  await runSQL(`
    CREATE POLICY "Admins can view all chat messages"
      ON public.chat_messages FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role = 'admin'
        )
      );
  `, 'Create admin view policy for chat_messages');

  // 5. Update is_admin function to use role
  await runSQL(`
    CREATE OR REPLACE FUNCTION public.is_admin()
    RETURNS BOOLEAN AS $$
    BEGIN
      RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
      );
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `, 'Update is_admin function to use role column');

  console.log('\n✅ Admin policies fixed!');
}

main().catch(console.error);
