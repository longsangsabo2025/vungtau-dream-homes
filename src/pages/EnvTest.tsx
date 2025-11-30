import { useEffect } from 'react'

export default function EnvTest() {
  useEffect(() => {
    console.log('=== ENVIRONMENT VARIABLES TEST ===')
    console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL)
    console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'EXISTS' : 'MISSING')
    console.log('All env vars:', import.meta.env)
    console.log('=================================')
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Test</h1>
      <div className="space-y-2">
        <p><strong>VITE_SUPABASE_URL:</strong> {import.meta.env.VITE_SUPABASE_URL || '❌ MISSING'}</p>
        <p><strong>VITE_SUPABASE_ANON_KEY:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ EXISTS' : '❌ MISSING'}</p>
        <p><strong>MODE:</strong> {import.meta.env.MODE}</p>
        <p><strong>DEV:</strong> {import.meta.env.DEV ? 'true' : 'false'}</p>
      </div>
      <div className="mt-4">
        <button 
          onClick={() => console.log('All env:', import.meta.env)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Log All Env to Console
        </button>
      </div>
    </div>
  )
}
