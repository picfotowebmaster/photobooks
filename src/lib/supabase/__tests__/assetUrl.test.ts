import { afterEach, describe, expect, it, vi } from "vitest";
import { withSupabaseAssetApiKey } from "../assetUrl";

describe("withSupabaseAssetApiKey", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("adds the public API key to direct Storage asset URLs", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "public-key");

    const result = new URL(
      withSupabaseAssetApiKey(
        "https://project.supabase.co/storage/v1/object/public/covers/image.jpg"
      )
    );

    expect(result.searchParams.get("apikey")).toBe("public-key");
  });

  it("preserves existing keys and does not modify external asset URLs", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "public-key");

    const withExistingKey =
      "https://project.supabase.co/storage/v1/object/sign/photos/image.jpg?token=signed&apikey=existing";
    const external = "https://cdn.example.com/image.jpg";

    expect(withSupabaseAssetApiKey(withExistingKey)).toBe(withExistingKey);
    expect(withSupabaseAssetApiKey(external)).toBe(external);
  });
});
