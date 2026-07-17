"use client";

import { useState } from "react";

import { BottleMark, type BottleMarkVariant } from "@/components/ui/BottleMark";
import { PendingNote } from "@/components/ui/PendingNote";

type View = {
  id: string;
  variant: BottleMarkVariant;
  label: string;
};

/**
 * Product gallery.
 *
 * No real photography exists yet (SRS P-01, pending from LAAL) and the brand uses no stock
 * imagery, so each view is the line-art <BottleMark> placeholder. The pending state is
 * declared explicitly beneath the gallery rather than being disguised.
 *
 * The static mockup switched views with a hidden-radio CSS hack; this is real React state.
 */
export function ProductGallery({
  productName,
  imageUrls = [],
}: {
  productName: string;
  /** Real photography, once LAAL supplies it via the admin panel. */
  imageUrls?: string[];
}) {
  /*
   * Once real photography exists it replaces the placeholder entirely — including the
   * pending note, which would be false at that point.
   */
  if (imageUrls.length > 0) {
    return <PhotoGallery productName={productName} imageUrls={imageUrls} />;
  }

  return <PlaceholderGallery productName={productName} />;
}

function PhotoGallery({
  productName,
  imageUrls,
}: {
  productName: string;
  imageUrls: string[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = imageUrls[activeIndex] ?? imageUrls[0];

  return (
    <div>
      <div className="flex min-h-[340px] items-center justify-center overflow-hidden rounded-panel border border-line bg-blush">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={active}
          alt={`${productName} — product photography`}
          className="max-h-[420px] w-auto object-contain"
        />
      </div>

      {imageUrls.length > 1 ? (
        <div
          className="mt-[0.9rem] flex gap-3"
          role="tablist"
          aria-label={`${productName} views`}
        >
          {imageUrls.map((url, index) => (
            <button
              key={url}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Show image ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={`h-[4.4rem] w-[4.4rem] overflow-hidden rounded-card bg-white ${
                index === activeIndex
                  ? "border-2 border-ruby"
                  : "border border-line"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function PlaceholderGallery({ productName }: { productName: string }) {
  const views: View[] = [
    { id: "front", variant: "front", label: `Front view, ${productName} bottle` },
    { id: "label", variant: "label", label: "Label detail" },
    { id: "context", variant: "outline", label: "In-hand context" },
  ];

  const [activeId, setActiveId] = useState(views[0].id);
  const active = views.find((view) => view.id === activeId) ?? views[0];

  return (
    <div>
      <div className="flex min-h-[340px] items-center justify-center rounded-panel border border-line bg-blush p-8">
        <BottleMark
          variant={active.variant}
          height={310}
          captionText={active.variant === "label" ? productName : undefined}
          title={`${active.label} — photography pending`}
        />
      </div>

      <div
        className="mt-[0.9rem] flex gap-3"
        role="tablist"
        aria-label={`${productName} views`}
      >
        {views.map((view) => {
          const isActive = view.id === active.id;
          return (
            <button
              key={view.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Show ${view.label.toLowerCase()}`}
              onClick={() => setActiveId(view.id)}
              className={`flex h-[4.4rem] w-[4.4rem] items-center justify-center rounded-card bg-white ${
                isActive ? "border-2 border-ruby" : "border border-line"
              }`}
            >
              <BottleMark variant={view.variant} height={54} />
            </button>
          );
        })}
      </div>

      <p className="mt-3">
        <PendingNote label="Product photography pending — LAAL to supply" />
      </p>
    </div>
  );
}

export default ProductGallery;
