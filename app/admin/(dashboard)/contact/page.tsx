import { updateContactStatusAction } from "@/app/actions/admin/catalogue";
import { prisma } from "@/lib/prisma";
import {
  AdminPageHeader,
  AdminSubmit,
  Notice,
  Panel,
  StatusBadge,
} from "@/components/admin/AdminUI";

export const dynamic = "force-dynamic";

export const metadata = { title: "Messages" };

const STATUSES = ["NEW", "READ", "REPLIED"] as const;
const STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  READ: "Read",
  REPLIED: "Replied",
};

/**
 * General contact messages — a separate queue from stockist enquiries, matching the separate
 * table and separate submission flow on the public site.
 */
export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const params = await searchParams;

  const messages = await prisma.contactMessage.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return (
    <>
      <AdminPageHeader
        title="Messages"
        description={`${messages.length} message${messages.length === 1 ? "" : "s"} from the contact form.`}
      />

      {params.saved ? <Notice>Message updated.</Notice> : null}

      {messages.length === 0 ? (
        <Panel>
          <p className="text-[0.9rem] text-muted">No messages yet.</p>
        </Panel>
      ) : (
        <div className="grid gap-5">
          {messages.map((message) => (
            <Panel key={message.id}>
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-serif text-[1.1rem] text-oxblood">
                    {message.name}
                  </h2>
                  <a
                    href={`mailto:${message.email}`}
                    className="text-[0.82rem] text-ruby underline underline-offset-[3px]"
                  >
                    {message.email}
                  </a>
                  <span className="ml-3 text-[0.78rem] text-muted">
                    {message.createdAt.toISOString().slice(0, 10)}
                  </span>
                </div>
                <StatusBadge
                  status={message.status}
                  label={STATUS_LABELS[message.status] ?? message.status}
                />
              </div>

              <p className="mb-4 whitespace-pre-wrap rounded border border-line bg-blush px-4 py-3 text-[0.88rem]">
                {message.message}
              </p>

              <form
                action={updateContactStatusAction}
                className="flex flex-wrap items-end gap-3 border-t border-line pt-4"
              >
                <input type="hidden" name="id" value={message.id} />
                <div>
                  <label
                    htmlFor={`status-${message.id}`}
                    className="mb-[0.35rem] block text-[0.72rem] uppercase tracking-[0.08em] text-muted"
                  >
                    Status
                  </label>
                  <select
                    id={`status-${message.id}`}
                    name="status"
                    defaultValue={message.status}
                    className="rounded border border-line bg-white px-3 py-2 text-[0.9rem] focus:border-ruby focus:outline-none"
                  >
                    {STATUSES.map((value) => (
                      <option key={value} value={value}>
                        {STATUS_LABELS[value]}
                      </option>
                    ))}
                  </select>
                </div>
                <AdminSubmit>Update</AdminSubmit>
              </form>
            </Panel>
          ))}
        </div>
      )}
    </>
  );
}
