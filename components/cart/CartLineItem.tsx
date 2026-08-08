import Link from "next/link";

import { removeFromCartAction, setQuantityAction } from "@/app/actions/cart";
import { formatRsExact, type PricedLine } from "@/lib/pricing";
import { BottleMark } from "@/components/ui/BottleMark";
import { ProductName } from "@/components/ui/ProductName";

/**
 * A cart line.
 *
 * Quantity and remove are plain <form>s posting to server actions, so they work without
 * JavaScript and need no client component. Each submit re-reads the cookie, re-prices the
 * cart against the database and re-renders — the browser never computes a total.
 */
export function CartLineItem({ line }: { line: PricedLine }) {
  const atStockCeiling = line.quantity >= line.stockQty;

  return (
    <div className="grid grid-cols-[auto_1fr] items-start gap-5 border-b border-line py-6 sm:grid-cols-[auto_1fr_auto] sm:items-center">
      <div className="flex h-[96px] w-[96px] items-center justify-center">
        {line.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={line.imageUrl}
            alt={line.name}
            className="h-full w-full object-contain"
          />
        ) : (
          <BottleMark variant="front" height={96} />
        )}
      </div>

      <div>
        <span className="text-[0.68rem] uppercase tracking-nav text-muted">
          {line.tagline}
        </span>
        <h3 className="mt-[0.2rem] font-serif text-[1.15rem]">
          <Link href={`/${line.slug}`} className="hover:text-ruby">
            <ProductName name={line.name} />
          </Link>
        </h3>
        <p className="mt-[0.15rem] text-[0.82rem] text-muted">
          {line.activesLine} · {line.sizeMl} ml
        </p>

        <form action={removeFromCartAction} className="mt-[0.6rem]">
          <input type="hidden" name="slug" value={line.slug} />
          <button
            type="submit"
            className="text-[0.78rem] text-ruby underline underline-offset-[3px] hover:text-oxblood"
          >
            Remove
          </button>
        </form>
      </div>

      <div className="col-span-2 flex items-center justify-between gap-4 sm:col-span-1 sm:flex-col sm:items-end">
        <span className="font-serif text-[1.05rem] text-oxblood tabular-nums">
          {formatRsExact(line.lineTotalRs)}
        </span>

        <div className="flex items-center rounded border border-line">
          <form action={setQuantityAction}>
            <input type="hidden" name="slug" value={line.slug} />
            <input type="hidden" name="quantity" value={line.quantity - 1} />
            <button
              type="submit"
              aria-label={`Decrease quantity of ${line.name}`}
              className="h-[2.1rem] w-[2.1rem] text-oxblood hover:text-ruby"
            >
              –
            </button>
          </form>

          <span
            className="w-8 text-center text-[0.92rem] tabular-nums"
            aria-label={`Quantity: ${line.quantity}`}
          >
            {line.quantity}
          </span>

          <form action={setQuantityAction}>
            <input type="hidden" name="slug" value={line.slug} />
            <input type="hidden" name="quantity" value={line.quantity + 1} />
            <button
              type="submit"
              disabled={atStockCeiling}
              aria-label={`Increase quantity of ${line.name}`}
              className="h-[2.1rem] w-[2.1rem] text-oxblood hover:text-ruby disabled:cursor-not-allowed disabled:text-muted/50"
            >
              +
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CartLineItem;
