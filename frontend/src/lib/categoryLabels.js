const LABELS = {
  mobiles: "Mobiles",
  laptops: "Laptops",
  electronics: "Electronics",
  accessories: "Accessories",
  "notes/books": "Notes / Books",
  "boarding/rooms": "Boarding / Rooms",
  services: "Services",
};

export function formatCategoryLabel(slug) {
  return LABELS[slug] || slug;
}
