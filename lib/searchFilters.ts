/**
 * A tiny hand-off store for the Refine Search screen.
 *
 * The filter screen (app/search/filter.tsx) and the Search tab
 * (app/tabs/explore.tsx) live in different navigators, so there's no
 * clean way to pass the chosen filters back through navigation params.
 * Instead the filter screen drops the selected filters here and goes
 * back; the Search tab picks them up the next time it regains focus and
 * applies them to the actual query. One value, consumed once - no
 * subscriptions, no stale state left lying around.
 */

export type PendingSearchFilters = {
  type?: string;            // 'Hotel' | 'Shortlet' | 'Event Center' | undefined (All)
  areas: string[];
  amenities: string[];      // real amenity strings, e.g. 'WiFi', 'Pool'
  minPrice: number;
  maxPrice: number;
  minRating: number;        // 0 = any
  verifiedOnly: boolean;
};

let pending: PendingSearchFilters | null = null;

export function setPendingFilters(filters: PendingSearchFilters) {
  pending = filters;
}

/** Returns the filters once, then clears them so they don't re-apply. */
export function consumePendingFilters(): PendingSearchFilters | null {
  const f = pending;
  pending = null;
  return f;
}
