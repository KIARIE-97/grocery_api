-- 1. Insert 2 stores (linked to store owners: userId 2 and 7)
INSERT INTO store (id, store_name, location, is_verified, opening_time, closing_time, description, shop_image, status, userId)
VALUES
  (1, 'FreshMart', 'Westlands', true, '08:00', '20:00', 'Fresh groceries and more', 'https://wp-denverite.s3.amazonaws.com/wp-content/uploads/sites/4/2020/02/200225-LITTLE-SAIGON-SUPERMARKET-GROCERY-STORE-SOUTH-FEDERAL-BOULEVARD-WESTWOOD-FAR-EAST-CENTER-KEVINJBEATY-08.jpg', 'active', 2),
  (2, 'BudgetBasket', 'Parklands', true, '09:00', '21:00', 'Affordable groceries', 'https://culinahealth.com/wp-content/uploads/2023/10/pexels-pixabay-264636-scaled.jpg', 'active', 7);

-- 2. Insert 10 categories
INSERT INTO category (id, category_name, description, image)
VALUES
  (1, 'Fruits', 'Fresh fruits', 'https://picsum.photos/seed/fruits/100'),
  (2, 'Vegetables', 'Green and leafy', 'https://picsum.photos/seed/veggies/100'),
  (3, 'Dairy', 'Milk, cheese, and more', 'https://picsum.photos/seed/dairy/100'),
  (4, 'Bakery', 'Bread and pastries', 'https://picsum.photos/seed/bakery/100'),
  (5, 'Meat', 'Fresh meat', 'https://picsum.photos/seed/meat/100'),
  (6, 'Beverages', 'Drinks and juices', 'https://picsum.photos/seed/beverages/100'),
  (7, 'Snacks', 'Chips, biscuits, etc.', 'https://picsum.photos/seed/snacks/100'),
  (8, 'Frozen', 'Frozen foods', 'https://picsum.photos/seed/frozen/100'),
  (9, 'Canned', 'Canned goods', 'https://picsum.photos/seed/canned/100'),
  (10, 'Household', 'Household items', 'https://picsum.photos/seed/household/100');

