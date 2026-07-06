# MLCC Website & Admin — Architecture, Tech Stack, and Adoption Plan

This document explains how the MLCC website and admin dashboard work, what they're built on, and how we plan to roll them out. It's written for the whole team, not just engineers — each section gives a plain-language explanation, and technical specifics are pushed to the appendix at the end.

## Overall Structure

MLCC runs its own self-hosted platform rather than relying on off-the-shelf tools like Squarespace or Google Drive. It has two sides: a public-facing marketing website that anyone can visit, and a set of admin routes that are locked down and only accessible to board members and approved volunteers. There are no passwords anywhere in the system — logging into the admin side works by requesting a one-time link sent to your email, which is more secure than a password (nothing to steal or guess) and simpler to manage.

Because we host this ourselves rather than using generic form-and-folder tools, we control exactly what data we collect, how it's structured, and who can see it. It also means we can automate things (like leaflet routes or meeting minutes appearing on the site) that would otherwise require manual copy-paste work.

*For more technical details, see Appendix A.*

## Website

The public website has both static informational pages and pages that pull live data from our database. Pages include: About, Board, Committees, Contact, Donate, Events, Join the Board, Leaflet, Meeting Minutes, Membership, One Seattle Plan, Submit an Event, Submit a Story, Subscribe, and Volunteer.

Events, blog/story posts, and volunteer opportunities are all managed directly through the admin dashboard — a board member updates them there, and the change appears on the site automatically. For everything else on the site, updates currently happen by request (someone asks, we make the change) until we roll out a comment/feedback system that lets any visitor submit a suggested edit for our team to review and apply. Meeting minutes work a bit differently: once we upload them to the database, they publish to the site automatically with no extra step. Open (unassigned) leaflet routes are also published to the site so neighbors can see what's available and sign up — this uses a separate database from the one holding private neighbor information, so no personal data is exposed publicly.

*For more technical details, see Appendix A.*

## Admin Dashboard

**Dashboard:** The landing page after logging in. Long-term, this will act as a hub that lets whoever's logged in jump straight to whatever they need — their routes, pending invoices, upcoming events, etc. — rather than hunting through menus.

**Access:** Right now, every board member has full admin access. As we bring on volunteers who need narrower access (e.g., only leaflet management, not financials), we'll introduce scoped roles so people only see what's relevant to them.

**Favorites:** Anyone logged in can "favorite" specific admin pages or records for one-click access later, instead of navigating the full menu each time.

**Neighbors:** This is our master list of everyone we have a relationship with, whether or not they're a paying member. For most neighbors, all we have is a name and email — we don't collect more than we need.

**Members:** A filtered view of the Neighbors list, showing only people with an active paid subscription.

**Businesses:** A list of local businesses, originally pulled once from Google and stored in our own database (it's not a live sync). Business sponsors/members are flagged and viewable the same way individual Members are.

**Leaflet:** This section exists to take the manual overhead out of coordinating our leaflet (flyer) distribution. When we start a new leaflet run, the system pulls in route information and creates delivery records automatically, and confirmation emails go out to the people assigned to each route. From there, a coordinator can see who's on which route, mark a route as skipped, reassign a route to someone else, and see at a glance which routes are covered and which still need someone.

**Invoicing & Payments:** Board members can view and issue invoices tied to memberships, sponsorships, and donations directly from the admin. See the Invoicing & Payments section below for more detail.

**Events:** Board members create and edit events here — dates, descriptions, locations, capacity — and can track volunteer signups tied to a given event. Published events automatically appear on the public Events page.

**Stories:** This is where blog-style content and community stories get written, edited, and published. Anyone can submit a story idea via the public "Submit a Story" page for board review before it goes live.

**Invoicing and Payments:** Covers membership dues, business sponsorships, and one-off donations. Invoices and payment status are tracked in the admin and reconciled against Stripe. See the Payments appendix section for how this connects to Stripe specifically.

**Emails & Social:** Handles outbound communications tied to admin actions — for example, leaflet route confirmation emails — as well as coordination for our social media posting. This area is expected to grow as we consolidate more of our outreach into one place.

*For more technical details, see Appendix A (platform), Appendix B (payments/Stripe).*

---

# Appendices

## Appendix A: Platform & Database

**Tech stack:**
- **Frontend/Admin:** Built with Next.js and React, serving both the public marketing site and the admin dashboard from the same codebase.
- **Database:** Supabase (a managed, paid Postgres database service). This gives us automatic security updates and backups, so we're protected against sudden data loss in a way a shared spreadsheet or Google Drive folder isn't.
- **Authentication:** Supabase Auth, using passwordless email magic-link sign-in. No passwords are ever stored. Currently, anyone who authenticates is treated as an admin; role-based restrictions (e.g., volunteer-only access) are planned but not yet built into the database.

**Key database tables, grouped by purpose:**

*People & Membership*
- `people` — name, email, address, phone, roles, tags, membership reference
- `memberships` — membership tier, status, renewal date, Stripe subscription reference
- `business_memberships` — links businesses to memberships

*Businesses*
- `businesses` — name, contact info, address, website, Google source reference, sponsor/member flags

*Leaflet Distribution*
- `routes` — route name, size, type, assigned deliverer
- `deliveries` — who delivered which route, when, and whether it was skipped
- `leaflets` — each print run: title, distribution date, status, cost, sponsorship goal

*Events & Volunteering*
- `events` / `event_templates` — event details and reusable templates
- `volunteer_asks` — volunteer opportunities (one-off or ongoing) tied to events
- `volunteers` / `event_volunteers` — signup and attendance tracking

*Committee Meetings & Minutes*
- `committee_meetings` — meeting metadata, transcript, and structured minutes that publish to the site
- `committee_default_attendees` — standing invite lists per committee
- `action_items` — follow-up tasks generated from meetings, assignable to people

*Payments & Sponsorship*
- `payments` — individual payment records
- `sponsorships` — business sponsorship pledges/payments tied to events or leaflets
- `fundraising_donations` — one-off Stripe donation records by tier

*Admin Utilities*
- `user_favorites` — bookmarked admin pages per user
- `faqs` / `faq_page_assignments` — FAQ content shown on specific site pages
- `tasks`, `qr_codes`, `comm_settings` — supporting operational tables

Note: the site-feedback/comment system mentioned above is handled outside this database — submissions currently create a tracked item in our project-management tool for the team to review, rather than storing comments in Supabase.

**Why this is more secure than Google Drive:** Data lives in a managed, access-controlled database rather than shared files/folders. Access is scoped to authenticated admin sessions rather than "anyone with the link," and every login requires re-verification via email rather than a reusable password that can be shared or leaked.

## Appendix B: Payments (Stripe)

Stripe is currently set up to handle membership signups and one-off donations. The plan going forward is to move invoicing (membership dues and business sponsorships) onto Stripe Invoices as well, so all payment collection runs through one system.

Importantly, MLCC never stores or has direct access to anyone's card or bank details — that information lives entirely with Stripe. Our database only stores what we need to match a payment to a person: their email, name, and Stripe's internal customer/subscription IDs. This keeps us out of the business of handling sensitive payment data while still letting us track who's paid and what's outstanding.
