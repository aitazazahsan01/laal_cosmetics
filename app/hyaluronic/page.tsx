import type { Metadata } from "next";

import {
  ProductPageTemplate,
  buildProductMetadata,
} from "@/components/product/ProductPageTemplate";

const SLUG = "hyaluronic";

export const dynamic = "force-dynamic";

export function generateMetadata(): Promise<Metadata> {
  return buildProductMetadata(SLUG);
}

export default function HyaluronicPage() {
  return <ProductPageTemplate slug={SLUG} />;
}
