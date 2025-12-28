/**
 * Add policies for property_images table
 */

const PROJECT_REF = 'rxjsdoylkflzsxlyccqh';
const ACCESS_TOKEN = 'sbp_d9fd9f159ba3a08854384eedc801d9d3bc7d9c77';

async function runSQL(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });
  return res.json();
}

async function addPolicies() {
  console.log('🔧 Adding policies for property_images...\n');
  
  // Policy cho owner insert images
  const insertPolicy = await runSQL(`
    CREATE POLICY "Owner can insert property images" 
    ON property_images FOR INSERT 
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM properties 
        WHERE properties.id = property_id 
        AND properties.owner_id = auth.uid()
      )
    )
  `);
  console.log('Insert policy:', insertPolicy.error || '✅ OK');
  
  // Policy cho owner update images  
  const updatePolicy = await runSQL(`
    CREATE POLICY "Owner can update property images" 
    ON property_images FOR UPDATE 
    USING (
      EXISTS (
        SELECT 1 FROM properties 
        WHERE properties.id = property_id 
        AND properties.owner_id = auth.uid()
      )
    )
  `);
  console.log('Update policy:', updatePolicy.error || '✅ OK');
  
  // Policy cho owner delete images
  const deletePolicy = await runSQL(`
    CREATE POLICY "Owner can delete property images" 
    ON property_images FOR DELETE 
    USING (
      EXISTS (
        SELECT 1 FROM properties 
        WHERE properties.id = property_id 
        AND properties.owner_id = auth.uid()
      )
    )
  `);
  console.log('Delete policy:', deletePolicy.error || '✅ OK');
  
  // Verify
  console.log('\n📋 Verifying policies...');
  const verify = await runSQL(`
    SELECT policyname, cmd FROM pg_policies 
    WHERE tablename = 'property_images'
  `);
  console.log('Policies:', verify);
}

addPolicies().catch(console.error);
