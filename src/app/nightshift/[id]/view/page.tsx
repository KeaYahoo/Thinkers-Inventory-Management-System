'use client';

import { use } from "react";
import Link from "next/link";
import { Download, ClipboardList } from "lucide-react";
import { NexusBlock } from "@/components/NexusBlock";
import { useNightShiftReport } from "@/hooks/useNightShiftReports";

type PageProps = { params: Promise<{ id: string }> };

const checklistItems = [
  "Vehicle inspected and secured",
  "Fuel level recorded",
  "Tyres and wheel nuts checked",
  "Lights and indicators checked",
  "Tools and spares accounted for",
  "Incidents logged (if any)",
  "Non-compliance noted (if any)",
];

const splitStaff = (staff: string) =>
  staff
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

export default function NightShiftReportViewPage({ params }: PageProps) {
  const { id } = use(params);
  const { report, isLoading, error } = useNightShiftReport(id);

  if (isLoading) {
    return (
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <NexusBlock className="mx-auto w-full max-w-3xl p-6 sm:p-8 text-sm text-primary-muted">
          Loading report...
        </NexusBlock>
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-3xl nexus-block border-red-200 bg-red-50 p-6 sm:p-8 text-sm text-red-600">
          {error?.message ?? "Report not found"}
        </div>
      </main>
    );
  }

  const staff = splitStaff(report.staff);

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <NexusBlock className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary-muted">Night shift</p>
            <h1 className="text-3xl font-semibold text-primary">Report details</h1>
            <p className="mt-1 text-sm text-primary-muted">
              {new Date(report.date).toLocaleDateString("en-ZA")} {report.vehicle?.regNumber ? `· ${report.vehicle.regNumber}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`/api/reports/nightshift/${id}/pdf`}
              aria-label="Download night shift report PDF"
              className="btn-brand focus-ring inline-flex items-center gap-2"
            >
              <Download size={16} aria-hidden />
              Download PDF
            </a>
            <Link href={`/nightshift/${id}`} className="rounded-full border border-border-subtle px-4 py-2 text-sm font-semibold text-primary hover:bg-canvas focus-ring">
              Edit
            </Link>
          </div>
        </NexusBlock>

        <NexusBlock className="p-6 sm:p-8">
          <p className="text-xs uppercase tracking-widest text-primary-muted">Staff</p>
          {staff.length ? (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {staff.map((name) => (
                <li key={name} className="rounded-xl border border-border-subtle bg-canvas px-3 py-2 text-sm text-primary">
                  {name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-primary-muted">No staff recorded.</p>
          )}
        </NexusBlock>

        <NexusBlock className="p-6 sm:p-8">
          <p className="text-xs uppercase tracking-widest text-primary-muted">Shift summary</p>
          <p className="mt-3 whitespace-pre-wrap text-sm text-primary">{report.shiftSummary}</p>
        </NexusBlock>

        <div className="grid gap-4 sm:grid-cols-2">
          <NexusBlock className="p-6 sm:p-8">
            <p className="text-xs uppercase tracking-widest text-primary-muted">Incidents</p>
            <p className="mt-3 whitespace-pre-wrap text-sm text-primary">{report.incidents || "None reported."}</p>
          </NexusBlock>
          <NexusBlock className="p-6 sm:p-8">
            <p className="text-xs uppercase tracking-widest text-primary-muted">Non-compliance</p>
            <p className="mt-3 whitespace-pre-wrap text-sm text-primary">
              {report.nonCompliance || "None reported."}
            </p>
          </NexusBlock>
        </div>

        <NexusBlock className="p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <ClipboardList size={18} aria-hidden className="text-brand" />
            <p className="text-xs uppercase tracking-widest text-primary-muted">Checklist</p>
          </div>
          <ul className="mt-4 grid gap-2">
            {checklistItems.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-primary">
                <span aria-hidden className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded border border-border-subtle bg-surface">
                  {" "}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </NexusBlock>

        <div className="text-center">
          <Link href="/nightshift" className="text-sm font-semibold text-brand underline">
            Back to night shift reports
          </Link>
        </div>
      </div>
    </main>
  );
}

