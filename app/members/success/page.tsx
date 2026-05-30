export default function MembersSuccessPage() {

    return (
      <main className="min-h-screen p-10 md:p-14 lg:p-16">
  
        <div className="max-w-2xl">
  
          <p
            className="type-label text-[11px] text-subtle"
            style={{
              letterSpacing: "0.12em",
              paddingRight: "0.12em",
            }}
          >
            MEMBERSHIP
          </p>
  
          <h1 className="mt-8 type-display text-5xl md:text-6xl">
            PAYMENT SUCCESS
          </h1>
  
          <p className="mt-4 text-base tracking-[0.12em] text-muted font-medium">
            決済が完了しました
          </p>
  
          <p className="mt-10 text-[15px] leading-8 text-muted">
            PLUS MEMBERへの登録ありがとうございます。
            サブスクリプションが有効化されました。
          </p>
  
        </div>
  
      </main>
    )
  }