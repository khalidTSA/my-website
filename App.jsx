import { useMemo, useState } from "react";
import "./style.css";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [selectedPreview, setSelectedPreview] = useState(null);

  const [form, setForm] = useState({
    totalSales: 0,
    cardSales: 0,
    jahezApp: 0,
    hungerstationApp: 0,
    keetaApp: 0,
    mrsoolApp: 0,
    ninjaApp: 0,
    theChefzApp: 0,
    otherApp: 0,
    gas: 0,
    grocery: 0,
    staffMeals: 0,
    otherExpenseAmount: 0,
  });

  const [activityLog, setActivityLog] = useState([
    {
      id: 1,
      user: "Supervisor C",
      action: "Edited Gas expense",
      oldValue: "40",
      newValue: "30",
      reason: "Corrected gas expense based on branch request",
      dateTime: "2026-04-25 10:45 PM",
    },
  ]);

  const [submittedReports, setSubmittedReports] = useState([
    {
      id: 1,
      reportDate: "2026-04-25",
      totalSales: 5000,
      cardSales: 1500,
      appSales: 800,
      expenses: 80,
      netCash: 2620,
      status: "Submitted",
    },
    {
      id: 2,
      reportDate: "2026-04-24",
      totalSales: 4200,
      cardSales: 1300,
      appSales: 600,
      expenses: 120,
      netCash: 2180,
      status: "Submitted",
    },
  ]);

  const updateValue = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: Number(value) || 0 }));
  };

  const netCash = useMemo(() => {
    return (
      form.totalSales -
      form.cardSales -
      form.jahezApp -
      form.hungerstationApp -
      form.keetaApp -
      form.mrsoolApp -
      form.ninjaApp -
      form.theChefzApp -
      form.otherApp -
      form.gas -
      form.grocery -
      form.staffMeals -
      form.otherExpenseAmount
    );
  }, [form]);

  const fields = [
    ["Total Sales", "totalSales"],
    ["Card / Network", "cardSales"],
    ["Jahez App", "jahezApp"],
    ["HungerStation App", "hungerstationApp"],
    ["Keeta App", "keetaApp"],
    ["Mrsool App", "mrsoolApp"],
    ["Ninja App", "ninjaApp"],
    ["The Chefz App", "theChefzApp"],
    ["Other App", "otherApp"],
  ];

  const expenseFields = [
    ["Gas", "gas"],
    ["Grocery", "grocery"],
    ["Staff Meals", "staffMeals"],
  ];

  const managerReports = [
    { id: 101, branchName: "Branch 1", reportDate: "2026-04-25", totalSales: 5000, cardSales: 1500, appSales: 800, expenses: 80, netCash: 2620, status: "Submitted" },
    { id: 102, branchName: "Branch 2", reportDate: "2026-04-25", totalSales: 7200, cardSales: 2100, appSales: 950, expenses: 150, netCash: 4000, status: "Edited - Pending Review" },
    { id: 103, branchName: "Branch 3", reportDate: "2026-04-24", totalSales: 4200, cardSales: 1300, appSales: 600, expenses: 120, netCash: 2180, status: "Submitted" },
  ];
  const missingBranches = ["Branch 4", "Branch 7", "Branch 9"];
  const editedPendingReports = managerReports.filter((r) => r.status.includes("Pending"));

  if (!isLoggedIn) {
    return (
      <div className="page center" dir="ltr">
        <div className="card login-card">
          <h1>Secure Login</h1>
          <p className="muted">Daily Branch Report System</p>
          <label>Email</label>
          <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Enter your email" />
          <label>Password</label>
          <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Enter your password" />
          <button className="primary" onClick={() => setIsLoggedIn(true)}>Login</button>
        </div>
      </div>
    );
  }

  if (loginEmail.toLowerCase().includes("manager")) {
    return (
      <div className="page" dir="ltr">
        <div className="container wide">
          <div className="card header-row">
            <div>
              <h1>Manager Dashboard</h1>
              <p className="muted">All Branch Reports Overview</p>
            </div>
            <button className="secondary" onClick={() => setIsLoggedIn(false)}>Logout</button>
          </div>

          <div className="summary-grid">
            <div className="card"><p className="muted">Submitted Reports</p><h2>{managerReports.length}</h2></div>
            <div className="card"><p className="muted">Missing Branches</p><h2>{missingBranches.length}</h2></div>
            <div className="card"><p className="muted">Edited / Pending</p><h2>{editedPendingReports.length}</h2></div>
          </div>

          <div className="card">
            <h2>All Branch Reports</h2>
            <ReportTable reports={managerReports} showBranch onPreview={setSelectedPreview} />
          </div>

          <div className="card">
            <h2>Branches Without Reports</h2>
            <div className="chips">{missingBranches.map((b) => <span key={b}>{b}</span>)}</div>
          </div>

          <div className="card">
            <h2>Edited Reports Pending Review</h2>
            {editedPendingReports.map((r) => (
              <div className="pending" key={r.id}>
                <div><strong>{r.branchName} - {r.reportDate}</strong><p className="muted">Edited after submission and awaiting manager review</p></div>
                <button className="secondary">Review</button>
              </div>
            ))}
          </div>

          {selectedPreview && <PreviewBox report={selectedPreview} onClose={() => setSelectedPreview(null)} />}
        </div>
      </div>
    );
  }

  const appSalesTotal =
    form.jahezApp + form.hungerstationApp + form.keetaApp + form.mrsoolApp + form.ninjaApp + form.theChefzApp + form.otherApp;
  const expensesTotal = form.gas + form.grocery + form.staffMeals + form.otherExpenseAmount;

  const editReport = (report) => {
    setForm({
      totalSales: report.totalSales || 0,
      cardSales: report.cardSales || 0,
      jahezApp: 0,
      hungerstationApp: 0,
      keetaApp: 0,
      mrsoolApp: 0,
      ninjaApp: 0,
      theChefzApp: 0,
      otherApp: report.appSales || 0,
      gas: 0,
      grocery: 0,
      staffMeals: 0,
      otherExpenseAmount: report.expenses || 0,
    });
    setReportDate(report.reportDate || "");
    setSelectedPreview(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="page" dir="ltr">
      <div className="container">
        <div className="card">
          <div className="header-row">
            <div>
              <h1>Daily Branch Report</h1>
              <p className="muted">Branch User - Daily Data Entry</p>
            </div>
            <button className="secondary" onClick={() => setIsLoggedIn(false)}>Logout</button>
          </div>

          <div className="row">
            <label>Report Date</label>
            <input type="date" lang="en-US" value={reportDate} onChange={(e) => setReportDate(e.target.value)} />
          </div>

          <h2>Sales</h2>
          {fields.map(([label, key]) => (
            <div className="row" key={key}>
              <label>{label}</label>
              <input type="number" placeholder="0" value={form[key] || ""} onChange={(e) => updateValue(key, e.target.value)} />
            </div>
          ))}

          <h2>Expenses</h2>
          {expenseFields.map(([label, key]) => (
            <div className="row" key={key}>
              <label>{label}</label>
              <input type="number" placeholder="0" value={form[key] || ""} onChange={(e) => updateValue(key, e.target.value)} />
            </div>
          ))}
          <div className="row">
            <label>Other Expense</label>
            <div className="split">
              <input type="text" placeholder="Write details" />
              <input type="number" placeholder="0" value={form.otherExpenseAmount || ""} onChange={(e) => updateValue("otherExpenseAmount", e.target.value)} />
            </div>
          </div>

          <div className="net"><strong>Net Cash</strong><strong>{netCash.toLocaleString()}</strong></div>

          <button
            className="primary"
            onClick={() => {
              const now = new Date().toLocaleString("en-US");
              const today = reportDate || new Date().toISOString().slice(0, 10);
              setSubmittedReports((prev) => [
                { id: Date.now(), reportDate: today, totalSales: form.totalSales, cardSales: form.cardSales, appSales: appSalesTotal, expenses: expensesTotal, netCash, status: "Submitted" },
                ...prev,
              ].slice(0, 5));
              setActivityLog((prev) => [{ id: Date.now(), user: "Branch 1 User", action: "Submitted Daily Report", oldValue: "-", newValue: "Report submitted successfully", reason: "Daily branch report entry", dateTime: now }, ...prev]);
            }}
          >
            Submit Daily Report
          </button>
        </div>

        <div className="card">
          <div className="header-row"><h2>My Submitted Reports</h2><span className="muted">Last 5 reports</span></div>
          <ReportTable reports={submittedReports} onPreview={setSelectedPreview} />
        </div>

        {selectedPreview && <PreviewBox report={selectedPreview} onClose={() => setSelectedPreview(null)} onEdit={editReport} />}

        <div className="card">
          <h2>Activity Log</h2>
          {activityLog.map((log) => (
            <div className="log" key={log.id}>
              <div className="header-row"><strong>{log.action}</strong><span className="muted">{log.dateTime}</span></div>
              <p>User: <strong>{log.user}</strong></p>
              <p>Old Value: <strong>{log.oldValue}</strong> → New Value: <strong>{log.newValue}</strong></p>
              <p className="muted">Reason: {log.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReportTable({ reports, onPreview, showBranch = false }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {showBranch && <th>Branch</th>}
            <th>Date</th><th>Total Sales</th><th>Card</th><th>Apps</th><th>Expenses</th><th>Net Cash</th><th>Status</th><th>Preview</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id}>
              {showBranch && <td><strong>{report.branchName}</strong></td>}
              <td><strong>{report.reportDate}</strong></td>
              <td>{report.totalSales.toLocaleString()}</td>
              <td>{report.cardSales.toLocaleString()}</td>
              <td>{report.appSales.toLocaleString()}</td>
              <td>{report.expenses.toLocaleString()}</td>
              <td><strong>{report.netCash.toLocaleString()}</strong></td>
              <td><span className="status">{report.status}</span></td>
              <td><button className="secondary" onClick={() => onPreview(report)}>Preview</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PreviewBox({ report, onClose, onEdit }) {
  return (
    <div className="card">
      <div className="header-row">
        <h2>Report Preview</h2>
        <button className="secondary" onClick={onClose}>Close</button>
      </div>
      <p><strong>Date:</strong> {report.reportDate}</p>
      {report.branchName && <p><strong>Branch:</strong> {report.branchName}</p>}
      <p><strong>Total Sales:</strong> {report.totalSales.toLocaleString()}</p>
      <p><strong>Card / Network:</strong> {report.cardSales.toLocaleString()}</p>
      <p><strong>Apps Total:</strong> {report.appSales.toLocaleString()}</p>
      <p><strong>Expenses Total:</strong> {report.expenses.toLocaleString()}</p>
      <p><strong>Net Cash:</strong> {report.netCash.toLocaleString()}</p>
      <p><strong>Status:</strong> {report.status}</p>
      {onEdit && <p className="green">Editable for 3 hours after submission</p>}
      {onEdit && <button className="primary small" onClick={() => onEdit(report)}>Edit Report</button>}
    </div>
  );
}
