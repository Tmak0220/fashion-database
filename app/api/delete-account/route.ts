import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { DeleteObjectsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { r2 } from "@/lib/r2";
import { getRequestUser } from "@/lib/request-auth";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function deleteUserObjects(userId: string) {
  const bucket = process.env.R2_BUCKET_NAME!;
  const prefixes = [
    `posts/${userId}/`,
    `avatars/${userId}/`,
    `tmp/${userId}/`,
    `${userId}/`, // Legacy root-level uploads.
  ];

  for (const prefix of prefixes) {
    let continuationToken: string | undefined;

    do {
      const listed = await r2.send(new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }));
      const objects = (listed.Contents || [])
        .flatMap((object) => object.Key ? [{ Key: object.Key }] : []);

      if (objects.length > 0) {
        const deleted = await r2.send(new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: { Objects: objects, Quiet: true },
        }));
        if (deleted.Errors?.length) {
          throw new Error(`R2 deletion failed for ${deleted.Errors.length} object(s)`);
        }
      }

      continuationToken = listed.IsTruncated ? listed.NextContinuationToken : undefined;
    } while (continuationToken);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getRequestUser(request);
    const userId = user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await deleteUserObjects(userId);

    // Deleting auth.users cascades to users, profiles, posts, post_tags,
    // bookmarks, likes, and every follow table through database constraints.
    const { error: authError } = await admin.auth.admin.deleteUser(userId);
    if (authError) throw authError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
