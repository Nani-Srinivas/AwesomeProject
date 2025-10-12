export const categories = [
  {
    name: "Milk, Curd & Paneer",
    image: "https://res.cloudinary.com/dponzgerb/image/upload/v1723444869/category/cq7m7yxuttemyb4tkidp.png",
    subcategories: [
      { name: "Milk", id: "milk" },
      { name: "Curd", id: "curd" },
      { name: "Paneer & Cheese", id: "paneer" }
    ]
  },
  {
    name: "Vegetables & Fruits",
    image: "https://res.cloudinary.com/dponzgerb/image/upload/v1723444869/category/uic8gcnbzknosdvva13o.png",
    subcategories: [
      { name: "Fresh Vegetables", id: "veg" },
      { name: "Fresh Fruits", id: "fruits" },
      { name: "Herbs & Exotic", id: "herbs" }
    ]
  },
  {
    name: "Munchies",
    image: "https://res.cloudinary.com/dponzgerb/image/upload/v1723444869/category/vyakccm3axdyt8yei8wc.png",
    subcategories: [
      { name: "Chips & Crisps", id: "chips" },
      { name: "Biscuits & Cookies", id: "biscuits" },
      { name: "Namkeen", id: "namkeen" }
    ]
  },
  {
    name: "Baby Care",
    image: "https://res.cloudinary.com/dponzgerb/image/upload/v1723444870/category/f6er254kgnmymlbguddd.png",
    subcategories: [
      { name: "Baby Food", id: "babyfood" },
      { name: "Diapers & Wipes", id: "diapers" },
      { name: "Bath & Skincare", id: "babycare" }
    ]
  },
  {
    name: "Home & Office",
    image: "https://res.cloudinary.com/dponzgerb/image/upload/v1723444869/category/diucqrlsuqympqtwdkip.png",
    subcategories: [
      { name: "Cleaning Supplies", id: "cleaning" },
      { name: "Stationery", id: "stationery" },
      { name: "Batteries & Tools", id: "tools" }
    ]
  },
  {
    name: "Ata, Rice & Dal",
    image: "https://res.cloudinary.com/dponzgerb/image/upload/v1723444869/category/flyjbsigiuxsd4pbwpjb.png",
    subcategories: [
      { name: "Flours", id: "flour" },
      { name: "Rice", id: "rice" },
      { name: "Pulses & Dal", id: "dal" }
    ]
  },
  {
    name: "Pharma & Wellness",
    image: "https://res.cloudinary.com/dponzgerb/image/upload/v1723444870/category/n438dcddfgrhyq9mck3z.png",
    subcategories: [
      { name: "OTC Medicines", id: "otc" },
      { name: "Supplements", id: "supplements" },
      { name: "Personal Care", id: "personal" }
    ]
  }
];


// ✅ Products mapped to Subcategories
export const products = [
  // Milk, Curd & Paneer
  { name: "Amul Gold Milk", price: 34, discountPrice: 38, quantity: "500 ml", image: "https://m.media-amazon.com/images/I/81JtQXl1LqL._AC_UL640_QL65_.jpg", category: "Milk, Curd & Paneer", subcategory: "milk" },
  { name: "Mother Dairy Toned Milk", price: 28, discountPrice: 30, quantity: "500 ml", image: "https://m.media-amazon.com/images/I/71hN0jFQKQL._AC_UL640_QL65_.jpg", category: "Milk, Curd & Paneer", subcategory: "milk" },
  { name: "Nestle Curd", price: 22, discountPrice: 25, quantity: "200 g", image: "https://m.media-amazon.com/images/I/71J1gKXQFPL._AC_UL640_QL65_.jpg", category: "Milk, Curd & Paneer", subcategory: "curd" },
  { name: "Amul Masti Dahi", price: 55, discountPrice: 60, quantity: "400 g", image: "https://m.media-amazon.com/images/I/71jD9u2+KQL._AC_UL640_QL65_.jpg", category: "Milk, Curd & Paneer", subcategory: "curd" },
  { name: "Amul Fresh Paneer", price: 85, discountPrice: 90, quantity: "200 g", image: "https://m.media-amazon.com/images/I/71X7frPSYVL._AC_UL640_QL65_.jpg", category: "Milk, Curd & Paneer", subcategory: "paneer" },

  // Vegetables & Fruits
  { name: "Tomato", price: 30, discountPrice: 35, quantity: "1 kg", image: "https://m.media-amazon.com/images/I/71vbo+AgBVL._AC_UL640_QL65_.jpg", category: "Vegetables & Fruits", subcategory: "veg" },
  { name: "Potato", price: 25, discountPrice: 30, quantity: "1 kg", image: "https://m.media-amazon.com/images/I/71Y07sC8HQL._AC_UL640_QL65_.jpg", category: "Vegetables & Fruits", subcategory: "veg" },
  { name: "Banana", price: 60, discountPrice: 70, quantity: "1 dozen", image: "https://m.media-amazon.com/images/I/71EVV6xlZyL._AC_UL640_QL65_.jpg", category: "Vegetables & Fruits", subcategory: "fruits" },
  { name: "Apple (Shimla)", price: 180, discountPrice: 200, quantity: "1 kg", image: "https://m.media-amazon.com/images/I/71FiBHYvQ9L._AC_UL640_QL65_.jpg", category: "Vegetables & Fruits", subcategory: "fruits" },
  { name: "Coriander Leaves", price: 15, discountPrice: 20, quantity: "100 g", image: "https://m.media-amazon.com/images/I/71IpP4dAzrL._AC_UL640_QL65_.jpg", category: "Vegetables & Fruits", subcategory: "herbs" },

  // Munchies
  { name: "Lay's Classic Salted", price: 20, discountPrice: 25, quantity: "52 g", image: "https://m.media-amazon.com/images/I/71d-2lAnC1L._AC_UL640_QL65_.jpg", category: "Munchies", subcategory: "chips" },
  { name: "Kurkure Masala Munch", price: 10, discountPrice: 12, quantity: "30 g", image: "https://m.media-amazon.com/images/I/71n8Zs46dEL._AC_UL640_QL65_.jpg", category: "Munchies", subcategory: "chips" },
  { name: "Oreo Chocolate Creme", price: 30, discountPrice: 35, quantity: "120 g", image: "https://m.media-amazon.com/images/I/81b22zCqFjL._AC_UL640_QL65_.jpg", category: "Munchies", subcategory: "biscuits" },
  { name: "Parle-G", price: 10, discountPrice: 12, quantity: "100 g", image: "https://m.media-amazon.com/images/I/81FQnJG6lfL._AC_UL640_QL65_.jpg", category: "Munchies", subcategory: "biscuits" },
  { name: "Haldiram's Aloo Bhujia", price: 55, discountPrice: 60, quantity: "150 g", image: "https://m.media-amazon.com/images/I/81D8BpI0gEL._AC_UL640_QL65_.jpg", category: "Munchies", subcategory: "namkeen" },
];

