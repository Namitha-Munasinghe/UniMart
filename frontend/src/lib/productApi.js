const BASE = "/api/product";

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.message || res.statusText || "Request failed";
    throw new Error(msg);
  }
  return data;
}

export function getSellerId() {
  return localStorage.getItem("unimart_sellerId") || "demo-seller-1";
}

export function setSellerId(id) {
  localStorage.setItem("unimart_sellerId", id);
}

export async function fetchCategories() {
  const res = await fetch(`${BASE}/categories`);
  return handle(res);
}

export async function fetchPublicProducts(category) {
  const q = category
    ? `?category=${encodeURIComponent(category)}`
    : "";
  const res = await fetch(`${BASE}/public${q}`);
  return handle(res);
}

export async function fetchProduct(id) {
  const res = await fetch(`${BASE}/${id}`);
  return handle(res);
}

export async function fetchMyProducts(sellerId) {
  const res = await fetch(
    `${BASE}/my?sellerId=${encodeURIComponent(sellerId)}`
  );
  return handle(res);
}

export async function createProduct(body) {
  const res = await fetch(`${BASE}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handle(res);
}

// Create product with an uploaded image file (multipart/form-data)
export async function createProductWithImage(formData) {
  const res = await fetch(`${BASE}/`, {
    method: "POST",
    body: formData,
  });
  return handle(res);
}

export async function updateProduct(id, body) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handle(res);
}

// Update product with optional image file (multipart/form-data)
export async function updateProductWithImage(id, formData) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    body: formData,
  });
  return handle(res);
}

export async function deleteProduct(id, sellerId) {
  const res = await fetch(
    `${BASE}/${id}?sellerId=${encodeURIComponent(sellerId)}`,
    { method: "DELETE" }
  );
  return handle(res);
}

export async function fetchPriceSuggestion(body) {
  const res = await fetch(`${BASE}/suggest-price`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handle(res);
}
