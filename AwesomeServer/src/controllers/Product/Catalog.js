
const categories = [
  { id: '1', name: 'Fresh Vegetables', image: 'https://picsum.photos/id/102/80/80' },
  { id: '2', name: 'Fresh Fruits', image: 'https://picsum.photos/id/103/80/80' },
  { id: '3', name: 'Exotics', image: 'https://picsum.photos/id/104/80/80' },
  { id: '4', name: 'Coriander & Others', image: 'https://picsum.photos/id/105/80/80' },
  { id: '5', name: 'Flowers & Leaves', image: 'https://picsum.photos/id/106/80/80' },
];

const products = [
  {
    id: '1',
    name: 'Royal Gala Apple - Kashmir',
    category: 'Fresh Fruits',
    subcategory: 'Apples',
    tag: "Season's best",
    weight: '2 pieces (300-350 g)',
    time: '23 MINS',
    discount: '20% OFF',
    price: 99,
    mrp: 125,
    image: 'https://picsum.photos/id/110/300/300',
  },
  {
    id: '2',
    name: 'Nagpur Orange (Narinja Pandu)',
    category: 'Fresh Fruits',
    subcategory: 'Oranges',
    tag: "Season's best",
    weight: '500-600 g',
    time: '23 MINS',
    discount: '21% OFF',
    price: 54,
    mrp: 69,
    image: 'https://picsum.photos/id/111/300/300',
  },
  {
    id: '3',
    name: 'Shine Muscat Green Grapes',
    category: 'Exotics',
    subcategory: 'Grapes',
    tag: 'Imported',
    weight: '250 g',
    time: '23 MINS',
    discount: '27% OFF',
    price: 145,
    mrp: 200,
    image: 'https://picsum.photos/id/112/300/300',
  },
  {
    id: '4',
    name: 'Zespri Sungold Kiwi',
    category: 'Exotics',
    subcategory: 'Kiwis',
    tag: 'Imported',
    weight: '2 pieces',
    time: '23 MINS',
    discount: '25% OFF',
    price: 140,
    mrp: 189,
    image: 'https://picsum.photos/id/113/300/300',
  },
];

export const getCategories = async (req, reply) => {
  return categories;
};

export const getProducts = async (req, reply) => {
  return products;
};
