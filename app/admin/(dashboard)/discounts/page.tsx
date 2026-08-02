import {
  saveDiscountAction,
  toggleDiscountAction,
} from "@/app/actions/admin/catalogue";
import { formatRsExact } from "@/lib/pricing";
import { prisma } from "@/lib/prisma";
import {
  AdminField,
  AdminPageHeader,
  AdminSubmit,
  Notice,
  Panel,
} from "@/components/admin/AdminUI";

export const dynamic = "force-dynamic";

export const metadata = { title: "Discount codes" };

/**
 * Discount codes.
 *
 * This closes the loop left open in Phase 2: validateDiscountCode() has always been real, it
 * simply had an empty table to look in. A code created here is immediately usable at
 * checkout — the cart validates against this table on every render, and the order transaction
 * re-validates and increments timesRedeemed inside the same transaction that reserves stock.
 */
export default async function AdminDiscountsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const params = await searchParams;

  const codes = await prisma.discountCode.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <AdminPageHeader
        title="Discount codes"
        description="Codes apply at checkout as soon as they're active."
      />

      {params.saved ? <Notice>Saved.</Notice> : null}
      {params.error ? <Notice tone="error">{params.error}</Notice> : null}

      <Panel title="Create a code" className="mb-6">
        <form action={saveDiscountAction} className="grid gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <AdminField
              label="Code"
              name="code"
              placeholder="LAAL10"
              hint="Letters, numbers, - and _"
            />
            <div>
              <label
                htmlFor="type"
                className="mb-[0.35rem] block text-[0.72rem] uppercase tracking-[0.08em] text-muted"
              >
                Type
              </label>
              <select
                id="type"
                name="type"
                defaultValue="PERCENT"
                className="w-full rounded border border-line bg-white px-3 py-2 text-[0.92rem] focus:border-ruby focus:outline-none"
              >
                <option value="PERCENT">Percentage off</option>
                <option value="FIXED">Fixed amount off (Rs)</option>
              </select>
            </div>
            <AdminField
              label="Value"
              name="value"
              type="number"
              min="1"
              hint="1–100 for percentage, rupees for fixed."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <AdminField
              label="Minimum subtotal (Rs)"
              name="minSubtotalRs"
              type="number"
              min="0"
              hint="Optional."
            />
            <AdminField
              label="Max redemptions"
              name="maxRedemptions"
              type="number"
              min="1"
              hint="Optional — blank is unlimited."
            />
            <AdminField
              label="Expires"
              name="endsAt"
              type="date"
              hint="Optional."
            />
          </div>

          <AdminField
            label="Description"
            name="description"
            placeholder="Internal note about this code"
          />

          <label className="flex items-center gap-2 text-[0.88rem]">
            <input type="checkbox" name="isActive" defaultChecked />
            Active
          </label>

          <div>
            <AdminSubmit>Create code</AdminSubmit>
          </div>
        </form>
      </Panel>

      <Panel title={`Existing codes (${codes.length})`}>
        {codes.length === 0 ? (
          <p className="text-[0.9rem] text-muted">
            No codes yet. Until one exists, any code entered at checkout is
            correctly rejected as “not recognised”.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-[0.85rem]">
              <thead>
                <tr className="border-b border-line text-left text-[0.7rem] uppercase tracking-[0.06em] text-muted">
                  <th className="py-3 pr-4">Code</th>
                  <th className="py-3 pr-4">Discount</th>
                  <th className="py-3 pr-4">Min subtotal</th>
                  <th className="py-3 pr-4">Used</th>
                  <th className="py-3 pr-4">Expires</th>
                  <th className="py-3 pr-4">Active</th>
                  <th className="py-3" />
                </tr>
              </thead>
              <tbody>
                {codes.map((code) => (
                  <tr key={code.id} className="border-b border-line last:border-0">
                    <td className="py-3 pr-4 font-semibold text-oxblood">
                      {code.code}
                      {code.description ? (
                        <span className="block text-[0.75rem] font-normal text-muted">
                          {code.description}
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3 pr-4">
                      {code.type === "PERCENT"
                        ? `${code.value}%`
                        : formatRsExact(code.value)}
                    </td>
                    <td className="py-3 pr-4">
                      {code.minSubtotalRs === null
                        ? "—"
                        : formatRsExact(code.minSubtotalRs)}
                    </td>
                    <td className="py-3 pr-4 tabular-nums">
                      {code.timesRedeemed}
                      {code.maxRedemptions ? ` / ${code.maxRedemptions}` : ""}
                    </td>
                    <td className="py-3 pr-4">
                      {code.endsAt
                        ? code.endsAt.toISOString().slice(0, 10)
                        : "—"}
                    </td>
                    <td className="py-3 pr-4">
                      {code.isActive ? "Yes" : "No"}
                    </td>
                    <td className="py-3">
                      <form action={toggleDiscountAction}>
                        <input type="hidden" name="id" value={code.id} />
                        <button
                          type="submit"
                          className="rounded border border-line px-3 py-1 text-[0.7rem] font-bold uppercase tracking-nav text-oxblood hover:border-ruby hover:text-ruby"
                        >
                          {code.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
