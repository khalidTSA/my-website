import { useEffect, useMemo, useState } from "react";

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
    attachment1: "",
    attachment2: "",
    attachment3: "",
    attachment4: "",
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

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6" dir="ltr">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8">
          <h1 className="text-2xl font-bold mb-2">Secure Login</h1>
          <p className="text-gray-500 mb-6">Daily Branch Report System</p>

          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-2">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="block font-medium mb-2">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsLoggedIn(true)}
              className="w-full bg-black text-white rounded-2xl py-3 font-semibold cursor-pointer"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

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

  const allBranches = ["Branch 1", "Branch 2", "Branch 3", "Branch 4", "Branch 5", "Branch 6", "Branch 7", "Branch 8", "Branch 9"];
  const reportedBranches = new Set(managerReports.map((report) => report.branchName));
  const missingBranches = allBranches.filter((branch) => !reportedBranches.has(branch));
  const editedPendingReports = managerReports.filter((r) => r.status.includes("Pending"));

  if (loginEmail.toLowerCase().includes("manager")) {
    return (
      <div className="min-h-screen bg-gray-50 p-6" dir="ltr">
        <div className="max-w-6xl mx-auto space-y-6">
          <Header
            title="Manager Dashboard"
            subtitle="All Branch Reports Overview"
            onLogout={() => setIsLoggedIn(false)}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard label="Submitted Reports" value={managerReports.length} />
            <SummaryCard label="Missing Branches" value={missingBranches.length} />
            <SummaryCard label="Edited / Pending" value={editedPendingReports.length} />
          </div>

          <ReportsTable reports={managerReports} showBranch onPreview={setSelectedPreview} />

          <section className="bg-white border rounded-2xl p-5">
            <h2 className="text-lg font-semibold mb-3">Branches Without Reports</h2>
            <div className="flex flex-wrap gap-2">
              {missingBranches.map((branch) => (
                <span key={branch} className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium">
                  {branch}
                </span>
              ))}
            </div>
          </section>

          <section className="bg-white border rounded-2xl p-5">
            <h2 className="text-lg font-semibold mb-3">Edited Reports Pending Review</h2>
            <div className="space-y-3">
              {editedPendingReports.map((report) => (
                <div key={report.id} className="border rounded-xl p-4 bg-gray-50 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{report.branchName} - {report.reportDate}</p>
                    <p className="text-sm text-gray-500">Edited after submission and awaiting manager review</p>
                  </div>
                  <button className="border rounded-lg px-3 py-1 text-sm font-medium">Review</button>
                </div>
              ))}
            </div>
          </section>

          {selectedPreview && (
            <ReportPreview report={selectedPreview} onClose={() => setSelectedPreview(null)} />
          )}
        </div>
      </div>
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
    <div className="min-h-screen bg-gray-50 p-6" dir="ltr">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border p-8">
        <Header
          title="Daily Branch Report"
          subtitle="Branch User - Daily Data Entry"
          onLogout={() => setIsLoggedIn(false)}
        />

        <div className="mb-8 flex items-center justify-between gap-4">
          <label className="font-medium w-56">Report Date</label>
          <input
            type="date"
            lang="en-US"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            className="flex-1 border rounded-xl px-4 py-2"
          />
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold mb-4">Sales</h2>
            <div className="grid gap-3">
              {salesFields.map(([label, key]) => (
                <NumberRow key={key} label={label} value={form[key]} onChange={(value) => updateNumber(key, value)} />
              ))}

              <OtherRow
                label="Other"
                notePlaceholder="Write app name"
                amount={form.otherAppAmount}
                note={form.otherAppName}
                onNoteChange={(value) => updateText("otherAppName", value)}
                onAmountChange={(value) => updateNumber("otherAppAmount", value)}
              />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">Costs</h2>
            <div className="grid gap-3">
              {costFields.map(([label, key]) => (
                <NumberRow key={key} label={label} value={form[key]} onChange={(value) => updateNumber(key, value)} />
              ))}

              <OtherRow
                label="Other"
                notePlaceholder="Write cost details"
                amount={form.otherCostAmount}
                note={form.otherCostNote}
                onNoteChange={(value) => updateText("otherCostNote", value)}
                onAmountChange={(value) => updateNumber("otherCostAmount", value)}
              />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">Attachments (Bill Photos)</h2>
            <div className="grid gap-3">
              {[1,2,3,4].map((num) => (
                <div key={num} className="flex items-center justify-between gap-4">
                  <label className="font-medium w-56">Attachment {num}</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="flex-1 border rounded-xl px-4 py-2 bg-white"
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="bg-gray-100 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Net Cash</span>
              <span className="text-2xl font-bold">{netCash.toLocaleString()}</span>
            </div>
          </section>

          <button
            type="button"
            onClick={submitReport}
            className="w-full bg-black text-white rounded-2xl py-3 font-semibold cursor-pointer hover:opacity-90 transition"
          >
            Submit Daily Report
          </button>

          <ReportsTable reports={submittedReports} onPreview={setSelectedPreview} />

          {selectedPreview && (
            <ReportPreview
              report={selectedPreview}
              onClose={() => setSelectedPreview(null)}
              onEdit={() => loadReportForEdit(selectedPreview)}
            />
          )}

          <section className="border rounded-2xl p-5 bg-white">
            <h2 className="text-lg font-semibold mb-4">Activity Log</h2>
            <div className="space-y-3">
              {activityLog.map((log) => (
                <div key={log.id} className="border rounded-xl p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{log.action}</span>
                    <span className="text-sm text-gray-500">{log.dateTime}</span>
                  </div>
                  <p className="text-sm">User: <span className="font-medium">{log.user}</span></p>
                  <p className="text-sm">
                    Old Value: <span className="font-medium">{log.oldValue}</span> → New Value: <span className="font-medium">{log.newValue}</span>
                  </p>
                  <p className="text-sm text-gray-500">Reason: {log.reason}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Header({ title, subtitle, onLogout }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-gray-500">{subtitle}</p>
      </div>
      <button type="button" onClick={onLogout} className="border rounded-xl px-4 py-2 text-sm font-medium">
        Logout
      </button>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="bg-white border rounded-2xl p-5">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

function NumberRow({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="font-medium w-56">{label}</label>
      <input
        type="number"
        min="0"
        step="0.01"
        value={value === 0 ? "" : value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 border rounded-xl px-4 py-2"
      />
    </div>
  );
}

function OtherRow({ label, note, amount, notePlaceholder, onNoteChange, onAmountChange }) {
  return (
    <div className="flex items-center justify-between gap-4 mt-3">
      <label className="font-medium w-56">{label}</label>
      <div className="flex-1 flex gap-3">
        <input
          type="text"
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder={notePlaceholder}
          className="flex-1 border rounded-xl px-4 py-2"
        />
        <input
          type="number"
          min="0"
          step="0.01"
          value={amount === 0 ? "" : amount}
          onChange={(e) => onAmountChange(e.target.value)}
          className="w-40 border rounded-xl px-4 py-2"
        />
      </div>
    </div>
  );
}

function ReportsTable({ reports, onPreview, showBranch = false }) {
  return (
    <section className="border rounded-2xl p-5 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{showBranch ? "All Branch Reports" : "My Submitted Reports"}</h2>
        <span className="text-sm text-gray-500">Last 5 reports</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              {showBranch && <th className="py-2">Branch</th>}
              <th className="py-2">Date</th>
              <th className="py-2">Total Sales</th>
              <th className="py-2">Card</th>
              <th className="py-2">Apps</th>
              <th className="py-2">Costs</th>
              <th className="py-2">Net Cash</th>
              <th className="py-2">Status</th>
              <th className="py-2">Preview</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="border-b last:border-b-0">
                {showBranch && <td className="py-3 font-medium">{report.branchName}</td>}
                <td className="py-3 font-medium">{report.reportDate}</td>
                <td className="py-3">{report.totalSales.toLocaleString()}</td>
                <td className="py-3">{report.cardSales.toLocaleString()}</td>
                <td className="py-3">{report.appSales.toLocaleString()}</td>
                <td className="py-3">{report.costs.toLocaleString()}</td>
                <td className="py-3 font-semibold">{report.netCash.toLocaleString()}</td>
                <td className="py-3">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">{report.status}</span>
                </td>
                <td className="py-3">
                  <button
                    type="button"
                    onClick={() => onPreview(report)}
                    className="border rounded-lg px-3 py-1 text-sm font-medium cursor-pointer hover:bg-gray-50"
                  >
                    Preview
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ReportPreview({ report, onClose, onEdit }) {
  return (
    <section className="border rounded-2xl p-5 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Report Preview</h2>
        <button type="button" onClick={onClose} className="border rounded-lg px-3 py-1 text-sm">Close</button>
      </div>
      <div className="space-y-2 text-sm">
        {report.branchName && <p><span className="font-medium">Branch:</span> {report.branchName}</p>}
        <p><span className="font-medium">Date:</span> {report.reportDate}</p>
        <p><span className="font-medium">Total Sales:</span> {report.totalSales.toLocaleString()}</p>
        <p><span className="font-medium">Card / Network:</span> {report.cardSales.toLocaleString()}</p>
        <p><span className="font-medium">Apps Total:</span> {report.appSales.toLocaleString()}</p>
        <p><span className="font-medium">Costs Total:</span> {report.costs.toLocaleString()}</p>
        <p><span className="font-medium">Net Cash:</span> {report.netCash.toLocaleString()}</p>
        <p><span className="font-medium">Status:</span> {report.status}</p>
        {onEdit && <p className="text-green-600 font-medium">Editable for 3 hours after submission</p>}
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="mt-4 bg-black text-white rounded-xl px-5 py-2 font-medium cursor-pointer hover:opacity-90"
          >
            Edit Report
          </button>
        )}
      </div>
    </section>
  );
}
