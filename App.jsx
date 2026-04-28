import { useEffect, useMemo, useState } from "react";

const money = (value) => Number(value || 0).toLocaleString("en-US");

export default function DailyBranchDataEntryPreview() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [editingReportId, setEditingReportId] = useState(null);

  const [form, setForm] = useState({
    totalSales: 0,
    cardSales: 0,
    jahez: 0,
    hungerStation: 0,
    keeta: 0,
    mrsool: 0,
    ninja: 0,
    theChefz: 0,
    otherAppName: "",
    otherAppAmount: 0,
    gas: 0,
    grocery: 0,
    staffMeals: 0,
    sawa: 0,
    benzin: 0,
    taxi: 0,
    otherCostNote: "",
    otherCostAmount: 0,
  });

  const [activityLog, setActivityLog] = useState([
    {
      id: 1,
      user: "Supervisor C",
      action: "Edited Gas cost",
      oldValue: "40",
      newValue: "30",
      reason: "Corrected gas cost based on branch request",
      dateTime: "2026-04-25 10:45 PM",
    },
  ]);

  const [submittedReports, setSubmittedReports] = useState(() => {
    const saved = localStorage.getItem("submittedReports");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 1,
        reportDate: "2026-04-25",
        totalSales: 5000,
        cardSales: 1500,
        appSales: 800,
        costs: 80,
        netCash: 2620,
        status: "Submitted",
      },
      {
        id: 2,
        reportDate: "2026-04-24",
        totalSales: 4200,
        cardSales: 1300,
        appSales: 600,
        costs: 120,
        netCash: 2180,
        status: "Submitted",
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem("submittedReports", JSON.stringify(submittedReports));
  }, [submittedReports]);

  const updateNumber = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value === "" ? 0 : Number(value) || 0 }));
  };

  const updateText = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const appSalesTotal =
    form.jahez +
    form.hungerStation +
    form.keeta +
    form.mrsool +
    form.ninja +
    form.theChefz +
    form.otherAppAmount;

  const costsTotal =
    form.gas +
    form.grocery +
    form.staffMeals +
    form.sawa +
    form.benzin +
    form.taxi +
    form.otherCostAmount;

  const netCash = useMemo(() => {
    return form.totalSales - form.cardSales - appSalesTotal - costsTotal;
  }, [form.totalSales, form.cardSales, appSalesTotal, costsTotal]);

  const salesFields = [
    ["Total Sales", "totalSales"],
    ["Card / Network", "cardSales"],
    ["Jahez", "jahez"],
    ["HungerStation", "hungerStation"],
    ["Keeta", "keeta"],
    ["Mrsool", "mrsool"],
    ["Ninja", "ninja"],
    ["The Chefz", "theChefz"],
  ];

  const costFields = [
    ["Gas", "gas"],
    ["Grocery", "grocery"],
    ["Staff Meals", "staffMeals"],
    ["Sawa", "sawa"],
    ["Benzin", "benzin"],
    ["Taxi", "taxi"],
  ];

  const managerReports = submittedReports.map((report) => ({
    ...report,
    branchName: "Branch 1",
  }));

  const allBranches = [
    "Branch 1",
    "Branch 2",
    "Branch 3",
    "Branch 4",
    "Branch 5",
    "Branch 6",
    "Branch 7",
    "Branch 8",
    "Branch 9",
  ];
  const reportedBranches = new Set(managerReports.map((report) => report.branchName));
  const missingBranches = allBranches.filter((branch) => !reportedBranches.has(branch));
  const editedPendingReports = managerReports.filter((r) => r.status.includes("Pending"));

  const isManager = loginEmail.toLowerCase().includes("manager");

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-8 flex items-center justify-center" dir="ltr">
        <div className="w-full max-w-md rounded-3xl bg-white shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="mb-8">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold mb-4">
              BR
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-950">Secure Login</h1>
            <p className="text-slate-500 mt-2">Daily Branch Report System</p>
          </div>

          <div className="space-y-4">
            <InputBlock
              label="Email"
              type="email"
              value={loginEmail}
              onChange={setLoginEmail}
              placeholder="Enter your email"
            />
            <InputBlock
              label="Password"
              type="password"
              value={loginPassword}
              onChange={setLoginPassword}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setIsLoggedIn(true)}
              className="w-full rounded-2xl bg-slate-950 py-3.5 font-semibold text-white shadow-sm active:scale-[0.99]"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isManager) {
    return (
      <Shell
        title="Manager Dashboard"
        subtitle="All Branch Reports Overview"
        badge="Manager"
        onLogout={() => setIsLoggedIn(false)}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <SummaryCard label="Submitted Reports" value={managerReports.length} />
          <SummaryCard label="Missing Branches" value={missingBranches.length} />
          <SummaryCard label="Edited / Pending" value={editedPendingReports.length} />
        </div>

        <ReportsTable reports={managerReports} showBranch onPreview={setSelectedPreview} />

        <Card title="Branches Without Reports">
          <div className="flex flex-wrap gap-2">
            {missingBranches.map((branch) => (
              <span key={branch} className="rounded-full bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1.5 text-sm font-medium">
                {branch}
              </span>
            ))}
          </div>
        </Card>

        <Card title="Edited Reports Pending Review">
          {editedPendingReports.length === 0 ? (
            <p className="text-sm text-slate-500">No pending edited reports.</p>
          ) : (
            <div className="space-y-3">
              {editedPendingReports.map((report) => (
                <div key={report.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{report.branchName} - {report.reportDate}</p>
                    <p className="text-sm text-slate-500">Edited after submission and awaiting review.</p>
                  </div>
                  <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold">Review</button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {selectedPreview && (
          <ReportPreview report={selectedPreview} onClose={() => setSelectedPreview(null)} />
        )}
      </Shell>
    );
  }

  const submitReport = () => {
    const today = reportDate || new Date().toISOString().slice(0, 10);
    const now = new Date().toLocaleString("en-US");

    const existingReport = submittedReports.find((r) => r.reportDate === today && r.id !== editingReportId);
    if (existingReport && !editingReportId) {
      alert("A report already exists for this branch and date. Please edit the existing report instead.");
      return;
    }

    const reportData = {
      id: editingReportId || Date.now(),
      reportDate: today,
      totalSales: form.totalSales,
      cardSales: form.cardSales,
      appSales: appSalesTotal,
      costs: costsTotal,
      netCash,
      status: editingReportId ? "Edited - Pending Review" : "Submitted",
    };

    setSubmittedReports((prev) => {
      if (editingReportId) {
        return prev.map((report) => (report.id === editingReportId ? reportData : report));
      }
      return [reportData, ...prev].slice(0, 5);
    });

    setEditingReportId(null);
    setActivityLog((prev) => [
      {
        id: Date.now(),
        user: "Branch 1 User",
        action: editingReportId ? "Edited Daily Report" : "Submitted Daily Report",
        oldValue: "-",
        newValue: "Report saved successfully",
        reason: editingReportId ? "Updated existing report" : "Daily branch report entry",
        dateTime: now,
      },
      ...prev,
    ]);
  };

  const loadReportForEdit = (report) => {
    setForm((prev) => ({
      ...prev,
      totalSales: report.totalSales || 0,
      cardSales: report.cardSales || 0,
    }));
    setReportDate(report.reportDate || "");
    setEditingReportId(report.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setSelectedPreview(null);
  };

  return (
    <Shell
      title="Daily Branch Report"
      subtitle="Branch User - Daily Data Entry"
      badge="Branch 1"
      onLogout={() => setIsLoggedIn(false)}
    >
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <InputBlock
            label="Report Date"
            type="date"
            value={reportDate}
            onChange={setReportDate}
          />
          <div className="rounded-2xl bg-slate-950 text-white p-4">
            <p className="text-sm text-slate-300">Net Cash</p>
            <p className="text-3xl font-bold mt-1">{money(netCash)}</p>
          </div>
        </div>
      </Card>

      <Card title="Sales">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {salesFields.map(([label, key]) => (
            <InputBlock
              key={key}
              label={label}
              type="number"
              value={form[key] === 0 ? "" : form[key]}
              onChange={(value) => updateNumber(key, value)}
              placeholder="0"
            />
          ))}
          <OtherInput
            label="Other"
            note={form.otherAppName}
            amount={form.otherAppAmount}
            notePlaceholder="Write app name"
            onNoteChange={(value) => updateText("otherAppName", value)}
            onAmountChange={(value) => updateNumber("otherAppAmount", value)}
          />
        </div>
      </Card>

      <Card title="Costs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {costFields.map(([label, key]) => (
            <InputBlock
              key={key}
              label={label}
              type="number"
              value={form[key] === 0 ? "" : form[key]}
              onChange={(value) => updateNumber(key, value)}
              placeholder="0"
            />
          ))}
          <OtherInput
            label="Other"
            note={form.otherCostNote}
            amount={form.otherCostAmount}
            notePlaceholder="Write cost details"
            onNoteChange={(value) => updateText("otherCostNote", value)}
            onAmountChange={(value) => updateNumber("otherCostAmount", value)}
          />
        </div>
      </Card>

      <Card title="Attachments (Bill Photos)">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((num) => (
            <label key={num} className="block rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center cursor-pointer hover:bg-slate-100">
              <span className="block font-semibold text-slate-800">Attachment {num}</span>
              <span className="block text-sm text-slate-500 mt-1">Upload bill photo</span>
              <input type="file" accept="image/*" className="hidden" />
            </label>
          ))}
        </div>
      </Card>

      <div className="sticky bottom-0 z-10 bg-slate-100/90 backdrop-blur py-3 -mx-4 px-4 sm:static sm:bg-transparent sm:p-0 sm:m-0">
        <button
          type="button"
          onClick={submitReport}
          className="w-full rounded-2xl bg-slate-950 py-4 font-bold text-white shadow-sm active:scale-[0.99]"
        >
          {editingReportId ? "Update Daily Report" : "Submit Daily Report"}
        </button>
      </div>

      <ReportsTable reports={submittedReports} onPreview={setSelectedPreview} />

      {selectedPreview && (
        <ReportPreview
          report={selectedPreview}
          onClose={() => setSelectedPreview(null)}
          onEdit={() => loadReportForEdit(selectedPreview)}
        />
      )}

      <ActivityLog logs={activityLog} />
    </Shell>
  );
}

