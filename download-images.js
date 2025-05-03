const fs = require('fs');
const path = require('path');
const https = require('https');

// Create directory if it doesn't exist
const imageDir = path.join(__dirname, 'public', 'images', 'menu');
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
  console.log(`Created directory: ${imageDir}`);
}

// Instead of downloading from external sources, let's create placeholder images
const createPlaceholderImage = (filename, content) => {
  const filePath = path.join(imageDir, filename);
  
  // Create a simple SVG placeholder with the pizza name
  const svgContent = `
  <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f8d568"/>
    <circle cx="150" cy="150" r="120" fill="#e25822"/>
    <circle cx="150" cy="150" r="100" fill="#ffc425"/>
    <text x="150" y="110" font-family="Arial" font-size="18" fill="#000" text-anchor="middle">${content}</text>
    <text x="150" y="160" font-family="Arial" font-size="24" font-weight="bold" fill="#000" text-anchor="middle">Pizza</text>
  </svg>
  `;
  
  fs.writeFileSync(filePath, svgContent);
  console.log(`Created placeholder image: ${filename}`);
  
  return filePath;
};

// List of menu items for which we need placeholders
const menuItems = [
  { filename: 'margherita.jpg', label: 'Margherita' },
  { filename: 'pepperoni.jpg', label: 'Pepperoni' },
  { filename: 'hawaiian.jpg', label: 'Hawaiian' },
  { filename: 'meat-lovers.jpg', label: 'Meat Lovers' },
  { filename: 'veggie-supreme.jpg', label: 'Veggie Supreme' },
  { filename: 'bbq-chicken.jpg', label: 'BBQ Chicken' },
  { filename: 'buffalo-chicken.jpg', label: 'Buffalo Chicken' },
  { filename: 'mediterranean.jpg', label: 'Mediterranean' },
  { filename: 'gluten-free-veggie.jpg', label: 'Gluten-Free Veggie' },
  { filename: 'vegan-delight.jpg', label: 'Vegan Delight' }
];

// Create all placeholder images
const createAllPlaceholders = () => {
  console.log('Creating placeholder images for menu items...');
  
  menuItems.forEach(item => {
    createPlaceholderImage(item.filename, item.label);
  });
  
  console.log('All placeholder images created successfully!');
  console.log('Images are now available at /images/menu/ for your menu items.');
  console.log('Note: These are basic SVG placeholders. You should replace them with real images in production.');
};

// Execute
createAllPlaceholders(); 