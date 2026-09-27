import { LoginForm } from "./LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-paper px-4">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-xl border border-line bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-nav.svg" alt="Griham Connect" className="h-6 w-auto" />
          <h1 className="font-medium text-xl text-ink">Admin</h1>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
