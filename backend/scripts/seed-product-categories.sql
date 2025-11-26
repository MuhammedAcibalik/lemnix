-- Seed Product Categories
-- Populates the database with initial product categories

INSERT INTO product_categories (id, name, description, "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid()::text, 'Snap/Poster Frames', 'Product category for Snap/Poster Frames', NOW(), NOW()),
  (gen_random_uuid()::text, 'Illuminated Products', 'Product category for Illuminated Products', NOW(), NOW()),
  (gen_random_uuid()::text, 'Pavement Signs', 'Product category for Pavement Signs', NOW(), NOW()),
  (gen_random_uuid()::text, 'Printable Solutions', 'Product category for Printable Solutions', NOW(), NOW()),
  (gen_random_uuid()::text, 'Wood Displays', 'Product category for Wood Displays', NOW(), NOW()),
  (gen_random_uuid()::text, 'Exhibition Displays', 'Product category for Exhibition Displays', NOW(), NOW()),
  (gen_random_uuid()::text, 'Counter Displays', 'Product category for Counter Displays', NOW(), NOW()),
  (gen_random_uuid()::text, 'Banners', 'Product category for Banners', NOW(), NOW()),
  (gen_random_uuid()::text, 'Poster Holders', 'Product category for Poster Holders', NOW(), NOW()),
  (gen_random_uuid()::text, 'Real Estate Sign', 'Product category for Real Estate Sign', NOW(), NOW()),
  (gen_random_uuid()::text, 'Menuboards', 'Product category for Menuboards', NOW(), NOW()),
  (gen_random_uuid()::text, 'Noticeboards', 'Product category for Noticeboards', NOW(), NOW()),
  (gen_random_uuid()::text, 'Frameboards', 'Product category for Frameboards', NOW(), NOW()),
  (gen_random_uuid()::text, 'Showboards', 'Product category for Showboards', NOW(), NOW()),
  (gen_random_uuid()::text, 'Info Stands', 'Product category for Info Stands', NOW(), NOW()),
  (gen_random_uuid()::text, 'Presentation Systems', 'Product category for Presentation Systems', NOW(), NOW()),
  (gen_random_uuid()::text, 'Leaflet Dispensers', 'Product category for Leaflet Dispensers', NOW(), NOW()),
  (gen_random_uuid()::text, 'Brochure Sets', 'Product category for Brochure Sets', NOW(), NOW()),
  (gen_random_uuid()::text, 'Que Control System', 'Product category for Que Control System', NOW(), NOW()),
  (gen_random_uuid()::text, 'Personal Protection Equipment', 'Product category for Personal Protection Equipment', NOW(), NOW()),
  (gen_random_uuid()::text, 'Slide-in Frames', 'Product category for Slide-in Frames', NOW(), NOW()),
  (gen_random_uuid()::text, 'Door Signs', 'Product category for Door Signs', NOW(), NOW()),
  (gen_random_uuid()::text, 'Office Facilities', 'Product category for Office Facilities', NOW(), NOW()),
  (gen_random_uuid()::text, 'Digital Solutions', 'Product category for Digital Solutions', NOW(), NOW()),
  (gen_random_uuid()::text, 'Outdoor Displays', 'Product category for Outdoor Displays', NOW(), NOW()),
  (gen_random_uuid()::text, 'Accessories', 'Product category for Accessories', NOW(), NOW()),
  (gen_random_uuid()::text, 'Semi Products', 'Product category for Semi Products', NOW(), NOW()),
  (gen_random_uuid()::text, 'LED Module', 'Product category for LED Module', NOW(), NOW()),
  (gen_random_uuid()::text, 'Plastic Extrusion Sheets', 'Product category for Plastic Extrusion Sheets', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

