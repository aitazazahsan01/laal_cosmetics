import { splitProductName } from "@/lib/products";

/**
 * Renders a product name with its trailing "+" in ruby — a fixed brand rule from the
 * design system ("the '+' in product names" is an accent colour, never plain text).
 */
export function ProductName({ name }: { name: string }) {
  const { base, plus } = splitProductName(name);
  return (
    <>
      {base}
      {plus ? <span className="text-ruby">{plus}</span> : null}
    </>
  );
}

export default ProductName;
