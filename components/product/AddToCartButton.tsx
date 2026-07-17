import { addToCartAction } from "@/app/actions/cart";
import { Button } from "@/components/ui/Button";

/**
 * Add-to-cart control.
 *
 * A plain <form> posting to a server action, so it works without JavaScript and stays a
 * server component. The action writes the httpOnly cart cookie and revalidates the layout,
 * which refreshes the header badge.
 *
 * The button carries no price and no quantity beyond 1 — the client cannot influence what an
 * item costs. Out-of-stock is derived from Product.stockQty, so the disabled state is always
 * truthful.
 */
export function AddToCartButton({
  slug,
  inStock,
  label = "Add to cart",
  fullWidth = false,
  className = "",
}: {
  /** One slug, or several to add a bundle in a single submit. */
  slug: string | string[];
  inStock: boolean;
  label?: string;
  fullWidth?: boolean;
  className?: string;
}) {
  const slugs = Array.isArray(slug) ? slug : [slug];

  return (
    <form
      action={addToCartAction}
      className={`${fullWidth ? "w-full" : ""} ${className}`}
    >
      {slugs.map((value) => (
        <input key={value} type="hidden" name="slug" value={value} />
      ))}
      <Button
        type="submit"
        variant="primary"
        disabled={!inStock}
        className={fullWidth ? "w-full" : ""}
      >
        {inStock ? label : "Sold out"}
      </Button>
    </form>
  );
}

export default AddToCartButton;
