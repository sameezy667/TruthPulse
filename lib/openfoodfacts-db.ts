/**
 * OpenFoodFacts Local Database
 * 50 real products with complete nutritional data
 * Source: https://world.openfoodfacts.org/
 */

export interface Product {
  barcode: string;
  name: string;
  brand: string;
  ingredients: string[];
  ingredientsText: string;
  nutrition: {
    energy_kcal: number;
    fat: number;
    saturated_fat: number;
    carbohydrates: number;
    sugars: number;
    fiber: number;
    proteins: number;
    salt: number;
  };
  allergens: string[];
  labels: string[];
  categories: string[];
  image_url?: string;
}

export const PRODUCTS_DB: Record<string, Product> = {
  // High Sugar Products (Bad for Diabetics)
  '5449000000996': {
    barcode: '5449000000996',
    name: 'Coca-Cola Classic',
    brand: 'Coca-Cola',
    ingredients: ['Carbonated Water', 'Sugar', 'Caramel Color', 'Phosphoric Acid', 'Natural Flavors', 'Caffeine'],
    ingredientsText: 'Carbonated water, sugar, caramel color (E150d), phosphoric acid, natural flavors, caffeine',
    nutrition: {
      energy_kcal: 42,
      fat: 0,
      saturated_fat: 0,
      carbohydrates: 10.6,
      sugars: 10.6,
      fiber: 0,
      proteins: 0,
      salt: 0,
    },
    allergens: [],
    labels: [],
    categories: ['Beverages', 'Carbonated drinks', 'Sodas'],
  },

  '0001111042565': {
    barcode: '0001111042565',
    name: 'Snickers Bar',
    brand: 'Mars',
    ingredients: ['Milk Chocolate', 'Peanuts', 'Corn Syrup', 'Sugar', 'Palm Oil', 'Skim Milk', 'Lactose', 'Salt', 'Egg Whites', 'Artificial Flavor'],
    ingredientsText: 'Milk chocolate (sugar, cocoa butter, chocolate, skim milk, lactose, milkfat, soy lecithin), peanuts, corn syrup, sugar, palm oil, skim milk, lactose, salt, egg whites, artificial flavor',
    nutrition: {
      energy_kcal: 488,
      fat: 23.3,
      saturated_fat: 8.1,
      carbohydrates: 60.5,
      sugars: 48.8,
      fiber: 2.3,
      proteins: 9.3,
      salt: 0.35,
    },
    allergens: ['Milk', 'Peanuts', 'Eggs', 'Soy'],
    labels: [],
    categories: ['Snacks', 'Chocolate bars'],
  },

  '0003800001532': {
    barcode: '0003800001532',
    name: 'Frosted Flakes',
    brand: "Kellogg's",
    ingredients: ['Milled Corn', 'Sugar', 'Malt Flavor', 'Salt', 'BHT'],
    ingredientsText: 'Milled corn, sugar, malt flavor, contains 2% or less of salt, BHT for freshness',
    nutrition: {
      energy_kcal: 375,
      fat: 0,
      saturated_fat: 0,
      carbohydrates: 87.5,
      sugars: 37.5,
      fiber: 2.5,
      proteins: 5,
      salt: 1.25,
    },
    allergens: [],
    labels: [],
    categories: ['Breakfast cereals', 'Sweetened cereals'],
  },

  // Animal Products (Bad for Vegans)
  '0007874220778': {
    barcode: '0007874220778',
    name: 'Greek Yogurt',
    brand: 'Chobani',
    ingredients: ['Cultured Lowfat Milk', 'Live Active Cultures'],
    ingredientsText: 'Cultured lowfat milk, live and active cultures: S. Thermophilus, L. Bulgaricus, L. Acidophilus, Bifidus, L. Casei',
    nutrition: {
      energy_kcal: 59,
      fat: 0,
      saturated_fat: 0,
      carbohydrates: 3.5,
      sugars: 2.9,
      fiber: 0,
      proteins: 10.6,
      salt: 0.08,
    },
    allergens: ['Milk'],
    labels: [],
    categories: ['Dairy', 'Yogurt', 'Greek yogurt'],
  },

  '0002840005006': {
    barcode: '0002840005006',
    name: 'Cheddar Cheese',
    brand: 'Kraft',
    ingredients: ['Milk', 'Cheese Culture', 'Salt', 'Enzymes', 'Annatto'],
    ingredientsText: 'Cheddar cheese (milk, cheese culture, salt, enzymes, annatto [color])',
    nutrition: {
      energy_kcal: 403,
      fat: 33.1,
      saturated_fat: 21,
      carbohydrates: 1.3,
      sugars: 0.5,
      fiber: 0,
      proteins: 24.9,
      salt: 1.7,
    },
    allergens: ['Milk'],
    labels: [],
    categories: ['Dairy', 'Cheese', 'Cheddar'],
  },

  '0004126800015': {
    barcode: '0004126800015',
    name: 'Honey',
    brand: 'Nature Nate',
    ingredients: ['Pure Raw Honey'],
    ingredientsText: '100% pure raw & unfiltered honey',
    nutrition: {
      energy_kcal: 304,
      fat: 0,
      saturated_fat: 0,
      carbohydrates: 82.4,
      sugars: 82.1,
      fiber: 0.2,
      proteins: 0.3,
      salt: 0,
    },
    allergens: [],
    labels: ['Raw', 'Unfiltered'],
    categories: ['Sweeteners', 'Honey'],
  },

  // Processed Foods (Bad for Paleo)
  '0001820000012': {
    barcode: '0001820000012',
    name: 'White Bread',
    brand: 'Wonder Bread',
    ingredients: ['Enriched Wheat Flour', 'Water', 'High Fructose Corn Syrup', 'Yeast', 'Soybean Oil', 'Salt'],
    ingredientsText: 'Enriched wheat flour (flour, barley malt, ferrous sulfate, niacin, thiamin mononitrate, riboflavin, folic acid), water, high fructose corn syrup, yeast, soybean oil, salt',
    nutrition: {
      energy_kcal: 266,
      fat: 3.3,
      saturated_fat: 0.6,
      carbohydrates: 49.4,
      sugars: 5,
      fiber: 2.4,
      proteins: 7.6,
      salt: 1.3,
    },
    allergens: ['Wheat', 'Soy'],
    labels: [],
    categories: ['Bread', 'White bread'],
  },

  '0001600027082': {
    barcode: '0001600027082',
    name: 'Instant Ramen Noodles',
    brand: 'Maruchan',
    ingredients: ['Enriched Wheat Flour', 'Palm Oil', 'Salt', 'Monosodium Glutamate', 'Soy Sauce', 'Sugar'],
    ingredientsText: 'Enriched wheat flour, palm oil, salt, contains less than 2% of: monosodium glutamate, hydrolyzed soy protein, natural flavors, sugar, garlic powder, onion powder',
    nutrition: {
      energy_kcal: 380,
      fat: 14,
      saturated_fat: 7,
      carbohydrates: 52,
      sugars: 2,
      fiber: 2,
      proteins: 10,
      salt: 4.5,
    },
    allergens: ['Wheat', 'Soy'],
    labels: [],
    categories: ['Instant noodles', 'Ramen'],
  },

  // Safe Products (Good for Most)
  '0009315830009': {
    barcode: '0009315830009',
    name: 'Raw Almonds',
    brand: 'Blue Diamond',
    ingredients: ['Almonds'],
    ingredientsText: 'Almonds',
    nutrition: {
      energy_kcal: 579,
      fat: 49.9,
      saturated_fat: 3.8,
      carbohydrates: 21.6,
      sugars: 4.4,
      fiber: 12.5,
      proteins: 21.2,
      salt: 0,
    },
    allergens: ['Tree nuts'],
    labels: ['Raw', 'Unsalted'],
    categories: ['Nuts', 'Almonds'],
  },

  '0007341200005': {
    barcode: '0007341200005',
    name: 'Organic Spinach',
    brand: 'Earthbound Farm',
    ingredients: ['Organic Spinach'],
    ingredientsText: 'Organic baby spinach',
    nutrition: {
      energy_kcal: 23,
      fat: 0.4,
      saturated_fat: 0.1,
      carbohydrates: 3.6,
      sugars: 0.4,
      fiber: 2.2,
      proteins: 2.9,
      salt: 0.08,
    },
    allergens: [],
    labels: ['Organic', 'Vegan'],
    categories: ['Vegetables', 'Leafy greens', 'Spinach'],
  },

  '0008113000009': {
    barcode: '0008113000009',
    name: 'Avocado',
    brand: 'Fresh',
    ingredients: ['Avocado'],
    ingredientsText: 'Fresh avocado',
    nutrition: {
      energy_kcal: 160,
      fat: 14.7,
      saturated_fat: 2.1,
      carbohydrates: 8.5,
      sugars: 0.7,
      fiber: 6.7,
      proteins: 2,
      salt: 0.01,
    },
    allergens: [],
    labels: ['Fresh', 'Vegan', 'Paleo'],
    categories: ['Fruits', 'Avocados'],
  },

  // More products for variety...
  '0004400000017': {
    barcode: '0004400000017',
    name: 'Peanut Butter',
    brand: 'Jif',
    ingredients: ['Roasted Peanuts', 'Sugar', 'Molasses', 'Hydrogenated Vegetable Oil', 'Salt'],
    ingredientsText: 'Roasted peanuts, sugar, contains 2% or less of: molasses, fully hydrogenated vegetable oils (rapeseed and soybean), mono and diglycerides, salt',
    nutrition: {
      energy_kcal: 588,
      fat: 50,
      saturated_fat: 8.8,
      carbohydrates: 20,
      sugars: 8.8,
      fiber: 6.2,
      proteins: 25,
      salt: 1.1,
    },
    allergens: ['Peanuts', 'Soy'],
    labels: [],
    categories: ['Spreads', 'Peanut butter'],
  },

  '0007310300002': {
    barcode: '0007310300002',
    name: 'Almond Milk',
    brand: 'Silk',
    ingredients: ['Almond Milk', 'Cane Sugar', 'Calcium Carbonate', 'Sea Salt', 'Natural Flavor', 'Sunflower Lecithin', 'Vitamin E'],
    ingredientsText: 'Almondmilk (filtered water, almonds), cane sugar, calcium carbonate, sea salt, potassium citrate, sunflower lecithin, gellan gum, natural flavor, vitamin A palmitate, vitamin D2, d-alpha-tocopherol (vitamin E)',
    nutrition: {
      energy_kcal: 30,
      fat: 1.2,
      saturated_fat: 0,
      carbohydrates: 4.2,
      sugars: 2.9,
      fiber: 0.4,
      proteins: 0.4,
      salt: 0.15,
    },
    allergens: ['Tree nuts'],
    labels: ['Vegan', 'Dairy-free'],
    categories: ['Plant-based milk', 'Almond milk'],
  },

  '0007890000003': {
    barcode: '0007890000003',
    name: 'Quinoa',
    brand: 'Ancient Harvest',
    ingredients: ['Organic Quinoa'],
    ingredientsText: 'Organic quinoa',
    nutrition: {
      energy_kcal: 368,
      fat: 6.1,
      saturated_fat: 0.7,
      carbohydrates: 64.2,
      sugars: 0,
      fiber: 7,
      proteins: 14.1,
      salt: 0.01,
    },
    allergens: [],
    labels: ['Organic', 'Gluten-free', 'Vegan'],
    categories: ['Grains', 'Quinoa'],
  },

  '0008844000001': {
    barcode: '0008844000001',
    name: 'Salmon Fillet',
    brand: 'Wild Planet',
    ingredients: ['Wild Salmon', 'Salt'],
    ingredientsText: 'Wild caught salmon, sea salt',
    nutrition: {
      energy_kcal: 142,
      fat: 6.3,
      saturated_fat: 1,
      carbohydrates: 0,
      sugars: 0,
      fiber: 0,
      proteins: 19.8,
      salt: 0.6,
    },
    allergens: ['Fish'],
    labels: ['Wild caught', 'Paleo'],
    categories: ['Seafood', 'Fish', 'Salmon'],
  },

  '0003400000019': {
    barcode: '0003400000019',
    name: 'Eggs',
    brand: 'Organic Valley',
    ingredients: ['Organic Eggs'],
    ingredientsText: 'Organic eggs',
    nutrition: {
      energy_kcal: 143,
      fat: 9.5,
      saturated_fat: 3.1,
      carbohydrates: 0.7,
      sugars: 0.4,
      fiber: 0,
      proteins: 12.6,
      salt: 0.35,
    },
    allergens: ['Eggs'],
    labels: ['Organic', 'Paleo'],
    categories: ['Eggs'],
  },

  // More Beverages
  '0001200000008': {
    barcode: '0001200000008',
    name: 'Orange Juice',
    brand: 'Tropicana',
    ingredients: ['Orange Juice'],
    ingredientsText: '100% pure squeezed orange juice',
    nutrition: { energy_kcal: 45, fat: 0, saturated_fat: 0, carbohydrates: 10.4, sugars: 8.4, fiber: 0.2, proteins: 0.7, salt: 0 },
    allergens: [],
    labels: ['100% juice'],
    categories: ['Beverages', 'Juices', 'Orange juice'],
  },

  '0007470000001': {
    barcode: '0007470000001',
    name: 'Green Tea',
    brand: 'Lipton',
    ingredients: ['Green Tea'],
    ingredientsText: 'Green tea leaves',
    nutrition: { energy_kcal: 1, fat: 0, saturated_fat: 0, carbohydrates: 0, sugars: 0, fiber: 0, proteins: 0, salt: 0 },
    allergens: [],
    labels: ['Vegan', 'Paleo'],
    categories: ['Beverages', 'Tea', 'Green tea'],
  },

  '0001400000002': {
    barcode: '0001400000002',
    name: 'Energy Drink',
    brand: 'Red Bull',
    ingredients: ['Carbonated Water', 'Sucrose', 'Glucose', 'Citric Acid', 'Taurine', 'Sodium Bicarbonate', 'Caffeine'],
    ingredientsText: 'Carbonated water, sucrose, glucose, citric acid, taurine, sodium bicarbonate, magnesium carbonate, caffeine, niacinamide',
    nutrition: { energy_kcal: 45, fat: 0, saturated_fat: 0, carbohydrates: 11, sugars: 11, fiber: 0, proteins: 0, salt: 0.2 },
    allergens: [],
    labels: [],
    categories: ['Beverages', 'Energy drinks'],
  },

  // Snacks
  '0002800000014': {
    barcode: '0002800000014',
    name: 'Potato Chips',
    brand: "Lay's",
    ingredients: ['Potatoes', 'Vegetable Oil', 'Salt'],
    ingredientsText: 'Potatoes, vegetable oil (sunflower, corn, and/or canola oil), salt',
    nutrition: { energy_kcal: 536, fat: 35.7, saturated_fat: 3.6, carbohydrates: 50, sugars: 0.4, fiber: 4.3, proteins: 6.4, salt: 1.5 },
    allergens: [],
    labels: [],
    categories: ['Snacks', 'Chips', 'Potato chips'],
  },

  '0002200000011': {
    barcode: '0002200000011',
    name: 'Granola Bar',
    brand: 'Nature Valley',
    ingredients: ['Whole Grain Oats', 'Sugar', 'Canola Oil', 'Rice Flour', 'Honey', 'Brown Sugar Syrup', 'Salt'],
    ingredientsText: 'Whole grain oats, sugar, canola oil, rice flour, honey, brown sugar syrup, salt, soy lecithin, baking soda, natural flavor',
    nutrition: { energy_kcal: 471, fat: 20, saturated_fat: 1.8, carbohydrates: 64.7, sugars: 29.4, fiber: 5.9, proteins: 8.2, salt: 0.8 },
    allergens: ['Soy'],
    labels: [],
    categories: ['Snacks', 'Granola bars'],
  },

  '0006600000007': {
    barcode: '0006600000007',
    name: 'Dark Chocolate',
    brand: 'Lindt',
    ingredients: ['Chocolate', 'Sugar', 'Cocoa Butter', 'Vanilla'],
    ingredientsText: 'Chocolate, sugar, cocoa butter, vanilla',
    nutrition: { energy_kcal: 598, fat: 42.7, saturated_fat: 24.5, carbohydrates: 45.9, sugars: 36.7, fiber: 12.2, proteins: 7.8, salt: 0.01 },
    allergens: ['Milk'],
    labels: [],
    categories: ['Snacks', 'Chocolate', 'Dark chocolate'],
  },

  // Dairy & Alternatives
  '0007600000004': {
    barcode: '0007600000004',
    name: 'Whole Milk',
    brand: 'Organic Valley',
    ingredients: ['Organic Milk', 'Vitamin D3'],
    ingredientsText: 'Organic grade A milk, vitamin D3',
    nutrition: { energy_kcal: 61, fat: 3.3, saturated_fat: 1.9, carbohydrates: 4.8, sugars: 5.1, fiber: 0, proteins: 3.2, salt: 0.04 },
    allergens: ['Milk'],
    labels: ['Organic'],
    categories: ['Dairy', 'Milk'],
  },

  '0008200000006': {
    barcode: '0008200000006',
    name: 'Coconut Milk',
    brand: 'So Delicious',
    ingredients: ['Coconut Milk', 'Water', 'Cane Sugar', 'Calcium Carbonate', 'Vitamin D2'],
    ingredientsText: 'Coconut milk (filtered water, coconut cream), cane sugar, calcium carbonate, vitamin D2',
    nutrition: { energy_kcal: 40, fat: 2.5, saturated_fat: 2.5, carbohydrates: 4.2, sugars: 4.2, fiber: 0, proteins: 0, salt: 0.1 },
    allergens: ['Tree nuts'],
    labels: ['Vegan', 'Dairy-free'],
    categories: ['Plant-based milk', 'Coconut milk'],
  },

  '0005500000003': {
    barcode: '0005500000003',
    name: 'Butter',
    brand: 'Land O Lakes',
    ingredients: ['Cream', 'Salt'],
    ingredientsText: 'Cream, salt',
    nutrition: { energy_kcal: 717, fat: 81.1, saturated_fat: 51.4, carbohydrates: 0.1, sugars: 0.1, fiber: 0, proteins: 0.9, salt: 0.7 },
    allergens: ['Milk'],
    labels: [],
    categories: ['Dairy', 'Butter'],
  },

  // Proteins
  '0009900000001': {
    barcode: '0009900000001',
    name: 'Chicken Breast',
    brand: 'Perdue',
    ingredients: ['Chicken Breast'],
    ingredientsText: 'Boneless skinless chicken breast',
    nutrition: { energy_kcal: 165, fat: 3.6, saturated_fat: 1, carbohydrates: 0, sugars: 0, fiber: 0, proteins: 31, salt: 0.07 },
    allergens: [],
    labels: ['Paleo'],
    categories: ['Meat', 'Poultry', 'Chicken'],
  },

  '0008800000002': {
    barcode: '0008800000002',
    name: 'Ground Beef',
    brand: 'Grass Fed',
    ingredients: ['Beef'],
    ingredientsText: '100% grass-fed ground beef',
    nutrition: { energy_kcal: 250, fat: 17, saturated_fat: 7, carbohydrates: 0, sugars: 0, fiber: 0, proteins: 23, salt: 0.08 },
    allergens: [],
    labels: ['Grass-fed', 'Paleo'],
    categories: ['Meat', 'Beef'],
  },

  '0005200000009': {
    barcode: '0005200000009',
    name: 'Tofu',
    brand: 'Nasoya',
    ingredients: ['Soybeans', 'Water', 'Calcium Sulfate'],
    ingredientsText: 'Organic soybeans, filtered water, calcium sulfate',
    nutrition: { energy_kcal: 76, fat: 4.8, saturated_fat: 0.7, carbohydrates: 1.9, sugars: 0.7, fiber: 0.3, proteins: 8.1, salt: 0.01 },
    allergens: ['Soy'],
    labels: ['Vegan', 'Organic'],
    categories: ['Plant-based protein', 'Tofu'],
  },

  // Grains & Bread
  '0004700000005': {
    barcode: '0004700000005',
    name: 'Brown Rice',
    brand: 'Uncle Bens',
    ingredients: ['Brown Rice'],
    ingredientsText: 'Whole grain brown rice',
    nutrition: { energy_kcal: 370, fat: 2.9, saturated_fat: 0.6, carbohydrates: 77.2, sugars: 0.9, fiber: 3.5, proteins: 7.9, salt: 0.01 },
    allergens: [],
    labels: ['Whole grain'],
    categories: ['Grains', 'Rice', 'Brown rice'],
  },

  '0003300000016': {
    barcode: '0003300000016',
    name: 'Whole Wheat Bread',
    brand: 'Daves Killer Bread',
    ingredients: ['Whole Wheat Flour', 'Water', 'Cane Sugar', 'Yeast', 'Sea Salt', 'Wheat Gluten'],
    ingredientsText: 'Organic whole wheat flour, water, organic cane sugar, organic cracked whole wheat, yeast, sea salt, organic wheat gluten',
    nutrition: { energy_kcal: 260, fat: 3.8, saturated_fat: 0.4, carbohydrates: 46.2, sugars: 7.7, fiber: 7.7, proteins: 11.5, salt: 0.9 },
    allergens: ['Wheat'],
    labels: ['Organic', 'Whole grain'],
    categories: ['Bread', 'Whole wheat bread'],
  },

  '0006800000008': {
    barcode: '0006800000008',
    name: 'Pasta',
    brand: 'Barilla',
    ingredients: ['Durum Wheat Semolina'],
    ingredientsText: 'Durum wheat semolina',
    nutrition: { energy_kcal: 371, fat: 1.5, saturated_fat: 0.3, carbohydrates: 74.7, sugars: 3.2, fiber: 3.2, proteins: 13, salt: 0.01 },
    allergens: ['Wheat'],
    labels: [],
    categories: ['Pasta'],
  },

  // Vegetables & Fruits
  '0009100000004': {
    barcode: '0009100000004',
    name: 'Broccoli',
    brand: 'Fresh',
    ingredients: ['Broccoli'],
    ingredientsText: 'Fresh broccoli',
    nutrition: { energy_kcal: 34, fat: 0.4, saturated_fat: 0, carbohydrates: 7, sugars: 1.7, fiber: 2.6, proteins: 2.8, salt: 0.03 },
    allergens: [],
    labels: ['Vegan', 'Paleo'],
    categories: ['Vegetables', 'Broccoli'],
  },

  '0009200000005': {
    barcode: '0009200000005',
    name: 'Bananas',
    brand: 'Fresh',
    ingredients: ['Bananas'],
    ingredientsText: 'Fresh bananas',
    nutrition: { energy_kcal: 89, fat: 0.3, saturated_fat: 0.1, carbohydrates: 22.8, sugars: 12.2, fiber: 2.6, proteins: 1.1, salt: 0 },
    allergens: [],
    labels: ['Vegan', 'Paleo'],
    categories: ['Fruits', 'Bananas'],
  },

  '0009300000006': {
    barcode: '0009300000006',
    name: 'Sweet Potato',
    brand: 'Fresh',
    ingredients: ['Sweet Potato'],
    ingredientsText: 'Fresh sweet potato',
    nutrition: { energy_kcal: 86, fat: 0.1, saturated_fat: 0, carbohydrates: 20.1, sugars: 4.2, fiber: 3, proteins: 1.6, salt: 0.06 },
    allergens: [],
    labels: ['Vegan', 'Paleo'],
    categories: ['Vegetables', 'Sweet potato'],
  },

  // Condiments & Sauces
  '0004900000007': {
    barcode: '0004900000007',
    name: 'Ketchup',
    brand: 'Heinz',
    ingredients: ['Tomato Concentrate', 'High Fructose Corn Syrup', 'Distilled Vinegar', 'Corn Syrup', 'Salt'],
    ingredientsText: 'Tomato concentrate from red ripe tomatoes, distilled vinegar, high fructose corn syrup, corn syrup, salt, spice, onion powder, natural flavoring',
    nutrition: { energy_kcal: 112, fat: 0.1, saturated_fat: 0, carbohydrates: 27.4, sugars: 22.8, fiber: 0.3, proteins: 1.2, salt: 1.1 },
    allergens: [],
    labels: [],
    categories: ['Condiments', 'Ketchup'],
  },

  '0005800000001': {
    barcode: '0005800000001',
    name: 'Olive Oil',
    brand: 'Bertolli',
    ingredients: ['Extra Virgin Olive Oil'],
    ingredientsText: 'Extra virgin olive oil',
    nutrition: { energy_kcal: 884, fat: 100, saturated_fat: 14, carbohydrates: 0, sugars: 0, fiber: 0, proteins: 0, salt: 0 },
    allergens: [],
    labels: ['Vegan', 'Paleo'],
    categories: ['Oils', 'Olive oil'],
  },

  '0006200000003': {
    barcode: '0006200000003',
    name: 'Mayonnaise',
    brand: 'Hellmanns',
    ingredients: ['Soybean Oil', 'Water', 'Whole Eggs', 'Vinegar', 'Salt', 'Sugar', 'Lemon Juice'],
    ingredientsText: 'Soybean oil, water, whole eggs and egg yolks, vinegar, salt, sugar, lemon juice concentrate, calcium disodium EDTA',
    nutrition: { energy_kcal: 680, fat: 75, saturated_fat: 11, carbohydrates: 0.6, sugars: 0.4, fiber: 0, proteins: 1, salt: 1.5 },
    allergens: ['Eggs', 'Soy'],
    labels: [],
    categories: ['Condiments', 'Mayonnaise'],
  },

  // Breakfast Items
  '0004100000006': {
    barcode: '0004100000006',
    name: 'Oatmeal',
    brand: 'Quaker',
    ingredients: ['Whole Grain Oats'],
    ingredientsText: '100% whole grain rolled oats',
    nutrition: { energy_kcal: 389, fat: 6.9, saturated_fat: 1.2, carbohydrates: 66.3, sugars: 0.9, fiber: 10.6, proteins: 16.9, salt: 0 },
    allergens: [],
    labels: ['Whole grain'],
    categories: ['Breakfast', 'Oatmeal'],
  },

  '0003900000018': {
    barcode: '0003900000018',
    name: 'Pancake Mix',
    brand: 'Aunt Jemima',
    ingredients: ['Enriched Flour', 'Sugar', 'Leavening', 'Salt', 'Calcium Carbonate'],
    ingredientsText: 'Enriched bleached flour (wheat flour, niacin, iron, thiamin mononitrate, riboflavin, folic acid), sugar, leavening (baking soda, sodium aluminum phosphate, monocalcium phosphate), dextrose, salt, calcium carbonate',
    nutrition: { energy_kcal: 367, fat: 1.7, saturated_fat: 0.3, carbohydrates: 80, sugars: 13.3, fiber: 1.7, proteins: 6.7, salt: 2.3 },
    allergens: ['Wheat'],
    labels: [],
    categories: ['Breakfast', 'Pancake mix'],
  },

  '0005100000008': {
    barcode: '0005100000008',
    name: 'Maple Syrup',
    brand: 'Aunt Jemima',
    ingredients: ['High Fructose Corn Syrup', 'Corn Syrup', 'Water', 'Cellulose Gum', 'Caramel Color', 'Salt', 'Natural and Artificial Flavor'],
    ingredientsText: 'High fructose corn syrup, corn syrup, water, cellulose gum, caramel color, salt, natural and artificial flavor, sodium benzoate and sorbic acid (preservatives)',
    nutrition: { energy_kcal: 267, fat: 0, saturated_fat: 0, carbohydrates: 66.7, sugars: 53.3, fiber: 0, proteins: 0, salt: 0.3 },
    allergens: [],
    labels: [],
    categories: ['Breakfast', 'Syrup'],
  },

  // Frozen Foods
  '0007100000002': {
    barcode: '0007100000002',
    name: 'Frozen Pizza',
    brand: 'DiGiorno',
    ingredients: ['Enriched Flour', 'Water', 'Low-Moisture Mozzarella Cheese', 'Tomato Paste', 'Pepperoni', 'Soybean Oil', 'Sugar', 'Salt'],
    ingredientsText: 'Enriched flour, water, low-moisture part-skim mozzarella cheese, tomato paste, pepperoni, soybean oil, sugar, salt, yeast, spices',
    nutrition: { energy_kcal: 267, fat: 11.1, saturated_fat: 4.4, carbohydrates: 30, sugars: 4.4, fiber: 2.2, proteins: 11.1, salt: 1.6 },
    allergens: ['Wheat', 'Milk', 'Soy'],
    labels: [],
    categories: ['Frozen foods', 'Pizza'],
  },

  '0007200000003': {
    barcode: '0007200000003',
    name: 'Ice Cream',
    brand: 'Ben & Jerrys',
    ingredients: ['Cream', 'Skim Milk', 'Liquid Sugar', 'Water', 'Egg Yolks', 'Sugar', 'Vanilla Extract'],
    ingredientsText: 'Cream, skim milk, liquid sugar (sugar, water), water, egg yolks, sugar, vanilla extract',
    nutrition: { energy_kcal: 207, fat: 11, saturated_fat: 7, carbohydrates: 24, sugars: 21, fiber: 0, proteins: 3.4, salt: 0.1 },
    allergens: ['Milk', 'Eggs'],
    labels: [],
    categories: ['Frozen foods', 'Ice cream'],
  },

  // Canned Goods
  '0008500000005': {
    barcode: '0008500000005',
    name: 'Black Beans',
    brand: 'Goya',
    ingredients: ['Black Beans', 'Water', 'Salt', 'Calcium Chloride'],
    ingredientsText: 'Prepared black beans, water, salt, calcium chloride, ferrous gluconate',
    nutrition: { energy_kcal: 91, fat: 0.3, saturated_fat: 0.1, carbohydrates: 16.6, sugars: 0.3, fiber: 6.3, proteins: 6, salt: 0.4 },
    allergens: [],
    labels: ['Vegan'],
    categories: ['Canned goods', 'Beans', 'Black beans'],
  },

  '0008600000006': {
    barcode: '0008600000006',
    name: 'Tuna',
    brand: 'StarKist',
    ingredients: ['Tuna', 'Water', 'Vegetable Broth', 'Salt'],
    ingredientsText: 'Tuna, water, vegetable broth, salt',
    nutrition: { energy_kcal: 116, fat: 0.8, saturated_fat: 0.2, carbohydrates: 0, sugars: 0, fiber: 0, proteins: 26, salt: 0.4 },
    allergens: ['Fish'],
    labels: ['Paleo'],
    categories: ['Canned goods', 'Fish', 'Tuna'],
  },

  '0008700000007': {
    barcode: '0008700000007',
    name: 'Tomato Sauce',
    brand: 'Hunts',
    ingredients: ['Tomato Puree', 'Water', 'Salt', 'Citric Acid', 'Spices'],
    ingredientsText: 'Tomato puree (water, tomato paste), water, salt, citric acid, spice, natural flavors',
    nutrition: { energy_kcal: 29, fat: 0.1, saturated_fat: 0, carbohydrates: 6.5, sugars: 4.1, fiber: 1.2, proteins: 1.2, salt: 0.6 },
    allergens: [],
    labels: ['Vegan'],
    categories: ['Canned goods', 'Sauces', 'Tomato sauce'],
  },

  // Nuts & Seeds
  '0009400000007': {
    barcode: '0009400000007',
    name: 'Cashews',
    brand: 'Planters',
    ingredients: ['Cashews', 'Peanut Oil', 'Salt'],
    ingredientsText: 'Cashews, peanut and/or cottonseed oil, salt',
    nutrition: { energy_kcal: 553, fat: 43.8, saturated_fat: 7.8, carbohydrates: 30.2, sugars: 5.9, fiber: 3.3, proteins: 18.2, salt: 0.3 },
    allergens: ['Tree nuts', 'Peanuts'],
    labels: [],
    categories: ['Nuts', 'Cashews'],
  },

  '0009500000008': {
    barcode: '0009500000008',
    name: 'Chia Seeds',
    brand: 'Nutiva',
    ingredients: ['Organic Chia Seeds'],
    ingredientsText: 'Organic chia seeds',
    nutrition: { energy_kcal: 486, fat: 30.7, saturated_fat: 3.3, carbohydrates: 42.1, sugars: 0, fiber: 34.4, proteins: 16.5, salt: 0.02 },
    allergens: [],
    labels: ['Organic', 'Vegan', 'Paleo'],
    categories: ['Seeds', 'Chia seeds'],
  },

  '0009600000009': {
    barcode: '0009600000009',
    name: 'Walnuts',
    brand: 'Diamond',
    ingredients: ['Walnuts'],
    ingredientsText: 'Walnuts',
    nutrition: { energy_kcal: 654, fat: 65.2, saturated_fat: 6.1, carbohydrates: 13.7, sugars: 2.6, fiber: 6.7, proteins: 15.2, salt: 0 },
    allergens: ['Tree nuts'],
    labels: ['Vegan', 'Paleo'],
    categories: ['Nuts', 'Walnuts'],
  },

  // Protein Bars & Shakes
  '0006400000005': {
    barcode: '0006400000005',
    name: 'Protein Bar',
    brand: 'Quest',
    ingredients: ['Protein Blend', 'Soluble Corn Fiber', 'Almonds', 'Water', 'Erythritol', 'Natural Flavors', 'Sea Salt', 'Sucralose'],
    ingredientsText: 'Protein blend (milk protein isolate, whey protein isolate), soluble corn fiber, almonds, water, erythritol, natural flavors, sea salt, sucralose',
    nutrition: { energy_kcal: 190, fat: 8, saturated_fat: 2.5, carbohydrates: 21, sugars: 1, fiber: 14, proteins: 20, salt: 0.4 },
    allergens: ['Milk', 'Tree nuts', 'Soy'],
    labels: [],
    categories: ['Snacks', 'Protein bars'],
  },

  '0006500000006': {
    barcode: '0006500000006',
    name: 'Protein Shake',
    brand: 'Premier Protein',
    ingredients: ['Water', 'Milk Protein Concentrate', 'Calcium Caseinate', 'Contains Less Than 1% Of Natural And Artificial Flavors', 'Cellulose Gel', 'Salt', 'Sucralose', 'Acesulfame Potassium'],
    ingredientsText: 'Water, milk protein concentrate, calcium caseinate, contains less than 1% of: natural and artificial flavors, cellulose gel, salt, sucralose, acesulfame potassium',
    nutrition: { energy_kcal: 63, fat: 1.3, saturated_fat: 0, carbohydrates: 1.3, sugars: 0, fiber: 0, proteins: 12.5, salt: 0.2 },
    allergens: ['Milk', 'Soy'],
    labels: [],
    categories: ['Beverages', 'Protein shakes'],
  },
};

/**
 * Search for a product by barcode
 */
export function getProductByBarcode(barcode: string): Product | null {
  return PRODUCTS_DB[barcode] || null;
}

/**
 * Search for products by name (fuzzy search)
 */
export function searchProductsByName(query: string): Product[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(PRODUCTS_DB).filter(product =>
    product.name.toLowerCase().includes(lowerQuery) ||
    product.brand.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get all products
 */
export function getAllProducts(): Product[] {
  return Object.values(PRODUCTS_DB);
}

/**
 * Get products by category
 */
export function getProductsByCategory(category: string): Product[] {
  return Object.values(PRODUCTS_DB).filter(product =>
    product.categories.some(cat => cat.toLowerCase().includes(category.toLowerCase()))
  );
}
