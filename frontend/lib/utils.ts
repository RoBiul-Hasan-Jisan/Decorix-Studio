export function imageUrl(path?: string) {
  if (!path) return "/placeholder.png";
  if (path.startsWith("http")) return path;
  return `${process.env.NEXT_PUBLIC_UPLOADS_URL }${path}`;
}

export function formatPrice(price: number) {
  return `৳${price.toFixed(2)}`;
}