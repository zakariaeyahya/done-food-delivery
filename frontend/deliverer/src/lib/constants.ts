/**
 * Constantes de l'application
 */

export const APP_NAME = "DONE Livreur";

export const ROUTES = {
  HOME: "/",
  DELIVERIES: "/deliveries",
  EARNINGS: "/earnings",
  PROFILE: "/profile",
} as const;

export const DELIVERY_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  PICKUP: "pickup",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

