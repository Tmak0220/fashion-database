import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "@/components/LocalizedLink"
import { getAdminClient, requireAdmin } from "@/lib/admin"
import { mergePendingEntity, publishPendingEntity } from "./actions"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Pending Data Management", robots: { index: false, follow: false } }

type Entity = {
  id: number
  name: string
  name_ja: string | null
  slug: string
  search_keywords: string | null
  created_at: string
}
type Option = { id: number; name: string; name_ja: string | null; slug: string }
type Place = { id: number; name: string; name_ja: string | null }

function PendingCard({ type, entity, targets, countries, regions }: {
  type: "brand" | "designer"
  entity: Entity
  targets: Option[]
  countries: Place[]
  regions: Place[]
}) {
  const label = type === "brand" ? "ブランド" : "デザイナー"
  return (
    <article className="rounded-2xl border border-border bg-surface p-5 sm:p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 border-b border-border/50 pb-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-subtle">Pending {type}</p>
          <h3 className="mt-1 text-xl font-medium">{entity.name}</h3>
        </div>
        <span className="text-[10px] text-subtle">ID {entity.id}</span>
      </div>

      <form action={publishPendingEntity} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="id" value={entity.id} />
        <label className="text-xs text-muted">正式名称
          <input name="name" defaultValue={entity.name} required className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-foreground" />
        </label>
        <label className="text-xs text-muted">日本語名
          <input name="name_ja" defaultValue={entity.name_ja || ""} className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-foreground" />
        </label>
        <label className="text-xs text-muted sm:col-span-2">Slug
          <input name="slug" defaultValue="" required placeholder={type === "brand" ? "helmut-lang" : "martine-rose"} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-foreground" />
        </label>
        <label className="text-xs text-muted sm:col-span-2">検索キーワード（カンマ区切り）
          <input name="search_keywords" defaultValue={entity.search_keywords || entity.name} className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-foreground" />
        </label>
        <label className="text-xs text-muted">地域
          <select name="region_id" defaultValue="" className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5">
            <option value="">未設定</option>
            {regions.map((item) => <option key={item.id} value={item.id}>{item.name_ja || item.name}</option>)}
          </select>
        </label>
        <label className="text-xs text-muted">国
          <select name="country_id" defaultValue="" className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5">
            <option value="">未設定</option>
            {countries.map((item) => <option key={item.id} value={item.id}>{item.name_ja || item.name}</option>)}
          </select>
        </label>
        <button className="sm:col-span-2 rounded-xl bg-black px-4 py-3 text-xs font-medium tracking-wider text-white hover:bg-neutral-800">
          {label}として公開
        </button>
      </form>

      <form action={mergePendingEntity} className="border-t border-dashed border-border pt-5">
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="id" value={entity.id} />
        <label className="text-xs text-muted">既存の正式レコードへ統合
          <select name="target_id" required defaultValue="" className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5">
            <option value="" disabled>統合先を選択</option>
            {targets.map((target) => <option key={target.id} value={target.id}>{target.name} {target.name_ja ? `(${target.name_ja})` : ""}</option>)}
          </select>
        </label>
        <button className="mt-3 w-full rounded-xl border border-border px-4 py-2.5 text-xs text-muted hover:border-foreground hover:text-foreground">
          統合する
        </button>
      </form>
    </article>
  )
}

export default async function AdminEntitiesPage() {
  try { await requireAdmin() } catch { notFound() }
  const admin = getAdminClient()
  const [pendingBrands, pendingDesigners, brands, designers, countries, regions] = await Promise.all([
    admin.from("brands").select("id, name, name_ja, slug, search_keywords, created_at").eq("status", "pending").order("created_at"),
    admin.from("designers").select("id, name, name_ja, slug, search_keywords, created_at").eq("status", "pending").order("created_at"),
    admin.from("brands").select("id, name, name_ja, slug").eq("status", "published").order("name"),
    admin.from("designers").select("id, name, name_ja, slug").eq("status", "published").order("name"),
    admin.from("countries").select("id, name, name_ja").order("name"),
    admin.from("regions").select("id, name, name_ja").order("name"),
  ])
  const errors = [pendingBrands, pendingDesigners, brands, designers, countries, regions].map((result) => result.error).filter(Boolean)
  if (errors.length) throw new Error(errors[0]!.message)

  return (
    <main className="mx-auto min-h-screen max-w-7xl p-6 sm:p-10 md:p-14 lg:p-16">
      <nav className="mb-10 text-[10px] uppercase tracking-[0.15em] text-subtle"><Link href="/mypage">My Page</Link> / Admin</nav>
      <div className="border-b border-border pb-8">
        <p className="type-label text-[11px] text-subtle">ADMINISTRATION</p>
        <h1 className="mt-3 type-display text-4xl sm:text-5xl">PENDING DATA</h1>
        <p className="mt-3 text-xs leading-6 text-muted">未登録として作成されたブランド・デザイナーを正式化、または既存データへ統合します。</p>
      </div>

      <section className="mt-12">
        <h2 className="text-xl">Brands <span className="text-sm text-subtle">({pendingBrands.data?.length || 0})</span></h2>
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(pendingBrands.data || []).map((entity) => <PendingCard key={entity.id} type="brand" entity={entity} targets={brands.data || []} countries={countries.data || []} regions={regions.data || []} />)}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-xl">Designers <span className="text-sm text-subtle">({pendingDesigners.data?.length || 0})</span></h2>
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(pendingDesigners.data || []).map((entity) => <PendingCard key={entity.id} type="designer" entity={entity} targets={designers.data || []} countries={countries.data || []} regions={regions.data || []} />)}
        </div>
      </section>
    </main>
  )
}
