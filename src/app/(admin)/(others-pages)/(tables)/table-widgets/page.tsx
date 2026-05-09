import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import {
  AdvisorContactCardWidget,
  FundsAvailabilityBannerWidget,
  LoanNoticeStripWidget,
  LoanRepaymentSummaryWidget,
  SegmentedOutstandingCardWidget,
  StatMetricCardsWidget,
  SummaryStatsActionWidget,
  UpcomingPaymentsMiniTableWidget,
  WidgetMainSideLayout,
  WidgetSection,
  WidgetShowcaseSection,
  StatusPillWidget,
} from "@/components/widgets";
import { PlusIcon } from "@/icons";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Table widgets | MLCC Dashboard",
  description:
    "Reusable table-adjacent dashboard widgets: metrics, balances, loan summaries, and layouts.",
};

const statSample = [
  {
    primary: "7",
    label: "Total outstanding",
    secondary: "$22,272.18",
    tone: "default" as const,
  },
  {
    primary: "3",
    label: "Overdue",
    secondary: "$13,110.00",
    tone: "warning" as const,
  },
  {
    primary: "0",
    label: "Due in next 7 days",
    secondary: "$0.00",
    tone: "neutral" as const,
  },
];

const upcomingRows = [
  {
    id: "1",
    date: "May 16",
    payment: "$2,199.99",
    endingBalance: "$42,000.00",
  },
  {
    id: "2",
    date: "Jun 16",
    payment: "$2,199.99",
    endingBalance: "$39,800.01",
  },
  {
    id: "3",
    date: "Jul 16",
    payment: "$2,199.99",
    endingBalance: "$37,600.02",
  },
];

const segmentedCard = (
  <SegmentedOutstandingCardWidget
    title="Outstanding balance"
    amountLabel="$5,000,000.00"
    actionLabel="Request funds"
    subtitle="Interest only ends May 19, 2026"
    segments={[
      { key: "out", label: "Outstanding", fill: "#1d64f2", flex: 5 },
      { key: "avail", label: "Available", fill: "#93b4fb", flex: 1 },
      { key: "unav", label: "Unavailable", fill: "#e8eefc", flex: 1 },
      { key: "exp", label: "Expired", fill: "#9ca3af", flex: 1 },
    ]}
    legend={[
      { key: "a", text: "$5M outstanding", dotColor: "#1d64f2" },
      { key: "b", text: "$1M available today", dotColor: "#93b4fb" },
      { key: "c", text: "$2M unavailable", dotColor: "#e8eefc" },
      { key: "d", text: "$1M expired", dotColor: "#9ca3af" },
    ]}
    footer={
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <StatusPillWidget label="Monthly Reporting" status="Up to date" />
        <span className="text-mercury-caption text-mercury-ink dark:text-white/85">
          You&apos;re up to date!
        </span>
      </div>
    }
  />
);