-- 3. Insert 20 products (linked to stores)
INSERT INTO product (id, product_name, product_description, product_price, product_image, quantity, stock, size, is_available, storeId)
VALUES
  (1, 'Apple', 'Fresh red apples', 1.2, 'https://domf5oio6qrcr.cloudfront.net/medialibrary/11525/conversions/0a5ae820-7051-4495-bcca-61bf02897472-thumb.jpg', 100, 100, 'Medium', true, 1),
  (2, 'Banana', 'Sweet bananas', 0.8, 'https://siribelenatural.com/public/uploads/products/WhatsApp-Image-2022-03-14-at-12_73771647243379.webp', 120, 120, 'Large', true, 1),
  (3, 'Spinach', 'Organic spinach', 0.5, 'hhttps://metchosinfarm.ca/cdn/shop/files/Spinach.webp?v=1744747971', 80, 80, 'Bunch', true, 1),
  (4, 'Milk', 'Fresh cow milk', 1.5, 'https://cdnasd.countrydelight.in/cdproductimg/new-website/Cow%20milk-450ml%20-PDP%20-1.jpg_1686642693772.jpg', 60, 60, '1L', true, 1),
  (5, 'Bread', 'Whole wheat bread', 1.0, 'https://defencebakery.in/cdn/shop/files/Multi_Grain_Bread.jpg?v=1729155610', 50, 50, '500g', true, 1),
  (6, 'Chicken Breast', 'Boneless chicken', 4.5, 'https://northoakqualitymeat.com/wp-content/uploads/2023/01/chicken-breast-fillets-1.jpg', 40, 40, '500g', true, 2),
  (7, 'Orange Juice', 'Freshly squeezed', 2.0, 'https://summersnowjuice.com.au/cdn/shop/products/A08I1344.jpg?v=1681343636', 70, 70, '1L', true, 2),
  (8, 'Potato Chips', 'Crispy chips', 1.3, 'https://www.bbassets.com/media/uploads/p/l/40001740_13-bingo-potato-chips-cream-onion.jpg', 90, 90, '200g', true, 2),
  (9, 'Frozen Peas', 'Green peas', 1.8, 'https://www.jiomart.com/images/product/original/491551429/best-farms-frozen-green-peas-200-g-product-images-o491551429-p491551429-0-202203171005.jpg', 30, 30, '500g', true, 2),
  (10, 'Canned Beans', 'Baked beans', 1.1, 'https://allpurposeveggies.com/wp-content/uploads/2022/12/IMG_7148-ingredient-photo-canned-eden-adzuki-beans-red-bean-paste--1200x1200.jpg', 110, 110, '400g', true, 2),
  (11, 'Cheese', 'Cheddar cheese', 2.5, 'https://images.squarespace-cdn.com/content/v1/59a30ddff5e231745bbe02ac/1709915172769-E74BXQQWM3HCRBLQHBU0/A-JH-002%286%29.jpg?format=1000w', 45, 45, '250g', true, 1),
  (12, 'Tomato', 'Fresh tomatoes', 0.7, 'https://www.tablelandstotabletop.com.au/cdn/shop/products/20201007_174900_337fe95b-82d6-477f-99b0-11f82df9228c_1024x1024@2x.jpg?v=1628473139', 95, 95, 'Kg', true, 1),
  (13, 'Butter', 'Salted butter', 1.9, 'https://www.realsimple.com/thmb/VvdPHiBwtcQgPl8MiRbOjSjNo4g=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/freeze-butter-GettyImages-466938239-b386cf1b961642089337ab851e40a87e.jpg', 55, 55, '250g', true, 2),
  (14, 'Eggs', 'Farm eggs', 2.2, 'https://www.jesmondfruitbarn.com.au/wp-content/uploads/2017/06/Jesmond-Fruit-Barn-Styled-Eggs-Free-Range-1.jpg', 80, 80, 'Dozen', true, 2),
  (15, 'Yogurt', 'Strawberry yogurt', 1.6, 'https://nada.com.sa/wp-content/uploads/2024/12/4-Nada-Greek-Yogurt-Strawberry-Low-Fat-160gm-EN-1.jpg', 65, 65, '500ml', true, 2),
  (16, 'Carrots', 'Crunchy carrots', 0.9, 'https://theseedcompany.ca/cdn/shop/files/crop_CARR1923_Carrot___Sweetness_Pelleted_Long.png?v=1720113309&width=1024', 85, 85, 'Kg', true, 1),
  (17, 'Soda', 'Cola drink', 1.0, 'https://www.mashed.com/img/gallery/what-gives-coca-cola-its-signature-color/intro-1691345985.jpg', 100, 100, '500ml', true, 2),
  (18, 'Biscuits', 'Chocolate biscuits', 1.4, 'https://images.ctfassets.net/qifm0zg3y057/0ptXmSoCkp00rPtZUpxOi/de2376ef7b384a37e73c2dfb778e1cf2/Website_-_product_carousel_tiles_-_2025-05-23T102943.457.png?fm=webp&q=80', 75, 75, '200g', true, 2),
  (19, 'Frozen Pizza', 'Cheese pizza', 3.5, 'https://www.oldenburger-professional.com/media/c5/dd/66/1669910692/OLB_Recipe-Pics_Watermark_970x480px_LY01_72dpi_Cheese_Pizza.jpg', 25, 25, '400g', true, 2),
  (20, 'Detergent', 'Laundry detergent', 2.8, 'https://media-v4.edamama.ph/products/1.png_1738314986034.jpeg', 60, 60, '1L', true, 2);

-- 4. Link products to categories (item_category join table)
INSERT INTO item_category (productId, categoryId) VALUES
  (1, 1), (1, 2),
  (2, 1),
  (3, 2),
  (4, 3),
  (5, 4),
  (6, 5),
  (7, 6),
  (8, 7),
  (9, 8),
  (10, 9),
  (11, 3),
  (12, 2),
  (13, 3),
  (14, 3),
  (15, 3),
  (16, 2),
  (17, 6),
  (18, 7),
  (19, 8),
  (20, 10);

-- 5. Insert 2 drivers (linked to user ids 3 and 4)
INSERT INTO driver (id, vehicle_info, is_available, current_location, total_earnings, userId)
VALUES
  (1, 'Toyota Prius', true, 'Nairobi', 0, 3),
  (2, 'Honda Fit', true, 'Ruiru', 0, 4);

 -- Insert locations for a store (ownerId 2) and a driver (ownerId 3)
INSERT INTO location (
  ownerId, ownerType, label, addressLine1, city, state, postalCode, country,
  latitude, longitude, isDefault
) VALUES
  ('7', 'store_owner', 'Main Branch', '12 Market Rd', 'Kirinyaga', 'Kirinyaga County', '10300', 'Kenya', -0.4986, 37.2803, true),
  ('7', 'store_owner', 'Nairobi Outlet', '45 Moi Ave', 'Nairobi', 'Nairobi County', '00100', 'Kenya', -1.2921, 36.8219, false),
  ('3', 'driver', 'Home', '88 Riverside Dr', 'Nairobi', 'Nairobi County', '00100', 'Kenya', -1.2833, 36.8167, true),
  ('3', 'driver', 'Kirinyaga Residence', '7 Hilltop', 'Kirinyaga', 'Kirinyaga County', '10300', 'Kenya', -0.4986, 37.2803, false);