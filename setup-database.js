import pg from 'pg'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const { Client } = pg

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function setupDatabase() {
  console.log('🚀 Starting Vungtauland Database Setup...\n')
  
  // Parse database URL
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    console.error('❌ DATABASE_URL not found in .env file')
    process.exit(1)
  }
  
  const client = new Client({
    connectionString: dbUrl,
    ssl: {
      rejectUnauthorized: false
    }
  })
  
  try {
    // Connect to database
    console.log('📡 Connecting to database...')
    await client.connect()
    console.log('✅ Connected successfully!\n')
    
    // Read SQL file
    console.log('📄 Reading SQL setup file...')
    const sqlFile = join(__dirname, 'database-setup.sql')
    const sql = readFileSync(sqlFile, 'utf8')
    console.log('✅ SQL file loaded\n')
    
    // Execute SQL
    console.log('⚡ Executing SQL commands...')
    await client.query(sql)
    console.log('✅ Database setup completed!\n')
    
    // Verify setup
    console.log('🔍 Verifying setup...')
    const result = await client.query('SELECT COUNT(*) as count FROM properties')
    const count = result.rows[0].count
    console.log(`✅ Found ${count} properties in database\n`)
    
    // Show sample data
    if (count > 0) {
      console.log('📊 Sample properties:')
      const sample = await client.query('SELECT title, type, status, price FROM properties LIMIT 3')
      sample.rows.forEach((row, index) => {
        const priceFormatted = (row.price / 1000000000).toFixed(1)
        console.log(`   ${index + 1}. ${row.title} - ${row.type} - ${row.status} - ${priceFormatted}B VNĐ`)
      })
    }
    
    console.log('\n🎉 Database setup completed successfully!')
    console.log('🌐 You can now access your app at http://localhost:8081\n')
    
  } catch (error) {
    console.error('\n❌ Error during setup:', error.message)
    if (error.detail) console.error('Details:', error.detail)
    process.exit(1)
  } finally {
    await client.end()
  }
}

// Run setup
setupDatabase()