export default function TableWidgetsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Table widgets" />

      <div className="mt-2 max-w-6xl space-y-16">
        <p className="text-mercury-body text-mercury-muted dark:text-white/55">
          Gallery of widgets that typically sit above a data table. Use{" "}
          <span className="font-mono text-mercury-ink dark:text-white/80">
            WidgetSection
          </span>{" "}
          for equal 1-/2-/3-column bands, or{" "}
          <span className="font-mono text-mercury-ink dark:text-white/80">
            WidgetMainSideLayout
          </span>{" "}
          for a wide primary column plus a stacked sidebar.
        </p>

        <WidgetShowcaseSection
          componentName="StatMetricCardsWidget"
          title="Stat metric cards"
          description="KPI tiles: headline figure, label, optional subtotal. Tones emphasize default, warning, or neutral counts."
        >
          <div className="space-y-8">
            <div>
              <p className="mb-3 text-mercury-caption font-medium text-mercury-muted">
                Columns: 1
              </p>
              <StatMetricCardsWidget items={statSample.slice(0, 1)} columns={1} />
            </div>
            <div>
              <p className="mb-3 text-mercury-caption font-medium text-mercury-muted">
                Columns: 2
              </p>
              <StatMetricCardsWidget items={statSample.slice(0, 2)} columns={2} />
            </div>
            <div>
              <p className="mb-3 text-mercury-caption font-medium text-mercury-muted">
                Columns: 3
              </p>
              <StatMetricCardsWidget items={statSample} columns={3} />
            </div>
          </div>
        </WidgetShowcaseSection>

        <WidgetShowcaseSection
          componentName="FundsAvailabilityBannerWidget"
          title="Funds availability banner"
          description="Primary balance with optional info and verified badge; secondary metrics use superscript cents."
        >
          <div className="space-y-8">
            <div>
              <p className="mb-3 text-mercury-caption font-medium text-mercury-muted">
                Primary column only
              </p>
              <FundsAvailabilityBannerWidget
                primaryLabel="Available"
                primaryValue="$5,144,707.08"
                showInfo
                verified
              />
            </div>
            <div>
              <p className="mb-3 text-mercury-caption font-medium text-mercury-muted">
                Primary + secondary columns
              </p>
              <FundsAvailabilityBannerWidget
                primaryLabel="Available"
                primaryValue="$5,144,707.08"
                showInfo
                verified
                secondaries={[
                  { label: "Pending deposits", value: "$1,000.00" },
                  { label: "Pending transfers", value: "$71,764.10" },
                ]}
              />
            </div>
          </div>
        </WidgetShowcaseSection>

        <WidgetShowcaseSection
          componentName="SummaryStatsActionWidget"
          title="Summary stats + primary action"
          description="Responsive stat grid beside an optional trailing CTA, separated by a vertical rule from `lg`."
        >
          <div className="space-y-8">
            <SummaryStatsActionWidget
              stats={[{ label: "Total", value: "$10,011,000" }]}
              actionLabel="Create new SAFE +"
              actionEndIcon={<PlusIcon className="size-4" aria-hidden />}
            />
            <SummaryStatsActionWidget
              stats={[
                { label: "Total", value: "$10,011,000" },
                {
                  label: "Received",
                  value: "$1,000",
                  valueClassName: "text-success-600 dark:text-success-400",
                },
              ]}
              actionLabel="Create new SAFE +"
              actionEndIcon={<PlusIcon className="size-4" aria-hidden />}
            />
            <SummaryStatsActionWidget
              stats={[
                { label: "Total", value: "$10,011,000" },
                {
                  label: "Received",
                  value: "$1,000",
                  valueClassName: "text-success-600 dark:text-success-400",
                },
                { label: "Outstanding", value: "$10,010,000" },
                { label: "SAFEs", value: "3" },
              ]}
              actionLabel="Create new SAFE +"
              actionEndIcon={<PlusIcon className="size-4" aria-hidden />}
            />
          </div>
        </WidgetShowcaseSection>

        <WidgetShowcaseSection
          componentName="SegmentedOutstandingCardWidget"
          title="Segmented outstanding card"
          description="Balances with proportional segments, color legend, and optional footer banner area."
        >
          <div className="space-y-10">
            <div>{segmentedCard}</div>

            <div>
              <p className="mb-3 text-mercury-caption font-medium text-mercury-muted">
                Narrow width (still readable on mobile)
              </p>
              <div className="max-w-md">{segmentedCard}</div>
            </div>
          </div>
        </WidgetShowcaseSection>

        <WidgetShowcaseSection
          componentName="LoanNoticeStripWidget"
          title="Loan notice strips"
          description='Compact pill rows for timeline nudges or file actions. Use variant "notification" for a trailing link.'
        >
          <div className="max-w-xl space-y-4">
            <LoanNoticeStripWidget
              variant="notification"
              message="Next payment May 31"
              actionLabel="View more >"
            />
            <LoanNoticeStripWidget
              variant="download"
              message="Download loan agreement"
            />
          </div>
        </WidgetShowcaseSection>

        <WidgetShowcaseSection
          componentName="AdvisorContactCardWidget"
          title="Advisor contact card"
          description="Support block with initials avatar and linked email."
        >
          <div className="max-w-md">
            <AdvisorContactCardWidget
              title="Questions?"
              subtitle="Contact your capital advisor"
              initials="JC"
              name="Jake Cooper"
              email="jacobc@mercury.com"
              emailHref="mailto:jacobc@mercury.com"
            />
          </div>
        </WidgetShowcaseSection>

        <WidgetShowcaseSection
          componentName="StatusPillWidget"
          title="Status pill"
          description="Tiny label plus pill badge pair; used inside footers such as segmented card reporting rows."
        >
          <StatusPillWidget label="Monthly Reporting" status="Up to date" />
        </WidgetShowcaseSection>

        <WidgetShowcaseSection
          componentName="LoanRepaymentSummaryWidget"
          title="Loan repayment summary"
          description="Balance with superscript cents, optional header badge, progress bar, legend, and footer text actions."
        >
          <div className="max-w-xl">
            <LoanRepaymentSummaryWidget
              title="Outstanding balance"
              badge="13 payments left"
              amount="$30,800.00"
              repaymentLabel="Repayment progress"
              repaidFraction={0.12}
              repaidLegend="Repaid"
              outstandingLegend="Outstanding"
              actions={[
                {
                  key: "autopay",
                  label: "Edit autopay",
                  icon: "edit",
                },
                {
                  key: "loan",
                  label: "Download loan agreement",
                  icon: "download",
                },
              ]}
            />
          </div>
        </WidgetShowcaseSection>

        <WidgetShowcaseSection
          componentName="UpcomingPaymentsMiniTableWidget"
          title="Upcoming payments mini table"
          description="Muted header chrome with a slim three-column table and superscript cents in amount cells."
        >
          <UpcomingPaymentsMiniTableWidget
            title="Upcoming payments"
            headerLinkLabel="View full schedule >"
            columns={{
              date: "Date",
              payment: "Payment",
              endingBalance: "Ending Balance",
            }}
            rows={upcomingRows}
          />
        </WidgetShowcaseSection>

        <WidgetShowcaseSection
          componentName="WidgetSection"
          title="Equal-width columns (layout)"
          description="Responsive grid preset: pass columns 1 | 2 | 3."
        >
          <div className="space-y-8">
            <div>
              <p className="mb-3 text-mercury-caption font-medium text-mercury-muted">
                Columns: 1
              </p>
              <WidgetSection columns={1}>
                <StatMetricCardsWidget items={statSample.slice(0, 1)} columns={1} />
              </WidgetSection>
            </div>
            <div>
              <p className="mb-3 text-mercury-caption font-medium text-mercury-muted">
                Columns: 2 → repayment + upcoming table side by side from `md`
              </p>
              <WidgetSection columns={2}>
                <LoanRepaymentSummaryWidget
                  title="Outstanding balance"
                  badge="13 payments left"
                  amount="$30,800.00"
                  repaymentLabel="Repayment progress"
                  repaidFraction={0.35}
                  repaidLegend="Repaid"
                  outstandingLegend="Outstanding"
                  actions={[
                    { key: "a", label: "Edit autopay", icon: "edit" },
                    { key: "b", label: "Download loan agreement", icon: "download" },
                  ]}
                />
                <UpcomingPaymentsMiniTableWidget
                  title="Upcoming payments"
                  headerLinkLabel="View full schedule >"
                  columns={{
                    date: "Date",
                    payment: "Payment",
                    endingBalance: "Ending Balance",
                  }}
                  rows={upcomingRows}
                />
              </WidgetSection>
            </div>
            <div>
              <p className="mb-3 text-mercury-caption font-medium text-mercury-muted">
                Columns: 3 → three KPI cards
              </p>
              <WidgetSection columns={3}>
                {statSample.map((item) => (
                  <StatMetricCardsWidget key={item.label} items={[item]} columns={1} />
                ))}
              </WidgetSection>
            </div>
          </div>
        </WidgetShowcaseSection>

        <WidgetShowcaseSection
          componentName="WidgetMainSideLayout"
          title="Main + sidebar composition (layout)"
          description="Use for wide analytical cards beside stacked utility widgets (loan desk pattern)."
        >
          <WidgetMainSideLayout
            main={segmentedCard}
            side={
              <>
                <LoanNoticeStripWidget
                  variant="notification"
                  message="Next payment May 31"
                  actionLabel="View more >"
                />
                <LoanNoticeStripWidget
                  variant="download"
                  message="Download loan agreement"
                />
                <AdvisorContactCardWidget
                  title="Questions?"
                  subtitle="Contact your capital advisor"
                  initials="JC"
                  name="Jake Cooper"
                  email="jacobc@mercury.com"
                  emailHref="mailto:jacobc@mercury.com"
                />
              </>
            }
          />
        </WidgetShowcaseSection>
      </div>
    </div>
  );
}
