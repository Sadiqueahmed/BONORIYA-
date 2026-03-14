import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@bonoriya.com' },
    update: {},
    create: {
      email: 'admin@bonoriya.com',
      password: hashedPassword,
      name: 'Bonoriya Admin',
    },
  });

  console.log('Created admin:', admin.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'rice-bowls' },
      update: {},
      create: {
        name: 'Rice Bowls',
        slug: 'rice-bowls',
        icon: 'bowl',
        order: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'fried-rice' },
      update: {},
      create: {
        name: 'Fried Rice',
        slug: 'fried-rice',
        icon: 'rice',
        order: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'salads' },
      update: {},
      create: {
        name: 'Salads',
        slug: 'salads',
        icon: 'salad',
        order: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'combos' },
      update: {},
      create: {
        name: 'Seasonal Combos',
        slug: 'combos',
        icon: 'utensils',
        order: 4,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'beverages' },
      update: {},
      create: {
        name: 'Beverages',
        slug: 'beverages',
        icon: 'cup',
        order: 5,
      },
    }),
  ]);

  console.log('Created categories:', categories.length);

  // Get the rice bowls category for menu items
  const riceBowlsCategory = categories.find(c => c.slug === 'rice-bowls');
  const friedRiceCategory = categories.find(c => c.slug === 'fried-rice');
  const saladsCategory = categories.find(c => c.slug === 'salads');
  const combosCategory = categories.find(c => c.slug === 'combos');
  const beveragesCategory = categories.find(c => c.slug === 'beverages');

  if (riceBowlsCategory) {
    // Create menu items for Rice Bowls
    const riceBowlItems = [
      {
        name: 'The 21 Bowl (Veg)',
        description: 'A complete wholesome meal with steamed rice, crispy fries, seasonal vegetables, and traditional Assamese sides. Perfect for a healthy lunch!',
        price: 140,
        isVeg: true,
        isPopular: true,
        categoryId: riceBowlsCategory.id,
        order: 1,
      },
      {
        name: 'The 21 Bowl (Chicken)',
        description: 'Signature rice bowl with tender chicken pieces, assorted vegetables, and authentic tribal spices. A customer favorite!',
        price: 180,
        isVeg: false,
        isPopular: true,
        categoryId: riceBowlsCategory.id,
        order: 2,
      },
      {
        name: 'The 21 Bowl (Pork)',
        description: 'Traditional pork preparation with ethnic spices, served with rice and seasonal vegetables. Experience authentic tribal flavors!',
        price: 200,
        isVeg: false,
        isPopular: true,
        categoryId: riceBowlsCategory.id,
        order: 3,
      },
      {
        name: 'The Tribal Bowl (Chicken)',
        description: 'A special tribal-style chicken preparation with indigenous herbs and spices, served with fragrant rice and local greens.',
        price: 190,
        isVeg: false,
        isPopular: false,
        categoryId: riceBowlsCategory.id,
        order: 4,
      },
      {
        name: 'The Tribal Bowl (Pork)',
        description: 'Authentic tribal recipe with slow-cooked pork, traditional bamboo shoot, and aromatic rice. A true taste of Assam!',
        price: 220,
        isVeg: false,
        isPopular: false,
        categoryId: riceBowlsCategory.id,
        order: 5,
      },
    ];

    for (const item of riceBowlItems) {
      await prisma.menuItem.upsert({
        where: { name: item.name },
        update: {},
        create: item,
      });
    }
  }

  if (friedRiceCategory) {
    const friedRiceItems = [
      {
        name: 'Mixed Fried Rice',
        description: 'Wok-tossed rice with fresh vegetables, eggs, and choice of protein. Light, flavorful, and satisfying!',
        price: 150,
        isVeg: false,
        isPopular: false,
        categoryId: friedRiceCategory.id,
        order: 1,
      },
      {
        name: 'Veg Fried Rice',
        description: 'Fluffy rice stir-fried with colorful vegetables and aromatic spices. Simple yet delicious!',
        price: 120,
        isVeg: true,
        isPopular: false,
        categoryId: friedRiceCategory.id,
        order: 2,
      },
    ];

    for (const item of friedRiceItems) {
      await prisma.menuItem.upsert({
        where: { name: item.name },
        update: {},
        create: item,
      });
    }
  }

  if (saladsCategory) {
    await prisma.menuItem.create({
      data: {
        name: 'Fresh Garden Salad',
        description: 'Crisp seasonal vegetables with a light vinaigrette dressing. Healthy and refreshing!',
        price: 80,
        isVeg: true,
        isPopular: false,
        categoryId: saladsCategory.id,
        order: 1,
      },
    });
  }

  if (combosCategory) {
    await prisma.menuItem.create({
      data: {
        name: 'Family Feast Combo',
        description: 'Perfect for sharing! Includes 2 rice bowls, 1 fried rice, and beverages. Great value for families!',
        price: 450,
        isVeg: false,
        isPopular: true,
        categoryId: combosCategory.id,
        order: 1,
      },
    });
  }

  if (beveragesCategory) {
    const beverageItems = [
      {
        name: 'Fresh Lime Soda',
        description: 'Refreshing lime soda with a hint of mint. Perfect companion for your meal!',
        price: 40,
        isVeg: true,
        isPopular: false,
        categoryId: beveragesCategory.id,
        order: 1,
      },
      {
        name: 'Assam Tea',
        description: 'Authentic Assamese tea brewed to perfection. Experience the taste of the land!',
        price: 30,
        isVeg: true,
        isPopular: false,
        categoryId: beveragesCategory.id,
        order: 2,
      },
    ];

    for (const item of beverageItems) {
      await prisma.menuItem.create({
        data: item,
      });
    }
  }

  console.log('Created menu items');

  // Create testimonials
  const testimonials = [
    {
      name: 'Rahul Sharma',
      rating: 5,
      comment: 'Food, atmosphere and service is really good. The 21 Bowl is absolutely delicious and the portion size is generous. Will definitely come back!',
      source: 'Google',
      order: 1,
    },
    {
      name: 'Priya Das',
      rating: 5,
      comment: 'Best ethnic food bowl at an affordable price in the entire locality. The tribal bowl with pork is a must-try! Authentic flavors of Assam.',
      source: 'Zomato',
      order: 2,
    },
    {
      name: 'Amit Kalita',
      rating: 5,
      comment: 'Great place, good and friendly people and very delicious meal. The eco-friendly packaging is a big plus. Love the concept!',
      source: 'Swiggy',
      order: 3,
    },
    {
      name: 'Sneha Bora',
      rating: 4,
      comment: 'Comfort food at its best! The flavours were rich and authentic. Reminds me of home-cooked meals. Highly recommended for students near RGU.',
      source: 'Google',
      order: 4,
    },
    {
      name: 'Vikram Hazarika',
      rating: 5,
      comment: 'Feels like homely food, made with care and attention to health. The prices are very reasonable and quality is top-notch. My go-to place for lunch!',
      source: 'Google',
      order: 5,
    },
  ];

  for (const testimonial of testimonials) {
    await prisma.testimonial.create({
      data: testimonial,
    });
  }

  console.log('Created testimonials');

  // Create branches
  await prisma.branch.create({
    data: {
      name: 'Bonoriya Betkuchi',
      address: 'Dhani Ram Boro Path, Betkuchi, Guwahati, Assam 781040',
      landmark: 'Behind Maa Medicos, Near RGU',
      phone: '+91 9876543210',
      openTime: '12:00 PM',
      closeTime: '10:00 PM',
      daysOpen: 'Mon-Sat',
      isMain: true,
      order: 1,
      mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3586.123456789!2d91.123456!3d26.123456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDA3JzI0LjQiTiA5McKwMDcnMjQuNCJF!5e0!3m2!1sen!2sin!4v1234567890',
    },
  });

  await prisma.branch.create({
    data: {
      name: 'Bonoriya Narengi Tiniali',
      address: 'Narengi Tiniali, Guwahati, Assam',
      landmark: 'Main Road',
      openTime: '12:00 PM',
      closeTime: '10:00 PM',
      daysOpen: 'Mon-Sat',
      isMain: false,
      order: 2,
    },
  });

  console.log('Created branches');

  // Create site settings
  const settings = [
    { key: 'siteName', value: 'Bonoriya' },
    { key: 'tagline', value: 'Ethnic rice bowls for modern lives' },
    { key: 'instagram', value: '@bonoriyafood' },
    { key: 'zomato', value: 'https://www.zomato.com/bonoriya' },
    { key: 'swiggy', value: 'https://www.swiggy.com/bonoriya' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log('Created settings');
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
