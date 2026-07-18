/**
 * Cloudinary helper for displaying optimized property images.
 *
 * SETUP REQUIRED (one-time, on cloudinary.com):
 * 1. Create free Cloudinary account
 * 2. Get your "cloud name" from the dashboard
 * 3. Create an unsigned upload preset (Settings > Upload > Add upload preset > Signing mode: Unsigned)
 * 4. Replace CLOUD_NAME and UPLOAD_PRESET below
 * 5. Admin dashboard uploads property photos here; the resulting URLs go into
 *    the `properties.images` array column in Supabase — the mobile app just
 *    displays whatever URLs are in that array, no further wiring needed here.
 */

const CLOUD_NAME = 'rolzokpw';
const UPLOAD_PRESET = 'bookam_unsigned'; // <-- replace with your unsigned preset name

/**
 * Returns an optimized, auto-format, auto-quality Cloudinary URL
 * sized appropriately for the given display context.
 */
export function optimizedImageUrl(
  url: string | undefined,
  width: number = 800
): string | undefined {
  if (!url) return undefined;
  // If it's not a Cloudinary URL (e.g. a raw Supabase Storage URL), return as-is
  if (!url.includes('res.cloudinary.com')) return url;

  // Inject transformation params right after /upload/
  return url.replace('/upload/', `/upload/w_${width},q_auto,f_auto/`);
}

/**
 * Uploads an image (as a local file URI from expo-image-picker) to Cloudinary.
 * Used by admin-side property photo upload — included here so the same
 * helper can be reused if the guest app ever needs user-uploaded images
 * (e.g. review photos in a future version).
 */
export async function uploadToCloudinary(localUri: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', {
    uri: localUri,
    type: 'image/jpeg',
    name: 'upload.jpg',
  } as any);
  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) {
    throw new Error('Image upload failed');
  }

  const data = await response.json();
  return data.secure_url;
}