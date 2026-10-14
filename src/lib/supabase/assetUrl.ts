export function withSupabaseAssetApiKey(assetUrl: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !apiKey) return assetUrl;

  try {
    const asset = new URL(assetUrl);
    const supabaseOrigin = new URL(supabaseUrl).origin;
    if (
      asset.origin !== supabaseOrigin ||
      !asset.pathname.includes("/storage/v1/") ||
      asset.searchParams.has("apikey")
    ) {
      return assetUrl;
    }

    asset.searchParams.set("apikey", apiKey);
    return asset.toString();
  } catch {
    return assetUrl;
  }
}
