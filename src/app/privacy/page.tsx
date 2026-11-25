import Link from "next/link";
import { APP_NAME, COPYRIGHT, PRIVACY_POLICY_URL } from "@/lib/site";

export const metadata = {
  title: `プライバシーポリシー | ${APP_NAME}`,
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col border-x-2 border-ink bg-[#f8f7f4]">
      <header className="shrink-0 border-b-2 border-ink bg-white px-4 py-4">
        <Link
          href="/"
          className="text-[11px] font-bold text-ink-soft underline-offset-2 hover:underline"
        >
          ← ホーム
        </Link>
        <h1 className="mt-2 text-[20px] font-extrabold text-ink">
          プライバシーポリシー
        </h1>
        <p className="mt-1 text-[12px] text-muted">{APP_NAME}</p>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 text-[13px] leading-relaxed text-ink-soft">
        <p>
          本ポリシーの最新版は、公開用ページでもご覧いただけます。
        </p>
        <p>
          <a
            href={PRIVACY_POLICY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-ink underline underline-offset-2"
          >
            公開版を開く
          </a>
        </p>
        <p className="text-[11px] text-muted">{COPYRIGHT}</p>
      </div>
    </main>
  );
}
