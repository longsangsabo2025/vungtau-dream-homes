import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { CheckCircle, XCircle, Database, RefreshCw } from 'lucide-react'

const SupabaseTestComponent = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [propertiesCount, setPropertiesCount] = useState(0)
  const [sampleData, setSampleData] = useState<Array<{
    id: string
    title: string
    price: number
    type: string
    status: string
  }>>([])

  const testConnection = async () => {
    setStatus('loading')
    setMessage('Testing Supabase connection...')
    
    try {
      // Test 1: Basic connection
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .limit(1)
      
      if (error) {
        setStatus('error')
        setMessage(`Connection failed: ${error.message}`)
        return
      }
      
      // Test 2: Count records
      const { count } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
      
      setPropertiesCount(count || 0)
      
      // Test 3: Get sample data
      const { data: properties } = await supabase
        .from('properties')
        .select('id, title, price, type, status')
        .limit(3)
      
      setSampleData(properties || [])
      setStatus('success')
      setMessage('✅ Supabase connection successful!')
      
    } catch (error) {
      setStatus('error')
      setMessage(`Unexpected error: ${error}`)
    }
  }
  
  useEffect(() => {
    testConnection()
  }, [])
  
  const formatPrice = (price: number) => {
    if (price >= 1000000000) {
      return `${(price / 1000000000).toFixed(1)}B VNĐ`
    }
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(0)}M VNĐ`
    }
    return `${price.toLocaleString()} VNĐ`
  }
  
  return (
    <Card className="w-full max-w-2xl mx-auto mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Supabase Connection Test
        </CardTitle>
        <CardDescription>
          Testing connection to Vungtauland database
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center gap-2">
            {status === 'loading' && <RefreshCw className="h-4 w-4 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
            {status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
            <span className={status === 'error' ? 'text-red-500' : 'text-foreground'}>
              {message}
            </span>
          </div>
          
          {/* Stats */}
          {status === 'success' && (
            <>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  📊 {propertiesCount} properties found
                </Badge>
              </div>
              
              {/* Sample Data */}
              {sampleData.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Sample Properties:</h4>
                  {sampleData.map((property, index) => (
                    <div key={property.id} className="p-2 border rounded-md text-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-medium">{index + 1}. {property.title}</span>
                          <div className="text-muted-foreground">
                            {property.type} • {property.status}
                          </div>
                        </div>
                        <Badge variant="outline">
                          {formatPrice(property.price)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          
          {/* Retry Button */}
          <Button 
            onClick={testConnection} 
            variant="outline" 
            size="sm"
            className="w-full"
            disabled={status === 'loading'}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${status === 'loading' ? 'animate-spin' : ''}`} />
            Test Again
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default SupabaseTestComponent