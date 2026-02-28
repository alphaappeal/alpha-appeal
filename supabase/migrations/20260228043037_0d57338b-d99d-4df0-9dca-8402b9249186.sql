
-- Phase 1: Stock decrement trigger on order_items insert
CREATE OR REPLACE FUNCTION public.decrement_stock_on_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $$
BEGIN
  UPDATE public.products
  SET stock_quantity = GREATEST(stock_quantity - NEW.quantity, 0),
      in_stock = CASE WHEN (stock_quantity - NEW.quantity) > 0 THEN true ELSE false END
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_decrement_stock ON public.order_items;
CREATE TRIGGER trg_decrement_stock
  AFTER INSERT ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_stock_on_order();

-- Phase 3: Add event_type and event_url columns to map_events for special event pins
ALTER TABLE public.map_events ADD COLUMN IF NOT EXISTS event_type text DEFAULT 'standard';
ALTER TABLE public.map_events ADD COLUMN IF NOT EXISTS event_url text;
ALTER TABLE public.map_events ADD COLUMN IF NOT EXISTS icon_svg text;

-- Admin-only insert/update/delete for map_events
DROP POLICY IF EXISTS "Admins can manage events" ON public.map_events;
CREATE POLICY "Admins can manage events"
  ON public.map_events
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
