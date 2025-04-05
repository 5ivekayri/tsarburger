// productsData.js
const productsData = {
  categories: [
    {
      id: 1,
      name: "Бургеры",
      items: [
        {
          id: 101,
          title: "Классический бургер", // именно "title", а не "name"
          description: "Сочная говяжья котлета...",
          price: 250,
          image: "https://example.com/burger.jpg"
        },
        // ... остальные продукты
      ]
    },
    // ... другие категории
  ]
};

export default productsData; // Важно: default export!