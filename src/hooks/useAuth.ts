"use client";

import { useAuthContext } from "@/components/layout/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";

export function useAuth() {
  const ctx = useAuthContext();
  const router = useRouter();
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    },
    [supabase.auth]
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string, fullName: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      return { data, error };
    },
    [supabase.auth]
  );

  const signOut = useCallback(async () => {
    await ctx.signOut();
    router.push("/");
  }, [ctx, router]);

  return {
    user: ctx.user,
    loading: ctx.loading,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };
}
