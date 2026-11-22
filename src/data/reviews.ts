/**
 * Google rating shown on the home page. Copy reviews word for word from the
 * Google Business profile (first name + initial, stars, text): never write or
 * edit them yourself.
 */
export type GoogleReview = {
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
};

export const googleRating = {
  rating: 4.7,
  /** Total number of Google reviews; null hides the "based on N reviews" line. */
  count: null as number | null,
};

export const googleReviews: GoogleReview[] = [];
