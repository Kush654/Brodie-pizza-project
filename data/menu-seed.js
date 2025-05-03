const menuItems = [
  {
    id: 1,
    name: "Margherita",
    category: "Classic",
    description: "The classic pizza with fresh tomatoes, mozzarella cheese, fresh basil, salt, and extra-virgin olive oil.",
    price: 12.99,
    image: "/images/menu/margherita.jpg",
    isVegetarian: true,
    isGlutenFree: false,
    ingredients: ["Tomato Sauce", "Mozzarella", "Basil", "Olive Oil"]
  },
  {
    id: 2,
    name: "Pepperoni",
    category: "Classic",
    description: "A classic American favorite with tomato sauce, mozzarella cheese, and pepperoni.",
    price: 14.99,
    image: "/images/menu/pepperoni.jpg",
    isVegetarian: false,
    isGlutenFree: false,
    ingredients: ["Tomato Sauce", "Mozzarella", "Pepperoni"]
  },
  {
    id: 3,
    name: "Hawaiian",
    category: "Specialty",
    description: "A controversial classic topped with tomato sauce, cheese, ham, and pineapple.",
    price: 15.99,
    image: "/images/menu/hawaiian.jpg",
    isVegetarian: false,
    isGlutenFree: false,
    ingredients: ["Tomato Sauce", "Mozzarella", "Ham", "Pineapple"]
  },
  {
    id: 4,
    name: "Meat Lovers",
    category: "Specialty",
    description: "For the carnivores: pepperoni, sausage, meatballs, and bacon on a tomato and cheese base.",
    price: 18.99,
    image: "/images/menu/meat-lovers.jpg",
    isVegetarian: false,
    isGlutenFree: false,
    ingredients: ["Tomato Sauce", "Mozzarella", "Pepperoni", "Sausage", "Bacon", "Meatballs"]
  },
  {
    id: 5,
    name: "Veggie Supreme",
    category: "Vegetarian",
    description: "A vegetarian delight with bell peppers, mushrooms, onions, olives, and tomatoes.",
    price: 16.99,
    image: "/images/menu/veggie-supreme.jpg",
    isVegetarian: true,
    isGlutenFree: false,
    ingredients: ["Tomato Sauce", "Mozzarella", "Bell Peppers", "Mushrooms", "Red Onions", "Black Olives", "Tomatoes"]
  },
  {
    id: 6,
    name: "BBQ Chicken",
    category: "Specialty",
    description: "Grilled chicken, red onions, and cilantro on a BBQ sauce base.",
    price: 17.99,
    image: "/images/menu/bbq-chicken.jpg",
    isVegetarian: false,
    isGlutenFree: false,
    ingredients: ["BBQ Sauce", "Mozzarella", "Grilled Chicken", "Red Onions", "Cilantro"]
  },
  {
    id: 7,
    name: "Buffalo Chicken",
    category: "Specialty",
    description: "Spicy buffalo chicken with blue cheese and celery.",
    price: 17.99,
    image: "/images/menu/buffalo-chicken.jpg",
    isVegetarian: false,
    isGlutenFree: false,
    ingredients: ["Buffalo Sauce", "Mozzarella", "Blue Cheese", "Grilled Chicken", "Celery"]
  },
  {
    id: 8,
    name: "Mediterranean",
    category: "Vegetarian",
    description: "Feta cheese, olives, sun-dried tomatoes, and fresh herbs on an olive oil base.",
    price: 16.99,
    image: "/images/menu/mediterranean.jpg",
    isVegetarian: true,
    isGlutenFree: false,
    ingredients: ["Olive Oil", "Mozzarella", "Feta", "Black Olives", "Sun-dried Tomatoes", "Oregano"]
  },
  {
    id: 9,
    name: "Gluten-Free Veggie",
    category: "Gluten-Free",
    description: "A vegetarian pizza on our special gluten-free crust.",
    price: 18.99,
    image: "/images/menu/gluten-free-veggie.jpg",
    isVegetarian: true,
    isGlutenFree: true,
    ingredients: ["Tomato Sauce", "Vegan Cheese", "Bell Peppers", "Mushrooms", "Red Onions", "Black Olives"]
  },
  {
    id: 10,
    name: "Vegan Delight",
    category: "Vegan",
    description: "A fully vegan pizza with plant-based cheese and assorted vegetables.",
    price: 19.99,
    image: "/images/menu/vegan-delight.jpg",
    isVegetarian: true,
    isGlutenFree: false,
    ingredients: ["Tomato Sauce", "Vegan Cheese", "Artichokes", "Spinach", "Mushrooms", "Roasted Red Peppers"]
  }
];

export default menuItems; 