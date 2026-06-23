#!/usr/bin/env python3
"""Convert Supabase CSV exports to INSERT SQL files."""

import csv
import json
from pathlib import Path

ROOT = Path(__file__).parent
LOAD_DIR = ROOT / "load"
LOAD_DIR.mkdir(exist_ok=True)

# table -> column -> pg type hint
COLUMN_TYPES: dict[str, dict[str, str]] = {
    "memberships": {
        "id": "uuid", "tier": "membership_tier_enum", "status": "membership_status_enum",
        "last_renewal": "date", "created_at": "timestamptz",
    },
    "business_memberships": {
        "id": "uuid", "status": "membership_status_enum", "last_renewal": "date",
    },
    "qr_codes": {"id": "uuid", "created_at": "timestamptz", "updated_at": "timestamptz"},
    "feature_ids": {"id": "bigint", "created_at": "timestamptz", "vote_count": "bigint"},
    "people": {
        "id": "uuid", "roles": "text[]", "tags": "text[]",
        "created_at": "timestamptz", "membership_id": "uuid",
    },
    "businesses": {"id": "uuid", "membership_id": "uuid"},
    "leaflets": {
        "id": "uuid", "distribution_date": "date", "status": "leaflet_status",
        "activated_at": "timestamptz", "closed_at": "timestamptz",
        "membership_qr_code_id": "uuid", "created_at": "timestamptz", "updated_at": "timestamptz",
    },
    "events": {
        "id": "uuid", "date": "date", "event_template_id": "uuid",
        "starts_at": "timestamptz", "ends_at": "timestamptz",
        "field_data": "jsonb", "created_at": "timestamptz", "updated_at": "timestamptz",
    },
    "routes": {
        "id": "uuid", "created_at": "timestamptz", "route_type": "route_types",
        "primary_deliverer_id": "uuid",
    },
    "task_templates": {
        "id": "uuid", "context": "workflow_context", "event_template_id": "uuid",
        "created_at": "timestamptz",
    },
    "comm_settings": {
        "id": "uuid", "context": "workflow_context", "event_template_id": "uuid",
        "trigger": "comm_trigger", "offset_time": "time",
        "created_at": "timestamptz", "updated_at": "timestamptz",
    },
    "volunteer_asks": {
        "id": "uuid", "commitment_type": "volunteer_commitment_type",
        "commitment_unit": "volunteer_commitment_unit",
        "commitment_quantity": "numeric", "event_id": "uuid",
        "created_at": "timestamptz", "updated_at": "timestamptz",
    },
    "tasks": {
        "id": "uuid", "context": "workflow_context", "context_id": "uuid",
        "template_id": "uuid", "completed_at": "timestamptz", "created_at": "timestamptz",
    },
    "deliveries": {
        "id": "uuid", "person_id": "uuid", "route_id": "uuid", "date_delivered": "date",
        "leaflet_id": "uuid", "response": "delivery_response",
        "responded_at": "timestamptz", "created_at": "timestamptz", "updated_at": "timestamptz",
        "comm_pre_distribution_reminder_sent_at": "timestamptz",
        "comm_completion_followup_sent_at": "timestamptz",
    },
    "sponsorships": {
        "business_id": "uuid", "event_id": "uuid", "amount": "numeric",
        "paid_date": "date", "id": "uuid", "leaflet_id": "uuid",
    },
    "payments": {
        "id": "uuid", "person_id": "uuid", "membership_id": "uuid",
        "amount": "numeric", "date": "date",
        "type": "payment_type_enum", "method": "payment_method_enum",
    },
    "committee_meetings": {
        "id": "uuid", "event_id": "uuid", "committee": "committee_slug",
        "location_type": "meeting_location_type",
        "agenda_json": "jsonb", "structured_minutes": "jsonb",
        "minutes_status": "minutes_status", "submitted_at": "timestamptz",
        "submitted_by": "uuid", "created_at": "timestamptz", "updated_at": "timestamptz",
    },
    "committee_meeting_attendees": {
        "id": "uuid", "meeting_id": "uuid", "person_id": "uuid", "created_at": "timestamptz",
    },
    "action_items": {
        "id": "uuid", "assignee_person_id": "uuid", "committee_meeting_id": "uuid",
        "status": "action_item_status", "due_at": "date", "source": "action_item_source",
        "completed_at": "timestamptz", "completed_by": "uuid",
        "created_at": "timestamptz", "updated_at": "timestamptz",
    },
    "user_roles": {"user_id": "uuid", "created_at": "timestamptz"},
}

