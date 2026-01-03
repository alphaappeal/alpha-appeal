-- Create personal_diary_entries table for user's private diary
CREATE TABLE public.personal_diary_entries (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  strain_name TEXT,
  experience_notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.personal_diary_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policy - Users can only manage their own entries
CREATE POLICY "Users can manage own diary entries" 
ON public.personal_diary_entries
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_personal_diary_entries_updated_at
BEFORE UPDATE ON public.personal_diary_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create support_requests table for help & support form
CREATE TABLE public.support_requests (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policy - Users can view their own requests, anyone can create
CREATE POLICY "Anyone can create support requests" 
ON public.support_requests
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view own support requests" 
ON public.support_requests
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all support requests" 
ON public.support_requests
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));