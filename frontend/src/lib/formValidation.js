/**
 * Product listing validation (product management module).
 */

export function isValidHttpUrl(string) {
  if (!string || typeof string !== "string") return false;
  const t = string.trim();
  try {
    const u = new URL(t);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateProductForm(values, { isEdit = false } = {}) {
  const errors = {};
  const name = (values.name ?? "").trim();
  const description = (values.description ?? "").trim();
  const image = (values.image ?? "").trim();
  const category = values.category ?? "";
  const priceRaw = values.price;
  const price =
    typeof priceRaw === "string" ? parseFloat(priceRaw) : Number(priceRaw);

  if (!name) errors.name = "Enter a product name.";
  else if (name.length < 2)
    errors.name = "Name must be at least 2 characters.";
  else if (name.length > 120)
    errors.name = "Name must be 120 characters or fewer.";

  if (!description) errors.description = "Enter a description.";
  else if (description.length < 10)
    errors.description = "Description must be at least 10 characters.";
  else if (description.length > 5000)
    errors.description = "Description must be 5,000 characters or fewer.";

  if (priceRaw === "" || priceRaw === null || priceRaw === undefined) {
    errors.price = "Enter a price.";
  } else if (!Number.isFinite(price) || price < 0) {
    errors.price = "Enter a valid price (0 or greater).";
  } else if (price > 100_000_000) {
    errors.price = "Price is too large.";
  }

  if (!image) errors.image = "Enter an image URL.";
  else if (!isValidHttpUrl(image))
    errors.image = "Enter a valid URL starting with http:// or https://.";

  if (!category) errors.category = "Select a category.";

  if (isEdit && values.status) {
    const ok = ["Available", "Sold", "Expired"].includes(values.status);
    if (!ok) errors.status = "Select a valid status.";
  }

  return errors;
}
