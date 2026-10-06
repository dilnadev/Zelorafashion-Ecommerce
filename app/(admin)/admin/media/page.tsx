import { getMediaAssets } from "@/lib/queries/admin-media";
import { MediaLibrary } from "@/components/admin/MediaLibrary";

export const revalidate = 0;

export default async function AdminMediaPage() {
  const result = await getMediaAssets({ page: 1, pageSize: 60 });
  return <MediaLibrary initialMedia={result.media} />;
}
