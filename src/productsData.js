// productsData.js
const productsData = {
  categories: [
    {
      id: 1,
      name: "Бургеры",
      items: [
        {
          id: 101,
          title: "Классический бургер",
          description: "Сочная говяжья котлета...",
          price: 250,
          image: "https://burgerkings.ru/image/cache/catalog/photo/598999973-chizburger-600x600.jpg"
        },
        {
          id: 102,
          title: "Чикенбургер",
          description: "Сочная куриная котлета...",
          price: 125,
          image: "https://vkusnotochkamenu.ru/image/cache/catalog/photo/309628971-chikenburger-600x600.jpg"
        }
      ]
    },
    // ... другие категории (добавляйте аналогично)
  ]
};

export default productsData;