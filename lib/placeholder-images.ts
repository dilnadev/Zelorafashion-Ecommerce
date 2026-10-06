// Editorial/lifestyle placeholder photography (free-to-use Unsplash images),
// used only where no real brand photography exists yet (hero, category
// tiles, editorial sections). Swap any of these from the admin panel
// (Settings -> Hero Slides, or per-category images) once real photography
// is available — nothing here is tied to actual product data.

function unsplash(id: string, params = "w=1600&q=80&auto=format&fit=crop") {
  return `https://images.unsplash.com/photo-${id}?${params}`;
}

export const PLACEHOLDER_IMAGES = {
  hero: "https://dlnpvbfottgzplbincbz.supabase.co/storage/v1/object/public/media-library/1791050576947-ChatGPT-Image-Oct-3,-2026,-11_30_36-PM-(2).png",
  featuredCollection: "https://dlnpvbfottgzplbincbz.supabase.co/storage/v1/object/public/media-library/1790917253003-ChatGPT-Image-Oct-2,-2026,-10_27_50-AM-(1).png",
  editorialBanner: "https://dlnpvbfottgzplbincbz.supabase.co/storage/v1/object/public/media-library/1790911392855-Pic-1.png",
  brandStory: "https://dlnpvbfottgzplbincbz.supabase.co/storage/v1/object/public/media-library/1791184587791-Golden-Elegance_-Layered-Jewelry-and-Ring.png",
  signature: [
    "https://dlnpvbfottgzplbincbz.supabase.co/storage/v1/object/public/media-library/1790997639548-fashion_image_500kb.jpg",
    unsplash("1790270951146-f59d639d5fa7"),
    "https://dlnpvbfottgzplbincbz.supabase.co/storage/v1/object/public/media-library/1790997645577-ChatGPT-Image-Oct-3,-2026,-08_43_25-AM-(1).png",
  ],
  categoryFallbacks: {
    dresses: unsplash("1533659828870-95ee305cee3e", "w=900&q=80&auto=format&fit=crop"),
    jewellery: unsplash("1787520543189-8ce72b56ea19", "w=900&q=80&auto=format&fit=crop"),
    handbags: unsplash("1548036328-c9fa89d128fa", "w=900&q=80&auto=format&fit=crop"),
    heels: unsplash("1543163521-1bf539c55dd2", "w=900&q=80&auto=format&fit=crop"),
  } as Record<string, string>,
  categoryDefault: unsplash("1533659828870-95ee305cee3e", "w=900&q=80&auto=format&fit=crop"),
};

export function getCategoryImage(category: { slug: string; image_url?: string | null }): string {
  if (category.image_url) return category.image_url;
  return PLACEHOLDER_IMAGES.categoryFallbacks[category.slug] ?? PLACEHOLDER_IMAGES.categoryDefault;
}
