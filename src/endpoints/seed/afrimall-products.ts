// Afrimall product seed data for a realistic storefront
export const afrimallProducts = [
  // African Art & Crafts
  {
    title: 'Hand-Carved Elephant Sculpture',
    description:
      'Beautiful hand-carved wooden elephant sculpture from Kenya. Made from sustainable ebony wood by skilled Maasai artisans. Each piece is unique and tells a story of African wildlife conservation.',
    price: 89.99,
    sku: 'AF-ELEPH-001',
    status: 'active',
    featured: true,
    weight: 2.5,
    inventory: {
      trackQuantity: true,
      quantity: 15,
      allowBackorder: false,
    },
    dimensions: {
      length: 12,
      width: 8,
      height: 10,
    },
    tags: [
      { tag: 'handmade' },
      { tag: 'sculpture' },
      { tag: 'elephant' },
      { tag: 'kenya' },
      { tag: 'ebony' },
    ],
    seo: {
      title: 'Hand-Carved Elephant Sculpture - Authentic Kenyan Art',
      description:
        'Beautiful hand-carved wooden elephant sculpture from Kenya. Made by skilled Maasai artisans.',
      keywords: 'elephant sculpture, african art, kenyan crafts, handmade, ebony wood',
    },
  },
  {
    title: 'Traditional African Mask Set',
    description:
      'Set of 3 authentic African ceremonial masks representing different tribal traditions. Hand-painted with natural pigments and featuring intricate geometric patterns.',
    price: 156.5,
    sku: 'AF-MASK-002',
    status: 'active',
    featured: true,
    weight: 1.8,
    inventory: {
      trackQuantity: true,
      quantity: 8,
      allowBackorder: true,
    },
    dimensions: {
      length: 14,
      width: 10,
      height: 6,
    },
    tags: [
      { tag: 'masks' },
      { tag: 'ceremonial' },
      { tag: 'traditional' },
      { tag: 'set' },
      { tag: 'tribal' },
    ],
  },
  {
    title: 'Baobab Tree Canvas Painting',
    description:
      'Stunning acrylic painting of the iconic African baobab tree at sunset. Created by contemporary African artist showcasing the beauty of the African landscape.',
    price: 245.0,
    sku: 'AF-PAINT-003',
    status: 'active',
    featured: false,
    weight: 3.2,
    inventory: {
      trackQuantity: true,
      quantity: 5,
      allowBackorder: false,
    },
    dimensions: {
      length: 24,
      width: 18,
      height: 1,
    },
    tags: [
      { tag: 'painting' },
      { tag: 'baobab' },
      { tag: 'canvas' },
      { tag: 'landscape' },
      { tag: 'contemporary' },
    ],
  },
  {
    title: 'Wooden African Chess Set',
    description:
      'Handcrafted wooden chess set featuring African wildlife pieces. Kings and queens are lions, bishops are elephants, knights are giraffes. Includes folding board.',
    price: 145.0,
    sku: 'AF-CHESS-004',
    status: 'active',
    featured: true,
    weight: 3.5,
    inventory: {
      trackQuantity: true,
      quantity: 7,
      allowBackorder: false,
    },
    dimensions: {
      length: 16,
      width: 16,
      height: 4,
    },
    tags: [
      { tag: 'chess' },
      { tag: 'wooden' },
      { tag: 'wildlife' },
      { tag: 'game' },
      { tag: 'handcrafted' },
    ],
  },
  {
    title: 'Soapstone Elephant Family',
    description:
      'Charming set of 3 soapstone elephants (parent and 2 babies) hand-carved in Kenya. Natural pink soapstone with smooth finish.',
    price: 34.99,
    sku: 'AF-SOAP-005',
    status: 'active',
    featured: false,
    weight: 1.1,
    inventory: {
      trackQuantity: true,
      quantity: 19,
      allowBackorder: true,
    },
    dimensions: {
      length: 8,
      width: 6,
      height: 5,
    },
    tags: [
      { tag: 'soapstone' },
      { tag: 'elephant' },
      { tag: 'family' },
      { tag: 'kenya' },
      { tag: 'pink' },
    ],
  },

  // Jewelry & Accessories
  {
    title: 'Maasai Beaded Necklace',
    description:
      'Authentic Maasai beaded necklace handcrafted by women artisans in Tanzania. Features traditional red, blue, and white color pattern with intricate beadwork.',
    price: 45.99,
    sku: 'AF-NECK-006',
    status: 'active',
    featured: true,
    weight: 0.3,
    inventory: {
      trackQuantity: true,
      quantity: 25,
      allowBackorder: true,
    },
    dimensions: {
      length: 20,
      width: 20,
      height: 2,
    },
    tags: [
      { tag: 'maasai' },
      { tag: 'beaded' },
      { tag: 'necklace' },
      { tag: 'tanzania' },
      { tag: 'traditional' },
    ],
  },
  {
    title: 'Gold-Plated Adinkra Symbol Earrings',
    description:
      'Elegant gold-plated earrings featuring traditional Adinkra symbols from Ghana. Each symbol represents wisdom, courage, and unity. Perfect for both casual and formal wear.',
    price: 67.5,
    sku: 'AF-EARR-007',
    status: 'active',
    featured: false,
    weight: 0.1,
    inventory: {
      trackQuantity: true,
      quantity: 18,
      allowBackorder: true,
    },
    dimensions: {
      length: 3,
      width: 2,
      height: 0.5,
    },
    tags: [
      { tag: 'adinkra' },
      { tag: 'earrings' },
      { tag: 'gold-plated' },
      { tag: 'ghana' },
      { tag: 'symbols' },
    ],
  },
  {
    title: 'Cowrie Shell Bracelet Set',
    description:
      'Set of 3 bracelets featuring authentic cowrie shells, traditionally used as currency in West Africa. Adjustable size with natural hemp cord.',
    price: 29.99,
    sku: 'AF-BRAC-008',
    status: 'active',
    featured: false,
    weight: 0.2,
    inventory: {
      trackQuantity: true,
      quantity: 32,
      allowBackorder: true,
    },
    dimensions: {
      length: 8,
      width: 8,
      height: 1,
    },
    tags: [
      { tag: 'cowrie' },
      { tag: 'bracelet' },
      { tag: 'set' },
      { tag: 'traditional' },
      { tag: 'hemp' },
    ],
  },

  // Textiles & Clothing
  {
    title: 'Authentic Kente Cloth Scarf',
    description:
      'Hand-woven Kente cloth scarf from Ghana featuring traditional royal colors and patterns. Made by master weavers using centuries-old techniques.',
    price: 125.0,
    sku: 'AF-KENTE-009',
    status: 'active',
    featured: true,
    weight: 0.4,
    inventory: {
      trackQuantity: true,
      quantity: 12,
      allowBackorder: false,
    },
    dimensions: {
      length: 72,
      width: 12,
      height: 0.5,
    },
    tags: [
      { tag: 'kente' },
      { tag: 'scarf' },
      { tag: 'ghana' },
      { tag: 'hand-woven' },
      { tag: 'royal' },
    ],
  },
  {
    title: 'Ankara Print Dress',
    description:
      'Vibrant Ankara print dress featuring bold geometric patterns in rich colors. Tailored fit with flowing silhouette, perfect for special occasions.',
    price: 89.0,
    sku: 'AF-DRESS-010',
    status: 'active',
    featured: true,
    weight: 0.8,
    inventory: {
      trackQuantity: true,
      quantity: 20,
      allowBackorder: true,
    },
    dimensions: {
      length: 45,
      width: 24,
      height: 2,
    },
    tags: [
      { tag: 'ankara' },
      { tag: 'dress' },
      { tag: 'geometric' },
      { tag: 'vibrant' },
      { tag: 'formal' },
    ],
  },
  {
    title: 'Mudcloth Table Runner',
    description:
      'Authentic Malian mudcloth table runner featuring traditional Bambara symbols. Hand-dyed with natural clay and plant-based dyes.',
    price: 78.99,
    sku: 'AF-TABLE-011',
    status: 'active',
    featured: false,
    weight: 0.6,
    inventory: {
      trackQuantity: true,
      quantity: 14,
      allowBackorder: true,
    },
    dimensions: {
      length: 72,
      width: 14,
      height: 0.3,
    },
    tags: [
      { tag: 'mudcloth' },
      { tag: 'table runner' },
      { tag: 'mali' },
      { tag: 'bambara' },
      { tag: 'natural dye' },
    ],
  },
  {
    title: 'Wax Print Fabric - Per Yard',
    description:
      'Authentic African wax print fabric sold by the yard. Perfect for clothing, accessories, or home decor projects. Vibrant colors and traditional patterns.',
    price: 18.99,
    sku: 'AF-FABRIC-012',
    status: 'active',
    featured: false,
    weight: 0.3,
    inventory: {
      trackQuantity: true,
      quantity: 100,
      allowBackorder: true,
    },
    dimensions: {
      length: 36,
      width: 45,
      height: 0.1,
    },
    tags: [
      { tag: 'wax print' },
      { tag: 'fabric' },
      { tag: 'yard' },
      { tag: 'sewing' },
      { tag: 'vibrant' },
    ],
  },
  {
    title: 'Dashiki Shirt - Unisex',
    description:
      'Traditional dashiki shirt in classic design with intricate embroidered neckline. Comfortable cotton blend, perfect for casual wear or cultural events.',
    price: 39.99,
    sku: 'AF-SHIRT-013',
    status: 'active',
    featured: false,
    weight: 0.4,
    inventory: {
      trackQuantity: true,
      quantity: 35,
      allowBackorder: true,
    },
    dimensions: {
      length: 28,
      width: 22,
      height: 1,
    },
    tags: [
      { tag: 'dashiki' },
      { tag: 'shirt' },
      { tag: 'unisex' },
      { tag: 'embroidered' },
      { tag: 'cotton' },
    ],
  },

  // Home & Decor
  {
    title: 'Woven Sweetgrass Basket',
    description:
      'Beautiful handwoven sweetgrass basket from South Africa. Perfect for storage or as decorative piece. Features traditional Zulu weaving techniques.',
    price: 52.0,
    sku: 'AF-BASKET-014',
    status: 'active',
    featured: false,
    weight: 0.7,
    inventory: {
      trackQuantity: true,
      quantity: 22,
      allowBackorder: true,
    },
    dimensions: {
      length: 12,
      width: 12,
      height: 8,
    },
    tags: [
      { tag: 'basket' },
      { tag: 'sweetgrass' },
      { tag: 'south africa' },
      { tag: 'zulu' },
      { tag: 'storage' },
    ],
  },
  {
    title: 'African Throw Pillow Set',
    description:
      'Set of 2 decorative throw pillows featuring bold African-inspired patterns. Made with high-quality cotton and filled with hypoallergenic stuffing.',
    price: 65.99,
    sku: 'AF-PILLOW-015',
    status: 'active',
    featured: false,
    weight: 1.2,
    inventory: {
      trackQuantity: true,
      quantity: 16,
      allowBackorder: true,
    },
    dimensions: {
      length: 18,
      width: 18,
      height: 6,
    },
    tags: [
      { tag: 'pillows' },
      { tag: 'throw' },
      { tag: 'set' },
      { tag: 'cotton' },
      { tag: 'decorative' },
    ],
  },
  {
    title: 'Ceramic African Vase',
    description:
      'Hand-thrown ceramic vase featuring traditional African motifs. Glazed in earth tones with geometric patterns inspired by ancient pottery traditions.',
    price: 95.5,
    sku: 'AF-VASE-016',
    status: 'active',
    featured: true,
    weight: 2.8,
    inventory: {
      trackQuantity: true,
      quantity: 9,
      allowBackorder: false,
    },
    dimensions: {
      length: 8,
      width: 8,
      height: 14,
    },
    tags: [
      { tag: 'ceramic' },
      { tag: 'vase' },
      { tag: 'pottery' },
      { tag: 'geometric' },
      { tag: 'earth tones' },
    ],
  },
  {
    title: 'Moroccan Leather Pouf',
    description:
      'Authentic Moroccan leather pouf ottoman in rich brown color. Hand-stitched with traditional patterns. Perfect as seating or footrest.',
    price: 129.99,
    sku: 'AF-POUF-017',
    status: 'active',
    featured: false,
    weight: 4.2,
    inventory: {
      trackQuantity: true,
      quantity: 11,
      allowBackorder: true,
    },
    dimensions: {
      length: 20,
      width: 20,
      height: 14,
    },
    tags: [
      { tag: 'moroccan' },
      { tag: 'leather' },
      { tag: 'pouf' },
      { tag: 'ottoman' },
      { tag: 'seating' },
    ],
  },

  // Music & Instruments
  {
    title: 'Kalimba Thumb Piano',
    description:
      'Traditional kalimba (thumb piano) handcrafted from solid wood with 17 metal tines. Includes instruction booklet and carrying case.',
    price: 42.99,
    sku: 'AF-KALIMBA-018',
    status: 'active',
    featured: false,
    weight: 0.5,
    inventory: {
      trackQuantity: true,
      quantity: 28,
      allowBackorder: true,
    },
    dimensions: {
      length: 7,
      width: 5,
      height: 2,
    },
    tags: [
      { tag: 'kalimba' },
      { tag: 'thumb piano' },
      { tag: 'instrument' },
      { tag: 'traditional' },
      { tag: 'music' },
    ],
  },
  {
    title: 'Djembe Drum - Medium',
    description:
      'Authentic djembe drum from Mali with goatskin head and carved hardwood body. Features traditional rope tensioning system. Perfect for beginners and professionals.',
    price: 189.0,
    sku: 'AF-DJEMBE-019',
    status: 'active',
    featured: true,
    weight: 8.5,
    inventory: {
      trackQuantity: true,
      quantity: 6,
      allowBackorder: false,
    },
    dimensions: {
      length: 12,
      width: 12,
      height: 24,
    },
    tags: [
      { tag: 'djembe' },
      { tag: 'drum' },
      { tag: 'mali' },
      { tag: 'goatskin' },
      { tag: 'percussion' },
    ],
  },

  // Beauty & Wellness
  {
    title: 'Raw Shea Butter - Organic',
    description:
      'Pure, unrefined shea butter from Ghana. Rich in vitamins A and E, perfect for moisturizing skin and hair. Ethically sourced from women cooperatives.',
    price: 24.99,
    sku: 'AF-SHEA-020',
    status: 'active',
    featured: false,
    weight: 0.5,
    inventory: {
      trackQuantity: true,
      quantity: 45,
      allowBackorder: true,
    },
    dimensions: {
      length: 4,
      width: 4,
      height: 3,
    },
    tags: [
      { tag: 'shea butter' },
      { tag: 'organic' },
      { tag: 'ghana' },
      { tag: 'moisturizer' },
      { tag: 'ethical' },
    ],
  },
  {
    title: 'African Black Soap Bar',
    description:
      'Traditional African black soap made with plantain skins, palm kernel oil, and shea butter. Gentle cleanser suitable for all skin types.',
    price: 12.5,
    sku: 'AF-SOAP-021',
    status: 'active',
    featured: false,
    weight: 0.2,
    inventory: {
      trackQuantity: true,
      quantity: 60,
      allowBackorder: true,
    },
    dimensions: {
      length: 4,
      width: 3,
      height: 1.5,
    },
    tags: [
      { tag: 'black soap' },
      { tag: 'traditional' },
      { tag: 'natural' },
      { tag: 'skincare' },
      { tag: 'plantain' },
    ],
  },
  {
    title: 'Argan Oil Hair Treatment',
    description:
      'Pure Moroccan argan oil for hair and skin treatment. Cold-pressed from argan nuts by Berber women cooperatives. Rich in vitamin E and antioxidants.',
    price: 35.99,
    sku: 'AF-ARGAN-022',
    status: 'active',
    featured: false,
    weight: 0.3,
    inventory: {
      trackQuantity: true,
      quantity: 30,
      allowBackorder: true,
    },
    dimensions: {
      length: 3,
      width: 3,
      height: 6,
    },
    tags: [
      { tag: 'argan oil' },
      { tag: 'morocco' },
      { tag: 'hair treatment' },
      { tag: 'berber' },
      { tag: 'vitamin e' },
    ],
  },
]

// Category mapping helper - maps category slugs to product titles
export const categoryMapping = {
  'african-art-crafts': [
    'Hand-Carved Elephant Sculpture',
    'Traditional African Mask Set',
    'Baobab Tree Canvas Painting',
    'Wooden African Chess Set',
    'Soapstone Elephant Family',
  ],
  'jewelry-accessories': [
    'Maasai Beaded Necklace',
    'Gold-Plated Adinkra Symbol Earrings',
    'Cowrie Shell Bracelet Set',
  ],
  'textiles-clothing': [
    'Authentic Kente Cloth Scarf',
    'Ankara Print Dress',
    'Mudcloth Table Runner',
    'Wax Print Fabric - Per Yard',
    'Dashiki Shirt - Unisex',
  ],
  'home-decor': [
    'Woven Sweetgrass Basket',
    'African Throw Pillow Set',
    'Ceramic African Vase',
    'Moroccan Leather Pouf',
  ],
  'music-instruments': ['Kalimba Thumb Piano', 'Djembe Drum - Medium'],
  'beauty-wellness': [
    'Raw Shea Butter - Organic',
    'African Black Soap Bar',
    'Argan Oil Hair Treatment',
  ],
}