function Shell({ title, subtitle, badge, onLogout, children }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950" dir="ltr">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold truncate">{title}</h1>
              {badge && <span className="hidden sm:inline rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{badge}</span>}
            </div>
            <p className="text-sm text-slate-500 truncate">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold active:scale-[0.98]"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-5">
        {children}
      </main>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
      {title && <h2 className="text-lg font-bold mb-4">{title}</h2>}
      {children}
    </section>
  );
}

function InputBlock({ label, type = "text", value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-slate-700 mb-2">{label}</span>
      <input
        type={type}
        min={type === "number" ? "0" : undefined}
        step={type === "number" ? "0.01" : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
      />
    </label>
  );
}

function OtherInput({ label, note, amount, notePlaceholder, onNoteChange, onAmountChange }) {
  return (
    <div className="md:col-span-2">
      <span className="block text-sm font-semibold text-slate-700 mb-2">{label}</span>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-3">
        <input
          type="text"
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder={notePlaceholder}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
        />
        <input
          type="number"
          min="0"
          step="0.01"
          value={amount === 0 ? "" : amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="0"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
        />
      </div>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

function ReportsTable({ reports, onPreview, showBranch = false }) {
  return (
    <Card title={showBranch ? "All Branch Reports" : "My Submitted Reports"}>
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-200">
              {showBranch && <th className="py-3">Branch</th>}
              <th className="py-3">Date</th>
              <th className="py-3">Total Sales</th>
              <th className="py-3">Card</th>
              <th className="py-3">Apps</th>
              <th className="py-3">Costs</th>
              <th className="py-3">Net Cash</th>
              <th className="py-3">Status</th>
              <th className="py-3">Preview</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="border-b border-slate-100 last:border-b-0">
                {showBranch && <td className="py-4 font-semibold">{report.branchName}</td>}
                <td className="py-4 font-semibold">{report.reportDate}</td>
                <td className="py-4">{money(report.totalSales)}</td>
                <td className="py-4">{money(report.cardSales)}</td>
                <td className="py-4">{money(report.appSales)}</td>
                <td className="py-4">{money(report.costs)}</td>
                <td className="py-4 font-bold">{money(report.netCash)}</td>
                <td className="py-4"><StatusPill status={report.status} /></td>
                <td className="py-4">
                  <button type="button" onClick={() => onPreview(report)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50">
                    Preview
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {reports.map((report) => (
          <div key={report.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                {showBranch && <p className="text-sm font-bold text-slate-950">{report.branchName}</p>}
                <p className="text-sm text-slate-500">{report.reportDate}</p>
              </div>
              <StatusPill status={report.status} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Metric label="Total" value={report.totalSales} />
              <Metric label="Card" value={report.cardSales} />
              <Metric label="Apps" value={report.appSales} />
              <Metric label="Costs" value={report.costs} />
              <div className="col-span-2 rounded-xl bg-white p-3 border border-slate-200">
                <p className="text-xs text-slate-500">Net Cash</p>
                <p className="font-bold text-lg">{money(report.netCash)}</p>
              </div>
            </div>
            <button type="button" onClick={() => onPreview(report)} className="mt-3 w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold">
              Preview
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl bg-white p-3 border border-slate-200">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-bold">{money(value)}</p>
    </div>
  );
}

function StatusPill({ status }) {
  const pending = status.includes("Pending");
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${pending ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
      {status}
    </span>
  );
}

function ReportPreview({ report, onClose, onEdit }) {
  return (
    <Card title="Report Preview">
      <div className="space-y-3 text-sm">
        {report.branchName && <PreviewRow label="Branch" value={report.branchName} />}
        <PreviewRow label="Date" value={report.reportDate} />
        <PreviewRow label="Total Sales" value={money(report.totalSales)} />
        <PreviewRow label="Card / Network" value={money(report.cardSales)} />
        <PreviewRow label="Apps Total" value={money(report.appSales)} />
        <PreviewRow label="Costs Total" value={money(report.costs)} />
        <PreviewRow label="Net Cash" value={money(report.netCash)} strong />
        <PreviewRow label="Status" value={report.status} />
      </div>
      <div className="mt-5 flex flex-col sm:flex-row gap-3">
        {onEdit && (
          <button type="button" onClick={onEdit} className="rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white">
            Edit Report
          </button>
        )}
        <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold">
          Close
        </button>
      </div>
    </Card>
  );
}

function PreviewRow({ label, value, strong }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2 last:border-b-0">
      <span className="text-slate-500">{label}</span>
      <span className={strong ? "font-bold text-slate-950" : "font-semibold text-slate-800"}>{value}</span>
    </div>
  );
}

function ActivityLog({ logs }) {
  return (
    <Card title="Activity Log">
      <div className="space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
              <span className="font-bold text-slate-950">{log.action}</span>
              <span className="text-sm text-slate-500">{log.dateTime}</span>
            </div>
            <p className="text-sm">User: <span className="font-semibold">{log.user}</span></p>
            <p className="text-sm">Old Value: <span className="font-semibold">{log.oldValue}</span> → New Value: <span className="font-semibold">{log.newValue}</span></p>
            <p className="text-sm text-slate-500">Reason: {log.reason}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
