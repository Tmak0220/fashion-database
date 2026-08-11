"use server"

import { revalidatePath } from "next/cache"
import { getAdminClient, requireAdmin } from "@/lib/admin"
import { normalizeEntityName } from "@/lib/entity-resolution"

type EntityType = "brand" | "designer"

function parseType(value: FormDataEntryValue | null): EntityType {
  if (value !== "brand" && value !== "designer") throw new Error("種別が不正です")
  return value
}

function requiredText(formData: FormData, key: string) {
  const value = String(formData.get(key) || "").trim()
  if (!value) throw new Error(`${key}は必須です`)
  return value
}

export async function publishPendingEntity(formData: FormData) {
  await requireAdmin()
  const admin = getAdminClient()
  const type = parseType(formData.get("type"))
  const table = type === "brand" ? "brands" : "designers"
  const id = Number(formData.get("id"))
  const name = requiredText(formData, "name")
  const slug = requiredText(formData, "slug").toLowerCase()
  if (!Number.isInteger(id) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("IDまたはslugが不正です")
  }

  const numberOrNull = (key: string) => {
    const value = String(formData.get(key) || "").trim()
    return value ? Number(value) : null
  }
  const payload = {
    name,
    name_ja: String(formData.get("name_ja") || "").trim() || null,
    slug,
    search_keywords: String(formData.get("search_keywords") || "").trim() || name,
    country_id: numberOrNull("country_id"),
    region_id: numberOrNull("region_id"),
    normalized_name: normalizeEntityName(name),
    status: "published",
  }

  const { error } = await admin.from(table).update(payload).eq("id", id).eq("status", "pending")
  if (error) throw new Error(error.message)

  if (type === "brand") {
    const { data: collections, error: collectionError } = await admin
      .from("collections")
      .select("id, year, season")
      .eq("brand_id", id)
    if (collectionError) throw new Error(collectionError.message)

    for (const collection of collections || []) {
      const { error: slugError } = await admin
        .from("collections")
        .update({ slug: `${slug}-${collection.year}-${collection.season}` })
        .eq("id", collection.id)
      if (slugError) throw new Error(slugError.message)
    }
  }
  revalidatePath("/admin/entities")
}

async function mergeBrand(admin: ReturnType<typeof getAdminClient>, pendingId: number, targetId: number, targetSlug: string) {
  const { data: pendingCollections } = await admin
    .from("collections").select("id, year, season, designer_id").eq("brand_id", pendingId)

  for (const collection of pendingCollections || []) {
    const slug = `${targetSlug}-${collection.year}-${collection.season}`
    const { data: targetCollection, error } = await admin.from("collections").upsert({
      brand_id: targetId, designer_id: collection.designer_id,
      year: collection.year, season: collection.season, slug,
    }, { onConflict: "brand_id,year,season" }).select("id").single()
    if (error || !targetCollection) throw new Error(error?.message || "コレクション統合に失敗しました")
    await admin.from("posts").update({ collection_id: targetCollection.id }).eq("collection_id", collection.id)
    await admin.from("collections").delete().eq("id", collection.id)
  }

  const updates = await Promise.all([
    admin.from("posts").update({ brand_id: targetId }).eq("brand_id", pendingId),
    admin.from("brand_follows").update({ brand_id: targetId }).eq("brand_id", pendingId),
    admin.from("brand_designers").update({ brand_id: targetId }).eq("brand_id", pendingId),
  ])
  const failed = updates.find((result) => result.error)
  if (failed?.error) throw new Error(failed.error.message)
}

async function mergeDesigner(admin: ReturnType<typeof getAdminClient>, pendingId: number, targetId: number) {
  const updates = await Promise.all([
    admin.from("posts").update({ designer_id: targetId }).eq("designer_id", pendingId),
    admin.from("collections").update({ designer_id: targetId }).eq("designer_id", pendingId),
    admin.from("designer_follows").update({ designer_id: targetId }).eq("designer_id", pendingId),
    admin.from("brand_designers").update({ designer_id: targetId }).eq("designer_id", pendingId),
  ])
  const failed = updates.find((result) => result.error)
  if (failed?.error) throw new Error(failed.error.message)
}

export async function mergePendingEntity(formData: FormData) {
  await requireAdmin()
  const admin = getAdminClient()
  const type = parseType(formData.get("type"))
  const table = type === "brand" ? "brands" : "designers"
  const pendingId = Number(formData.get("id"))
  const targetId = Number(formData.get("target_id"))
  if (!Number.isInteger(pendingId) || !Number.isInteger(targetId) || pendingId === targetId) {
    throw new Error("統合先が不正です")
  }

  const [{ data: pending }, { data: target }] = await Promise.all([
    admin.from(table).select("id, status").eq("id", pendingId).maybeSingle(),
    admin.from(table).select("id, slug, status").eq("id", targetId).maybeSingle(),
  ])
  if (!pending || pending.status !== "pending" || !target || target.status !== "published") {
    throw new Error("pendingレコードまたは統合先が見つかりません")
  }

  if (type === "brand") await mergeBrand(admin, pendingId, targetId, target.slug)
  else await mergeDesigner(admin, pendingId, targetId)

  const { error } = await admin.from(table).delete().eq("id", pendingId).eq("status", "pending")
  if (error) throw new Error(error.message)
  revalidatePath("/admin/entities")
}
