import { getCartItemCount } from "@/lib/cart";
import { HeaderBar } from "@/components/layout/HeaderBar";

/**
 * Server wrapper for the header.
 *
 * Its only job is to read the cart cookie so the badge is correct on first paint. All the
 * interactivity lives in <HeaderBar>, which is the client component.
 */
export async function Header() {
  const cartCount = await getCartItemCount();
  return <HeaderBar cartCount={cartCount} />;
}

export default Header;
