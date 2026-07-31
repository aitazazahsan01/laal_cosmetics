import { updateDeliverySettingsAction } from "@/app/actions/admin/catalogue";
import { getDeliverySettings } from "@/lib/products";
import {
  AdminField,
  AdminPageHeader,
  AdminSubmit,
  Notice,
  Panel,
} from "@/components/admin/AdminUI";

export const dynamic = "force-dynamic";

export const metadata = { title: "Settings" };

/**
 * Delivery settings — the DeliverySettings singleton.
 *
 * These values feed computeTotals() directly, so saving a standard fee or a free-delivery
 * threshold changes what the cart and checkout show on the very next request. Leaving a field
 * blank stores null, which is what puts the storefront back into its "delivery rule pending"
 * state — a deliberate option, not a validation failure.
 */
export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const params = await searchParams;
  const settings = await getDeliverySettings();

  return (
    <>
      <AdminPageHeader
        title="Settings"
        description="Delivery charges and the site-wide banner. Applied to carts immediately."
      />

      {params.saved ? <Notice>Settings saved.</Notice> : null}

      <Panel title="Delivery">
        <form action={updateDeliverySettingsAction} className="grid gap-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <AdminField
              label="Standard delivery fee (Rs)"
              name="standardFeeRs"
              type="number"
              min="0"
              defaultValue={settings?.standardFeeRs ?? ""}
              hint="Blank = pending, shown as such on the site."
            />
            <AdminField
              label="Free delivery above (Rs)"
              name="freeDeliveryThresholdRs"
              type="number"
              min="0"
              defaultValue={settings?.freeDeliveryThresholdRs ?? ""}
              hint="Blank = no free-delivery threshold."
            />
            <AdminField
              label="COD surcharge (Rs)"
              name="codSurchargeRs"
              type="number"
              min="0"
              defaultValue={settings?.codSurchargeRs ?? ""}
              hint="Added only to Cash on Delivery orders."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <AdminField
              label="Delivery estimate — min days"
              name="estimatedDaysMin"
              type="number"
              min="0"
              defaultValue={settings?.estimatedDaysMin ?? ""}
            />
            <AdminField
              label="Delivery estimate — max days"
              name="estimatedDaysMax"
              type="number"
              min="0"
              defaultValue={settings?.estimatedDaysMax ?? ""}
            />
          </div>

          <AdminField
            label="Announcement banner"
            name="announcementBanner"
            defaultValue={settings?.announcementBanner ?? ""}
            hint="Optional site-wide message. Leave blank to hide."
          />

          <label className="flex items-center gap-2 text-[0.88rem]">
            <input
              type="checkbox"
              name="codAvailable"
              defaultChecked={settings?.codAvailable ?? true}
            />
            Cash on Delivery available
          </label>

          <div>
            <AdminSubmit>Save settings</AdminSubmit>
          </div>
        </form>
      </Panel>
    </>
  );
}