LOAD_ORDER = [
    ("01_load_memberships.sql", "memberships", "memberships_rows.csv"),
    ("02_load_business_memberships.sql", "business_memberships", "business_memberships_rows.csv"),
    ("03_load_qr_codes.sql", "qr_codes", "qr_codes_rows.csv"),
    ("04_load_feature_ids.sql", "feature_ids", "feature_ids_rows.csv"),
    ("05_load_people.sql", "people", "people_rows (1).csv"),
    ("06_load_businesses.sql", "businesses", "businesses_rows.csv"),
    ("07_load_leaflets.sql", "leaflets", "leaflets_rows.csv"),
    ("08_load_events.sql", "events", "events_rows.csv"),
    ("09_load_routes.sql", "routes", "routes_rows.csv"),
    ("10_load_task_templates.sql", "task_templates", "task_templates_rows.csv"),
    ("11_load_comm_settings.sql", "comm_settings", "comm_settings_rows.csv"),
    ("12_load_volunteer_asks.sql", "volunteer_asks", "volunteer_asks_rows.csv"),
    ("13_load_tasks.sql", "tasks", "tasks_rows.csv"),
    ("14_load_deliveries.sql", "deliveries", "deliveries_rows.csv"),
    ("15_load_sponsorships.sql", "sponsorships", "sponsorships_rows.csv"),
    ("16_load_payments.sql", "payments", "payments_rows.csv"),
    ("17_load_committee_meetings.sql", "committee_meetings", "committee_meetings_rows.csv"),
    ("18_load_committee_meeting_attendees.sql", "committee_meeting_attendees", "committee_meeting_attendees_rows.csv"),
    ("19_load_action_items.sql", "action_items", "action_items_rows.csv"),
    ("20_load_user_roles.sql", "user_roles", "user_roles_rows.csv"),
]


def sql_literal(value: str, col: str, table: str) -> str:
    if value == "" or value is None:
        return "NULL"

    types = COLUMN_TYPES.get(table, {})
    t = types.get(col, "text")

    if t == "uuid":
        return f"'{value}'::uuid"
    if t == "bigint":
        return str(int(value))
    if t == "numeric":
        return str(value)
    if t == "integer":
        return str(int(value))
    if t == "boolean":
        return "true" if value.lower() in ("true", "t", "1") else "false"
    if t == "date":
        return f"'{value}'::date"
    if t == "timestamptz":
        return f"'{value}'::timestamptz"
    if t == "time":
        return f"'{value}'::time"
    if t == "jsonb":
        return f"'{value.replace(chr(39), chr(39)+chr(39))}'::jsonb"
    if t == "text[]":
        if value in ("{}", "[]"):
            return "'{}'::text[]"
        return f"'{value.replace(chr(39), chr(39)+chr(39))}'::text[]"
    if t == "route_types":
        return f"'{value.replace(chr(39), chr(39)+chr(39))}'::public.\"Route Types\""
    if t.endswith("_enum") or t in (
        "leaflet_status", "delivery_response", "workflow_context", "comm_trigger",
        "volunteer_commitment_type", "volunteer_commitment_unit", "committee_slug",
        "meeting_location_type", "minutes_status", "action_item_status", "action_item_source",
        "payment_type_enum", "payment_method_enum", "membership_tier_enum", "membership_status_enum",
    ):
        return f"'{value.replace(chr(39), chr(39)+chr(39))}'"

    return f"'{value.replace(chr(39), chr(39)+chr(39))}'"


def convert_csv(csv_path: Path, table: str) -> list[str]:
    lines = []
    with csv_path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        cols = reader.fieldnames or []
        for row in reader:
            vals = ", ".join(sql_literal(row[c], c, table) for c in cols)
            col_list = ", ".join(cols)
            lines.append(f"INSERT INTO public.{table} ({col_list}) VALUES ({vals});")
    return lines


def main() -> None:
    summary = []
    for out_name, table, csv_name in LOAD_ORDER:
        csv_path = ROOT / csv_name
        out_path = LOAD_DIR / out_name
        if not csv_path.exists():
            out_path.write_text(f"-- No CSV found: {csv_name}\n")
            summary.append(f"{out_name}: MISSING CSV")
            continue
        inserts = convert_csv(csv_path, table)
        header = f"-- Load {table} ({len(inserts)} rows)\n-- Run on NEW database after 01_setup_schema.sql\n\n"
        out_path.write_text(header + "\n".join(inserts) + "\n")
        summary.append(f"{out_name}: {len(inserts)} rows")

    print("\n".join(summary))


if __name__ == "__main__":
    main()
