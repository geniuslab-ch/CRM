// This CRM's own real deployed URL — used to build links meant to be
// shared outside the app itself (e.g. a sponsor/club's public booking
// link). Update if the deployment ever moves to a custom domain.
export const CRM_APP_URL = "https://crm-five-snowy-11.vercel.app";

export type BookingCategory = "sponsor" | "club";

export function bookingUrl(category: BookingCategory, id: string): string {
  return `${CRM_APP_URL}/book/${category}/${id}`;
}
