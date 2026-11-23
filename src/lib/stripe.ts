import "server-only";
import Stripe from "stripe";
import { stripeSecretKey } from "@/lib/env";

let stripeClient: Stripe | null = null;

/** Throws a named configuration error when STRIPE_SECRET_KEY is missing (see .env.example). */
export function getStripeClient(): Stripe {
  stripeClient ??= new Stripe(stripeSecretKey());
  return stripeClient;
}
