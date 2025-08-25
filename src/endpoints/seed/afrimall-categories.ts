// Afrimall-specific category seed data
export const afrimallCategories = [
  // Main Categories
  {
    title: 'African Art & Crafts',
    description: 'Authentic handcrafted art pieces and traditional crafts from across Africa',
    status: 'active' as const,
    featured: true,
    sortOrder: 1,
    seo: {
      title: 'African Art & Crafts - Authentic Handmade Pieces',
      description: 'Discover beautiful African art and traditional crafts made by skilled artisans',
      keywords: 'african art, crafts, handmade, traditional, sculptures, masks',
    },
  },
  {
    title: 'Jewelry & Accessories',
    description: 'Beautiful African jewelry, beadwork, and fashion accessories',
    status: 'active' as const,
    featured: true,
    sortOrder: 2,
    seo: {
      title: 'African Jewelry & Accessories - Traditional & Modern',
      description: 'Stunning African jewelry, beadwork, and accessories from talented artisans',
      keywords: 'african jewelry, beads, accessories, necklaces, bracelets, earrings',
    },
  },
  {
    title: 'Textiles & Clothing',
    description: 'Traditional African fabrics, clothing, and textile products',
    status: 'active' as const,
    featured: true,
    sortOrder: 3,
    seo: {
      title: 'African Textiles & Clothing - Traditional Fabrics',
      description: 'Authentic African textiles, traditional clothing, and fabric products',
      keywords: 'african textiles, clothing, fabrics, kente, ankara, dashiki',
    },
  },
  {
    title: 'Home & Decor',
    description: 'African home decor, furniture, and interior design items',
    status: 'active' as const,
    featured: true,
    sortOrder: 4,
    seo: {
      title: 'African Home Decor - Interior Design & Furniture',
      description: 'Transform your home with authentic African decor and furniture',
      keywords: 'african decor, home, furniture, interior design, baskets, pottery',
    },
  },
  {
    title: 'Music & Instruments',
    description: 'Traditional African musical instruments and music-related items',
    status: 'active' as const,
    featured: false,
    sortOrder: 5,
    seo: {
      title: 'African Music & Instruments - Traditional Sounds',
      description: 'Authentic African musical instruments and music accessories',
      keywords: 'african music, instruments, drums, kalimba, traditional music',
    },
  },
  {
    title: 'Beauty & Wellness',
    description: 'Natural African beauty products and wellness items',
    status: 'active' as const,
    featured: false,
    sortOrder: 6,
    seo: {
      title: 'African Beauty & Wellness - Natural Products',
      description: 'Natural African beauty and wellness products from traditional recipes',
      keywords: 'african beauty, natural products, skincare, wellness, shea butter',
    },
  },
]

// Subcategories for Art & Crafts
export const artCraftsSubcategories = [
  {
    title: 'Sculptures',
    description: 'Hand-carved wooden and stone sculptures',
    parent: 'african-art-crafts', // Will be set dynamically
    status: 'active' as const,
    sortOrder: 1,
  },
  {
    title: 'Masks',
    description: 'Traditional African ceremonial and decorative masks',
    parent: 'african-art-crafts',
    status: 'active' as const,
    sortOrder: 2,
  },
  {
    title: 'Paintings',
    description: 'African-inspired paintings and artwork',
    parent: 'african-art-crafts',
    status: 'active' as const,
    sortOrder: 3,
  },
  {
    title: 'Pottery',
    description: 'Handmade ceramic and clay pottery',
    parent: 'african-art-crafts',
    status: 'active',
    sortOrder: 4,
  },
]

// Subcategories for Jewelry
export const jewelrySubcategories = [
  {
    title: 'Necklaces',
    description: 'Traditional and modern African necklaces',
    parent: 'jewelry-accessories',
    status: 'active',
    sortOrder: 1,
  },
  {
    title: 'Bracelets',
    description: 'Handcrafted bracelets and bangles',
    parent: 'jewelry-accessories',
    status: 'active',
    sortOrder: 2,
  },
  {
    title: 'Earrings',
    description: 'Beautiful African-inspired earrings',
    parent: 'jewelry-accessories',
    status: 'active',
    sortOrder: 3,
  },
  {
    title: 'Beadwork',
    description: 'Traditional African beadwork and accessories',
    parent: 'jewelry-accessories',
    status: 'active',
    sortOrder: 4,
  },
]
