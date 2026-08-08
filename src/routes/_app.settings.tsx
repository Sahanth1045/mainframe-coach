import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, SectionLabel } from "@/components/interview-ui";
import { user } from "@/lib/interview-data";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Mainframe Interview Coach" },
      { name: "description", content: "Account and preferences." },
    ],
  }),
  component: SettingsPage,
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15";

function SettingsPage() {
  return (
    <AppShell title="Settings">
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Manage your account and interview preferences.</p>
        </div>

        {/* Profile */}
        <Card className="p-6">
          <SectionLabel>Profile</SectionLabel>
          <div className="mt-5 flex items-center gap-4">
            <div className="grid size-14 shrink-0 place-items-center rounded-full bg-primary/10 text-base font-semibold text-primary ring-1 ring-primary/20">
              {user.initials}
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">{user.fullName}</p>
              <p className="text-sm text-muted-foreground">{user.role} · {user.plan} Plan</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <input className={inputCls} defaultValue={user.fullName} />
            </Field>
            <Field label="Target role">
              <input className={inputCls} defaultValue={user.role} />
            </Field>
            <Field label="Email">
              <input className={inputCls} type="email" defaultValue="sahanth@example.com" />
            </Field>
            <Field label="Experience level">
              <select className={inputCls} defaultValue="Senior">
                <option>Mid-level</option>
                <option>Senior</option>
                <option>Lead</option>
              </select>
            </Field>
          </div>
        </Card>

        {/* Interview preferences */}
        <Card className="p-6">
          <SectionLabel>Interview Preferences</SectionLabel>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Default difficulty">
              <select className={inputCls} defaultValue="Intermediate">
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </Field>
            <Field label="Questions per interview">
              <select className={inputCls} defaultValue="15">
                <option>10</option>
                <option>15</option>
                <option>20</option>
              </select>
            </Field>
            <Field label="Focus topics">
              <input className={inputCls} defaultValue="COBOL, DB2, CICS" />
            </Field>
            <Field label="Time per question (min)">
              <input className={inputCls} type="number" defaultValue={3} min={1} max={10} />
            </Field>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6">
          <SectionLabel>Notifications</SectionLabel>
          <div className="mt-5 space-y-4">
            {[
              { label: "Weekly readiness summary", desc: "A digest of your progress every Monday.", on: true },
              { label: "Streak reminders", desc: "Nudge to keep your learning streak alive.", on: true },
              { label: "New practice recommendations", desc: "When the coach spots a new weak area.", on: false },
            ].map((n) => (
              <div key={n.label} className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{n.label}</p>
                  <p className="text-xs text-muted-foreground">{n.desc}</p>
                </div>
                <button
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${n.on ? "bg-primary" : "bg-muted"}`}
                >
                  <span
                    className={`absolute top-0.5 size-5 rounded-full bg-card shadow transition-all ${n.on ? "left-[22px]" : "left-0.5"}`}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex justify-end gap-2">
          <button className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Cancel
          </button>
          <button className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90">
            Save changes
          </button>
        </div>
      </div>
    </AppShell>
  );
}
