// Fallback posts used when the posts API is unavailable.
// Default export: FALLBACK_POSTS (array)
// Named export: findFallbackPost(id) -> returns a shallow-cloned post or null

const FALLBACK_POSTS = [
  {
    id: "1",
    title: "A Day in the Studio",
    content:
      "We spent the day capturing our newest collection. Natural light, coffee, and lots of laughter went into every frame.",
    created_at: "2024-08-15T10:30:00Z",
    thumbnail: "https://picsum.photos/640/360?random=1",
  },
  {
    id: "2",
    title: "Sustainable Fabrics: What You Need to Know",
    content:
      "Our team explores sustainable fabric sources and how they affect the lifecycle of a garment.",
    created_at: "2024-06-03T09:00:00Z",
    thumbnail: "https://picsum.photos/640/360?random=2",
  },
  {
    id: "3",
    title: "Behind The Seams",
    content:
      "We take you behind the scenes to meet the makers and designers shaping our seasonal drops.",
    created_at: "2024-04-22T14:45:00Z",
    thumbnail: "https://picsum.photos/640/360?random=3",
  },
  {
    id: "4",
    title: "Design Notes: The New Tailoring",
    // include a small piece of HTML to test sanitized rendering in PostDetail
    content:
      "<p>Our tailoring this season favors <strong>soft</strong> shoulders and a relaxed waist—designed for everyday comfort.</p><p>Read on for material choices and pattern details.</p>",
    created_at: "2024-09-10T08:15:00Z",
    thumbnail: "https://picsum.photos/640/360?random=4",
  },
  {
    id: "5",
    title: "Meet the Team: Atelier Tour",
    content:
      "A short tour of the atelier where concepts become reality. Expect sketches, prototypes, and the occasional fabric spill.",
    created_at: "2024-11-01T12:00:00Z",
    thumbnail: "https://picsum.photos/640/360?random=5",
  },
  {
    id: "6",
    title: "Holiday Collection Preview",
    content:
      "Sneak peek at the color palette and accessories heading into the holiday season. Cozy knits meet metallic accents.",
    created_at: "2024-12-01T07:30:00Z",
    thumbnail: "https://picsum.photos/640/360?random=6",
  },
];

function findFallbackPost(id) {
  if (id == null) return null;
  const needle = String(id);
  const found = FALLBACK_POSTS.find((p) => String(p.id) === needle);
  if (!found) return null;
  // return a shallow clone to avoid accidental mutation by consumers
  return { ...found };
}

export { findFallbackPost };
export default FALLBACK_POSTS;
