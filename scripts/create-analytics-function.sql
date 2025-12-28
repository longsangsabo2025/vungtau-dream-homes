-- Create analytics table if not exists
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT NOT NULL,
    properties JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at);

-- Create the track_analytics_event function
CREATE OR REPLACE FUNCTION public.track_analytics_event(
    p_product_name TEXT,
    p_event_type TEXT,
    p_event_name TEXT,
    p_user_id UUID DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL,
    p_properties JSONB DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.analytics_events (
        product_name,
        event_type,
        event_name,
        user_id,
        session_id,
        properties
    ) VALUES (
        p_product_name,
        p_event_type,
        p_event_name,
        p_user_id,
        COALESCE(p_session_id, gen_random_uuid()::text),
        COALESCE(p_properties, '{}')
    );
END;
$$;

-- Enable RLS on the table
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policies for the analytics table
CREATE POLICY "Allow anonymous insert on analytics_events" ON public.analytics_events
    FOR INSERT 
    WITH CHECK (true);

-- Allow users to read their own analytics
CREATE POLICY "Allow users to read own analytics" ON public.analytics_events
    FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT, SELECT ON public.analytics_events TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.track_analytics_event TO anon, authenticated;