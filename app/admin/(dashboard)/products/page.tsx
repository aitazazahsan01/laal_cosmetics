import { updateProductAction } from "@/app/actions/admin/catalogue";
import { getProducts } from "@/lib/products";
import {
  AdminField,
  AdminPageHeader,
  AdminSubmit,
  Notice,
  Panel,
} from "@/components/admin/AdminUI";

export const dynamic = "force-dynamic";

export const metadata = { title: "Products" };

/**
 * Product editing — price, stock, short description and photography, no redeploy needed.
 *
 * Setting a real priceRs is what switches the storefront out of its provisional state: the
 * "Price pending" badges and the demo-pricing note are driven by priceRs being null, so they
 * disappear on their own the moment a number is saved here. Clearing the field puts the site
 * back into the honest pending state.
 */
export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const products = await getProducts();

  return (
    <>
      <AdminPageHeader
        title="Products"
        description="Price, stock and content for both serums. Changes are live immediately."
      />

      {params.saved ? <Notice>Saved “{params.saved}”.</Notice> : null}
      {params.error ? <Notice tone="error">{params.error}</Notice> : null}

      <div className="grid gap-6">
        {products.map((product) => (
          <Panel key={product.slug} title={`${product.name} — ${product.tagline}`}>
            <div id={product.slug} />

            {product.priceRs === null ? (
              <p className="mb-5 rounded border border-dashed border-ruby bg-ruby/[0.05] px-4 py-2 text-[0.82rem] text-ruby">
                No price set — the storefront is showing “Price pending” and
                provisional Rs. 0 totals for this product.
              </p>
            ) : null}

            <form
              action={updateProductAction}
              encType="multipart/form-data"
              className="grid gap-4"
            >
              <input type="hidden" name="slug" value={product.slug} />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <AdminField
                  label="Price (Rs)"
                  name="priceRs"
                  type="number"
                  min="0"
                  defaultValue={product.priceRs ?? ""}
                  hint="Leave blank for “pending”."
                />
                <AdminField
                  label="Stock quantity"
                  name="stockQty"
                  type="number"
                  min="0"
                  defaultValue={product.stockQty}
                  hint={product.inStock ? "In stock" : "Sold out"}
                />
                <AdminField
                  label="Size (ml)"
                  name="sizeMlDisplay"
                  defaultValue={product.sizeMl}
                  hint="Fixed by the packaging."
                />
              </div>

              <div>
                <label
                  htmlFor={`shortDescription-${product.slug}`}
                  className="mb-[0.35rem] block text-[0.72rem] uppercase tracking-[0.08em] text-muted"
                >
                  Short description
                </label>
                <textarea
                  id={`shortDescription-${product.slug}`}
                  name="shortDescription"
                  rows={3}
                  defaultValue={product.shortDescription ?? ""}
                  placeholder="Supplied by LAAL — leave blank to keep showing the pending note."
                  className="w-full rounded border border-line bg-white px-3 py-2 text-[0.9rem] focus:border-ruby focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor={`image-${product.slug}`}
                  className="mb-[0.35rem] block text-[0.72rem] uppercase tracking-[0.08em] text-muted"
                >
                  Add a product photo
                </label>
                <input
                  id={`image-${product.slug}`}
                  name="image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="block w-full rounded border border-dashed border-muted bg-white p-2 text-[0.82rem] text-muted file:mr-3 file:rounded file:border-0 file:bg-ruby file:px-3 file:py-1.5 file:text-[0.7rem] file:font-bold file:uppercase file:tracking-nav file:text-white"
                />
                <p className="mt-1 text-[0.75rem] text-muted">
                  JPG, PNG or WebP up to 5 MB. Until a photo exists the product
                  page shows the line-art placeholder and its pending note.
                </p>

                {product.imageUrls.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.imageUrls.map((url) => (
                      <span
                        key={url}
                        className="rounded border border-line bg-blush px-2 py-1 text-[0.72rem] text-muted"
                      >
                        {url.split("/").pop()}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div>
                <AdminSubmit>Save {product.name}</AdminSubmit>
              </div>
            </form>
          </Panel>
        ))}
      </div>
    </>
  );
}
