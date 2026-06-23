# Data load order — TARGET (new database)

Run **after** `01_enums.sql` through `03_indexes_constraints_rls.sql`.

**Skip `04_reference_seeds.sql`** if you paste full data from SOURCE.

Paste `INSERT` output from `SOURCE_02_export_all_inserts.sql` into the matching file below, then run each file in order.

| Order | File | Table |
|------:|------|-------|
| 1 | [10_data_memberships.sql](./10_data_memberships.sql) | memberships |
| 2 | [11_data_business_memberships.sql](./11_data_business_memberships.sql) | business_memberships |
| 3 | [12_data_qr_codes.sql](./12_data_qr_codes.sql) | qr_codes |
| 4 | [13_data_event_templates.sql](./13_data_event_templates.sql) | event_templates |
| 5 | [14_data_tshirt_preorders.sql](./14_data_tshirt_preorders.sql) | tshirt_preorders |
| 6 | [15_data_fundraising_donations.sql](./15_data_fundraising_donations.sql) | fundraising_donations |
| 7 | [16_data_feature_ids.sql](./16_data_feature_ids.sql) | feature_ids |
| 8 | [17_data_people.sql](./17_data_people.sql) | people |
| 9 | [18_data_businesses.sql](./18_data_businesses.sql) | businesses |
| 10 | [19_data_leaflets.sql](./19_data_leaflets.sql) | leaflets |
| 11 | [20_auth_users.sql](./20_auth_users.sql) | auth.users (from SOURCE_03) |
| 12 | [21_data_events.sql](./21_data_events.sql) | events |
| 13 | [22_data_routes.sql](./22_data_routes.sql) | routes |
| 14 | [23_data_task_templates.sql](./23_data_task_templates.sql) | task_templates |
| 15 | [24_data_comm_settings.sql](./24_data_comm_settings.sql) | comm_settings |
| 16 | [25_data_volunteer_asks.sql](./25_data_volunteer_asks.sql) | volunteer_asks |
| 17 | [26_data_committee_default_attendees.sql](./26_data_committee_default_attendees.sql) | committee_default_attendees |
| 18 | [27_data_tasks.sql](./27_data_tasks.sql) | tasks |
| 19 | [28_data_deliveries.sql](./28_data_deliveries.sql) | deliveries |
| 20 | [29_data_sponsorships.sql](./29_data_sponsorships.sql) | sponsorships |
| 21 | [30_data_event_volunteers.sql](./30_data_event_volunteers.sql) | event_volunteers |
| 22 | [31_data_payments.sql](./31_data_payments.sql) | payments |
| 23 | [32_data_committee_meetings.sql](./32_data_committee_meetings.sql) | committee_meetings |
| 24 | [33_data_volunteers.sql](./33_data_volunteers.sql) | volunteers |
| 25 | [34_data_committee_meeting_attendees.sql](./34_data_committee_meeting_attendees.sql) | committee_meeting_attendees |
| 26 | [35_data_action_items.sql](./35_data_action_items.sql) | action_items |

After loading, verify row counts match SOURCE.
