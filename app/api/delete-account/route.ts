import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "@/lib/r2";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "No userId" }, { status: 400 });
    }

    const { data: posts } = await admin
      .from("posts")
      .select("image_urls")
      .eq("user_id", userId);

    if (posts && posts.length > 0) {
      const deletePromises = posts
        .flatMap((post) => post.image_urls || [])
        .map((url) => {
          const key = url.split("/").pop();
          if (!key) return null;
          return r2.send(
            new DeleteObjectCommand({
              Bucket: process.env.R2_BUCKET_NAME!,
              Key: key,
            })
          );
        })
        .filter((p): p is Promise<any> => p !== null);

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