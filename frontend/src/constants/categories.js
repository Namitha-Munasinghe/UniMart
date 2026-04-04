export const PRODUCT_CATEGORIES = [
  "mobiles",
  "laptops",
  "electronics",
  "accessories",
  "notes/books",
  "boarding/rooms",
  "services",
];

export const CATEGORY_LABELS = {
  mobiles: "Mobiles",
  laptops: "Laptops",
  electronics: "Electronics",
  accessories: "Accessories",
  "notes/books": "Notes & books",
  "boarding/rooms": "Boarding & rooms",
  services: "Services",
};

export const categoryDisplayName = (slug) => CATEGORY_LABELS[slug] || slug;
