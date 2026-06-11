-- Migration: 003_seed_templates
-- Description: Insert seed template data

insert into public.designs (id, author_id, name, layer_state, design_metadata) values
(
  'template-instagram',
  '__system__',
  'Instagram Post',
  '{
    "layers": [
      {"id": "bg", "type": "rectangle", "name": "Background", "transform": {"x": 0, "y": 0, "width": 1080, "height": 1080, "rotation": 0, "scaleX": 1, "scaleY": 1}, "opacity": 1, "visible": true, "locked": false, "parentId": null, "children": [], "zIndex": 0, "blendMode": "normal", "props": {"fill": "#6c63ff"}},
      {"id": "title", "type": "text", "name": "Title", "transform": {"x": 60, "y": 400, "width": 960, "height": 80, "rotation": 0, "scaleX": 1, "scaleY": 1}, "opacity": 1, "visible": true, "locked": false, "parentId": null, "children": [], "zIndex": 1, "blendMode": "normal", "props": {"text": "Your Title Here", "fontSize": 48, "fontFamily": "Inter", "fill": "#ffffff"}},
      {"id": "subtitle", "type": "text", "name": "Subtitle", "transform": {"x": 60, "y": 500, "width": 960, "height": 40, "rotation": 0, "scaleX": 1, "scaleY": 1}, "opacity": 1, "visible": true, "locked": false, "parentId": null, "children": [], "zIndex": 2, "blendMode": "normal", "props": {"text": "Subtitle text", "fontSize": 24, "fontFamily": "Inter", "fill": "rgba(255,255,255,0.8)"}}
    ],
    "rootIds": ["bg", "title", "subtitle"]
  }'::jsonb,
  '{"width": 1080, "height": 1080, "category": "Social Media", "is_template": true}'::jsonb
),
(
  'template-presentation',
  '__system__',
  'Presentation 16:9',
  '{
    "layers": [
      {"id": "bg", "type": "rectangle", "name": "Background", "transform": {"x": 0, "y": 0, "width": 1920, "height": 1080, "rotation": 0, "scaleX": 1, "scaleY": 1}, "opacity": 1, "visible": true, "locked": false, "parentId": null, "children": [], "zIndex": 0, "blendMode": "normal", "props": {"fill": "#1a1a2e"}},
      {"id": "accent", "type": "rectangle", "name": "Accent bar", "transform": {"x": 0, "y": 0, "width": 20, "height": 1080, "rotation": 0, "scaleX": 1, "scaleY": 1}, "opacity": 1, "visible": true, "locked": false, "parentId": null, "children": [], "zIndex": 1, "blendMode": "normal", "props": {"fill": "#45eba5"}},
      {"id": "title", "type": "text", "name": "Title", "transform": {"x": 100, "y": 400, "width": 1600, "height": 100, "rotation": 0, "scaleX": 1, "scaleY": 1}, "opacity": 1, "visible": true, "locked": false, "parentId": null, "children": [], "zIndex": 2, "blendMode": "normal", "props": {"text": "Presentation Title", "fontSize": 64, "fontFamily": "Inter", "fill": "#ffffff"}},
      {"id": "desc", "type": "text", "name": "Description", "transform": {"x": 100, "y": 520, "width": 1600, "height": 40, "rotation": 0, "scaleX": 1, "scaleY": 1}, "opacity": 1, "visible": true, "locked": false, "parentId": null, "children": [], "zIndex": 3, "blendMode": "normal", "props": {"text": "Subtitle or description", "fontSize": 28, "fontFamily": "Inter", "fill": "rgba(255,255,255,0.7)"}}
    ],
    "rootIds": ["bg", "accent", "title", "desc"]
  }'::jsonb,
  '{"width": 1920, "height": 1080, "category": "Presentations", "is_template": true}'::jsonb
)
),
(
  'template-photobook',
  '__system__',
  'Photo Album',
  '{
    "layers": [
      {"id": "bg", "type": "rectangle", "name": "Background", "transform": {"x": 0, "y": 0, "width": 1920, "height": 1080, "rotation": 0, "scaleX": 1, "scaleY": 1}, "opacity": 1, "visible": true, "locked": false, "parentId": null, "children": [], "zIndex": 0, "blendMode": "normal", "props": {"fill": "#fce4ec"}},
      {"id": "photo1", "type": "rectangle", "name": "Photo 1", "transform": {"x": 80, "y": 160, "width": 520, "height": 640, "rotation": 0, "scaleX": 1, "scaleY": 1}, "opacity": 1, "visible": true, "locked": false, "parentId": null, "children": [], "zIndex": 1, "blendMode": "normal", "props": {"fill": "#e84393", "cornerRadius": 8}},
      {"id": "photo2", "type": "rectangle", "name": "Photo 2", "transform": {"x": 660, "y": 160, "width": 520, "height": 300, "rotation": 0, "scaleX": 1, "scaleY": 1}, "opacity": 1, "visible": true, "locked": false, "parentId": null, "children": [], "zIndex": 1, "blendMode": "normal", "props": {"fill": "#d63384", "cornerRadius": 8}},
      {"id": "photo3", "type": "rectangle", "name": "Photo 3", "transform": {"x": 660, "y": 500, "width": 520, "height": 300, "rotation": 0, "scaleX": 1, "scaleY": 1}, "opacity": 1, "visible": true, "locked": false, "parentId": null, "children": [], "zIndex": 1, "blendMode": "normal", "props": {"fill": "#c2185b", "cornerRadius": 8}},
      {"id": "title", "type": "text", "name": "Title", "transform": {"x": 1260, "y": 300, "width": 560, "height": 80, "rotation": 0, "scaleX": 1, "scaleY": 1}, "opacity": 1, "visible": true, "locked": false, "parentId": null, "children": [], "zIndex": 2, "blendMode": "normal", "props": {"text": "Our Story", "fontSize": 56, "fontFamily": "Inter", "fill": "#880e4f"}},
      {"id": "desc", "type": "text", "name": "Description", "transform": {"x": 1260, "y": 400, "width": 560, "height": 120, "rotation": 0, "scaleX": 1, "scaleY": 1}, "opacity": 1, "visible": true, "locked": false, "parentId": null, "children": [], "zIndex": 3, "blendMode": "normal", "props": {"text": "Add your favorite memories here", "fontSize": 22, "fontFamily": "Inter", "fill": "#ad1457"}}
    ],
    "rootIds": ["bg", "photo1", "photo2", "photo3", "title", "desc"]
  }'::jsonb,
  '{"width": 1920, "height": 1080, "category": "Photobooks", "is_template": true}'::jsonb
),
(
  'template-invitation',
  '__system__',
  'Wedding Invitation',
  '{
    "layers": [
      {"id": "bg", "type": "rectangle", "name": "Background", "transform": {"x": 0, "y": 0, "width": 1080, "height": 1920, "rotation": 0, "scaleX": 1, "scaleY": 1}, "opacity": 1, "visible": true, "locked": false, "parentId": null, "children": [], "zIndex": 0, "blendMode": "normal", "props": {"fill": "#fff8e1"}},
      {"id": "border", "type": "rectangle", "name": "Border", "transform": {"x": 30, "y": 30, "width": 1020, "height": 1860, "rotation": 0, "scaleX": 1, "scaleY": 1}, "opacity": 1, "visible": true, "locked": false, "parentId": null, "children": [], "zIndex": 1, "blendMode": "normal", "props": {"fill": "none", "stroke": "#fdcb6e", "strokeWidth": 4, "cornerRadius": 16}},
      {"id": "heading", "type": "text", "name": "Heading", "transform": {"x": 60, "y": 500, "width": 960, "height": 100, "rotation": 0, "scaleX": 1, "scaleY": 1}, "opacity": 1, "visible": true, "locked": false, "parentId": null, "children": [], "zIndex": 2, "blendMode": "normal", "props": {"text": "You're Invited!", "fontSize": 64, "fontFamily": "Inter", "fill": "#e17055", "textAlign": "center"}},
      {"id": "names", "type": "text", "name": "Names", "transform": {"x": 60, "y": 660, "width": 960, "height": 60, "rotation": 0, "scaleX": 1, "scaleY": 1}, "opacity": 1, "visible": true, "locked": false, "parentId": null, "children": [], "zIndex": 3, "blendMode": "normal", "props": {"text": "Sarah & Michael", "fontSize": 40, "fontFamily": "Inter", "fill": "#d63031", "textAlign": "center"}},
      {"id": "date", "type": "text", "name": "Date", "transform": {"x": 60, "y": 780, "width": 960, "height": 40, "rotation": 0, "scaleX": 1, "scaleY": 1}, "opacity": 1, "visible": true, "locked": false, "parentId": null, "children": [], "zIndex": 4, "blendMode": "normal", "props": {"text": "June 15, 2026 • 3:00 PM", "fontSize": 24, "fontFamily": "Inter", "fill": "#636e72", "textAlign": "center"}},
      {"id": "venue", "type": "text", "name": "Venue", "transform": {"x": 60, "y": 840, "width": 960, "height": 40, "rotation": 0, "scaleX": 1, "scaleY": 1}, "opacity": 1, "visible": true, "locked": false, "parentId": null, "children": [], "zIndex": 5, "blendMode": "normal", "props": {"text": "The Grand Ballroom", "fontSize": 20, "fontFamily": "Inter", "fill": "#636e72", "textAlign": "center"}}
    ],
    "rootIds": ["bg", "border", "heading", "names", "date", "venue"]
  }'::jsonb,
  '{"width": 1080, "height": 1920, "category": "Invitations", "is_template": true}'::jsonb
),
(
  'template-tribute',
  '__system__',
  'In Loving Memory',
  '{
    "layers": [
      {"id": "bg", "type": "rectangle", "name": "Background", "transform": {"x": 0, "y": 0, "width": 1080, "height": 1080, "rotation": 0, "scaleX": 1, "scaleY": 1}, "opacity": 1, "visible": true, "locked": false, "parentId": null, "children": [], "zIndex": 0, "blendMode": "normal", "props": {"fill": "#1a1a2e"}},
      {"id": "overlay", "type": "rectangle", "name": "Overlay", "transform": {"x": 0, "y": 0, "width": 1080, "height": 1080, "rotation": 0, "scaleX": 1, "scaleY": 1}, "opacity": 0.3, "visible": true, "locked": false, "parentId": null, "children": [], "zIndex": 1, "blendMode": "normal", "props": {"fill": "url(#vignette)"}},
      {"id": "photo", "type": "rectangle", "name": "Photo Frame", "transform": {"x": 340, "y": 180, "width": 400, "height": 400, "rotation": 0, "scaleX": 1, "scaleY": 1}, "opacity": 1, "visible": true, "locked": false, "parentId": null, "children": [], "zIndex": 2, "blendMode": "normal", "props": {"fill": "#a29bfe", "cornerRadius": 200}},
      {"id": "name", "type": "text", "name": "Name", "transform": {"x": 60, "y": 640, "width": 960, "height": 70, "rotation": 0, "scaleX": 1, "scaleY": 1}, "opacity": 1, "visible": true, "locked": false, "parentId": null, "children": [], "zIndex": 3, "blendMode": "normal", "props": {"text": "In Loving Memory", "fontSize": 48, "fontFamily": "Inter", "fill": "#ffffff", "textAlign": "center"}},
      {"id": "dates", "type": "text", "name": "Dates", "transform": {"x": 60, "y": 720, "width": 960, "height": 40, "rotation": 0, "scaleX": 1, "scaleY": 1}, "opacity": 1, "visible": true, "locked": false, "parentId": null, "children": [], "zIndex": 4, "blendMode": "normal", "props": {"text": "1948 - 2026", "fontSize": 24, "fontFamily": "Inter", "fill": "rgba(255,255,255,0.7)", "textAlign": "center"}},
      {"id": "verse", "type": "text", "name": "Verse", "transform": {"x": 120, "y": 800, "width": 840, "height": 80, "rotation": 0, "scaleX": 1, "scaleY": 1}, "opacity": 1, "visible": true, "locked": false, "parentId": null, "children": [], "zIndex": 5, "blendMode": "normal", "props": {"text": "\"Forever in our hearts\"", "fontSize": 18, "fontFamily": "Inter", "fill": "rgba(255,255,255,0.5)", "textAlign": "center", "fontStyle": "italic"}}
    ],
    "rootIds": ["bg", "overlay", "photo", "name", "dates", "verse"]
  }'::jsonb,
  '{"width": 1080, "height": 1080, "category": "Tributes", "is_template": true}'::jsonb
)
on conflict (id) do nothing;
