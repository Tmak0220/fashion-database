import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "@/lib/r2";
import { createClient as createServerClient } from "@/lib/supabase-server";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    const userId = user?.id;

    if (userError || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: posts } = await admin
      .from("posts")
      .select("image_urls")
      .eq("user_id", userId);

    if (posts && posts.length > 0) {
      const bucketDomain = `${process.env.R2_BUCKET_NAME!}.r2.dev`;

      const deletePromises = posts
        .flatMap((post) => post.image_urls || [])
        .map((url) => {
          let key = "";
          if (url.includes(bucketDomain)) {
            key = url.split(`${bucketDomain}/`)[1];
          } else {
            const urlObj = new URL(url);
            key = urlObj.pathname.substring(1);
          }

          if (!key) return null;

          return r2.send(
            new DeleteObjectCommand({
              Bucket: process.env.R2_BUCKET_NAME!,
              Key: decodeURIComponent(key),
            })
          );
        })
        .filter((promise) => promise !== null);

      await Promise.all(deletePromises);
    }

    const { error: dbError } = await admin
      .from("users")
      .delete()
      .eq("id", userId);

    if (dbError) throw dbError;

    const { error: authError } = await admin.auth.admin.deleteUser(userId);
    if (authError) throw authError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
