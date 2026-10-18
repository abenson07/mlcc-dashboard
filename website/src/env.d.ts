/// <reference types="astro/client" />
/// <reference types="@sanity/astro/module" />

declare namespace App {
  interface Locals {
    /** Set when the request carries a valid edit token minted by the dashboard (admin → Edit website). */
    edit: { parent: string; token: string } | null;
  }
}
