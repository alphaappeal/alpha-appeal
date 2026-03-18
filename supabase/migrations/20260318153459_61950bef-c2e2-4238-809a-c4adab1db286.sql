
-- Replace the limited view with a full-featured one that includes all map-rendering columns
DROP VIEW IF EXISTS public.active_upcoming_map_events;

CREATE VIEW public.active_upcoming_map_events
WITH (security_invoker = on)
AS
SELECT
  e.id,
  e.title,
  e.description,
  e.latitude,
  e.longitude,
  e.event_date,
  e.image_url,
  e.active,
  e.created_at,
  e.event_type,
  e.event_url,
  e.icon_svg,
  e.event_type_id,
  e.start_date,
  e.end_date,
  t.name  AS event_type_name,
  t.icon  AS event_icon,
  t.color AS event_color
FROM map_events e
LEFT JOIN event_types t ON e.event_type_id = t.id
WHERE e.active = true
  AND e.event_date IS NOT NULL
  AND e.event_date >= timezone('utc', now())
ORDER BY e.event_date;
