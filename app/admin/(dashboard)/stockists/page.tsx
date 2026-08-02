import { updateStockistStatusAction } from "@/app/actions/admin/catalogue";
import { prisma } from "@/lib/prisma";
import {
  AdminPageHeader,
  AdminSubmit,
  Notice,
  Panel,
  StatusBadge,
} from "@/components/admin/AdminUI";

export const dynamic = "force-dynamic";

export const metadata = { title: "Stockist enquiries" };

const STATUSES = ["NEW", "CONTACTED", "APPROVED", "DECLINED"] as const;
const STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  APPROVED: "Approved",
  DECLINED: "Declined",
};

/** Wholesale enquiry triage. No pricing is displayed or entered here either. */
export default async function AdminStockistsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const params = await searchParams;

  const enquiries = await prisma.stockistEnquiry.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return (
    <>
      <AdminPageHeader
        title="Stockist enquiries"
        description={`${enquiries.length} enquir${enquiries.length === 1 ? "y" : "ies"}.`}
      />

      {params.saved ? <Notice>Enquiry updated.</Notice> : null}

      {enquiries.length === 0 ? (
        <Panel>
          <p className="text-[0.9rem] text-muted">No enquiries yet.</p>
        </Panel>
      ) : (
        <div className="grid gap-5">
          {enquiries.map((enquiry) => (
            <Panel key={enquiry.id}>
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-serif text-[1.15rem] text-oxblood">
                    {enquiry.businessName}
                  </h2>
                  <p className="mt-1 text-[0.8rem] text-muted">
                    {enquiry.businessType ?? "Type not given"} · {enquiry.city} ·{" "}
                    {enquiry.createdAt.toISOString().slice(0, 10)}
                  </p>
                </div>
                <StatusBadge
                  status={enquiry.status}
                  label={STATUS_LABELS[enquiry.status] ?? enquiry.status}
                />
              </div>

              <dl className="mb-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[0.86rem]">
                <dt className="text-muted">Contact</dt>
                <dd>{enquiry.contactName}</dd>
                <dt className="text-muted">WhatsApp</dt>
                <dd>{enquiry.whatsapp}</dd>
                <dt className="text-muted">Expected volume</dt>
                <dd>{enquiry.expectedMonthlyVolume ?? "—"}</dd>
                {enquiry.message ? (
                  <>
                    <dt className="text-muted">Message</dt>
                    <dd className="whitespace-pre-wrap">{enquiry.message}</dd>
                  </>
                ) : null}
              </dl>

              <form
                action={updateStockistStatusAction}
                className="flex flex-wrap items-end gap-3 border-t border-line pt-4"
              >
                <input type="hidden" name="id" value={enquiry.id} />

                <div>
                  <label
                    htmlFor={`status-${enquiry.id}`}
                    className="mb-[0.35rem] block text-[0.72rem] uppercase tracking-[0.08em] text-muted"
                  >
                    Status
                  </label>
                  <select
                    id={`status-${enquiry.id}`}
                    name="status"
                    defaultValue={enquiry.status}
                    className="rounded border border-line bg-white px-3 py-2 text-[0.9rem] focus:border-ruby focus:outline-none"
                  >
                    {STATUSES.map((value) => (
                      <option key={value} value={value}>
                        {STATUS_LABELS[value]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="min-w-[220px] flex-1">
                  <label
                    htmlFor={`notes-${enquiry.id}`}
                    className="mb-[0.35rem] block text-[0.72rem] uppercase tracking-[0.08em] text-muted"
                  >
                    Internal notes
                  </label>
                  <input
                    id={`notes-${enquiry.id}`}
                    name="internalNotes"
                    defaultValue={enquiry.internalNotes ?? ""}
                    className="w-full rounded border border-line bg-white px-3 py-2 text-[0.9rem] focus:border-ruby focus:outline-none"
                  />
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
