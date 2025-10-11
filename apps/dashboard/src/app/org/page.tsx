import { OrgList } from "../../components/org/org-list";

export default function Page() {
  return (
    <main className="min-h-dvh">
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <OrgList />
      </div>
    </main>
  );
}
