#!/usr/bin/env python3
"""Find Stripe customers who paid for a product in the last year."""

from __future__ import annotations

import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

import stripe

PRODUCT_ID = "prod_NtJNKoSC5qAtfq"
ENV_PATH = Path(__file__).resolve().parents[1] / ".env.local"


def load_env(path: Path) -> None:
    if not path.is_file():
        print(f"Missing env file: {path}", file=sys.stderr)
        sys.exit(1)
    for raw in path.read_text().splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def product_id_from_price(price) -> str | None:
    if not price:
        return None
    product = price.get("product") if isinstance(price, dict) else getattr(price, "product", None)
    if isinstance(product, str):
        return product if product.startswith("prod_") else None
    if product is not None:
        pid = product.get("id") if isinstance(product, dict) else getattr(product, "id", None)
        if pid:
            return pid
    return None


def product_id_from_line(line) -> str | None:
    pricing = line.get("pricing") if isinstance(line, dict) else getattr(line, "pricing", None)
    if not pricing:
        return None
    details = pricing.get("price_details") if isinstance(pricing, dict) else getattr(pricing, "price_details", None)
    if not details:
        return None

    product = details.get("product") if isinstance(details, dict) else getattr(details, "product", None)
    if isinstance(product, str) and product.startswith("prod_"):
        return product
    if product is not None:
        pid = product.get("id") if isinstance(product, dict) else getattr(product, "id", None)
        if pid:
            return pid

    price = details.get("price") if isinstance(details, dict) else getattr(details, "price", None)
    return product_id_from_price(price)


def resolve_line_product_id(line, cache: dict[str, str | None]) -> str | None:
    sync = product_id_from_line(line)
    if sync:
        return sync

    pricing = line.get("pricing") if isinstance(line, dict) else getattr(line, "pricing", None)
    if not pricing:
        return None
    details = pricing.get("price_details") if isinstance(pricing, dict) else getattr(pricing, "price_details", None)
    if not details:
        return None
    price = details.get("price") if isinstance(details, dict) else getattr(details, "price", None)
    if not isinstance(price, str) or not price.startswith("price_"):
        return None

    if price not in cache:
        try:
            resolved = stripe.Price.retrieve(price)
            cache[price] = product_id_from_price(resolved)
        except stripe.StripeError:
            cache[price] = None
    return cache[price]


def invoice_matches_product(invoice, product_id: str, cache: dict[str, str | None]) -> bool:
    lines = invoice.get("lines", {}).get("data", []) if isinstance(invoice, dict) else invoice.lines.data
    for line in lines:
        if resolve_line_product_id(line, cache) == product_id:
            return True
    return False


def checkout_session_matches_product(session, product_id: str, price_ids: set[str]) -> bool:
    line_items = stripe.checkout.Session.list_line_items(session.id, limit=100)
    for item in line_items.data:
        price = item.price
        if price and price.id in price_ids:
            return True
        if product_id_from_price(price) == product_id:
            return True
    return False


def paginate(resource, **params):
    starting_after = None
    while True:
        page_params = dict(params)
        if starting_after:
            page_params["starting_after"] = starting_after
        page = resource.list(**page_params)
        for item in page.data:
            yield item
        if not page.has_more or not page.data:
            break
        starting_after = page.data[-1].id


def main() -> None:
    load_env(ENV_PATH)
    secret = os.environ.get("STRIPE_SECRET_KEY", "").strip()
    if not secret:
        print("STRIPE_SECRET_KEY is not set in .env.local", file=sys.stderr)
        sys.exit(1)

    stripe.api_key = secret
    one_year_ago = int((datetime.now(timezone.utc) - timedelta(days=365)).timestamp())

    product = stripe.Product.retrieve(PRODUCT_ID)
    prices = stripe.Price.list(product=PRODUCT_ID, limit=100)
    price_ids = {p.id for p in prices.data}

    print(f"Product: {product.name} ({PRODUCT_ID})")
    print(f"Prices: {len(price_ids)}")
    print(f"Window: paid on/after {datetime.fromtimestamp(one_year_ago, tz=timezone.utc).date()}")
    print()

    customers: dict[str, dict] = {}
    price_cache: dict[str, str | None] = {}

    def add_customer(customer_id: str | None, source: str, paid_at: int, amount_cents: int | None) -> None:
        if not customer_id:
            return
        entry = customers.setdefault(
            customer_id,
            {
                "sources": set(),
                "latest_paid_at": paid_at,
                "total_paid_cents": 0,
            },
        )
        entry["sources"].add(source)
        entry["latest_paid_at"] = max(entry["latest_paid_at"], paid_at)
        if amount_cents:
            entry["total_paid_cents"] += amount_cents

    invoice_count = 0
    for invoice in paginate(
        stripe.Invoice,
        limit=100,
        status="paid",
        created={"gte": one_year_ago},
        expand=["data.lines.data", "data.lines.data.pricing.price_details.price"],
    ):
        invoice_count += 1
        if not invoice_matches_product(invoice, PRODUCT_ID, price_cache):
            continue
        customer_id = invoice.customer if isinstance(invoice.customer, str) else invoice.customer.id
        paid_at = invoice.status_transitions.paid_at or invoice.created
        add_customer(customer_id, "invoice", paid_at, invoice.amount_paid)

    session_count = 0
    for session in paginate(
        stripe.checkout.Session,
        limit=100,
        status="complete",
        created={"gte": one_year_ago},
    ):
        session_count += 1
        if not checkout_session_matches_product(session, PRODUCT_ID, price_ids):
            continue
        customer_id = session.customer if isinstance(session.customer, str) else getattr(session.customer, "id", None)
        add_customer(customer_id, "checkout", session.created, session.amount_total)

    print(f"Scanned {invoice_count} paid invoices and {session_count} completed checkout sessions.")
    print(f"Unique paying customers: {len(customers)}")
    print()

    if not customers:
        print("No customers found.")
        return

    rows = []
    for customer_id, meta in customers.items():
        customer = stripe.Customer.retrieve(customer_id)
        rows.append(
            {
                "id": customer.id,
                "name": customer.name or "N/A",
                "email": customer.email or "N/A",
                "latest_paid_at": meta["latest_paid_at"],
                "total_paid_cents": meta["total_paid_cents"],
                "sources": ", ".join(sorted(meta["sources"])),
            }
        )

    rows.sort(key=lambda r: r["latest_paid_at"], reverse=True)

    for row in rows:
        paid_on = datetime.fromtimestamp(row["latest_paid_at"], tz=timezone.utc).strftime("%Y-%m-%d")
        total = row["total_paid_cents"] / 100
        print(f"Customer ID: {row['id']}")
        print(f"  Name: {row['name']}")
        print(f"  Email: {row['email']}")
        print(f"  Latest payment: {paid_on}")
        print(f"  Total matched payments: ${total:,.2f}")
        print(f"  Sources: {row['sources']}")
        print("-" * 20)


if __name__ == "__main__":
    main()
