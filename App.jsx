import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [error, setError] = useState("");
  const [reports, setReports] = useState([]);
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [reportDate, setReportDate] = useState("");

  const [form, setForm] = useState({
    total_sales: 0,
    card_sales: 0,
    jahez_app: 0,
    hungerstation_app: 0,
    keeta_app: 0,
    mrsool_app: 0,
    ninja_app: 0,
    thechefz_app: 0,
    other_app: 0,
    gas_expense: 0,
    grocery_expense: 0,
    staff_meals: 0,
    other_expense: 0,
    other_expense_note: "",
  });

  const updateValue = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: Number(value) || 0 }));
  };

  const netCash = useMemo(() => {
    return (
      form.total_sales -
      form.card_sales -
      form.jahez_app -
      form.hungerstation_app -
      form.keeta_app -
      form.mrsool_app -
      form.ninja_app -
      form.thechefz_app -
      form.other_app -
      form.gas_expense -
      form.grocery_expense -
      form.staff_meals -
      form.other_expense
    );
  }, [form]);

  const appSalesTotal =
    form.jahez_app +
    form.hungerstation_app +
    form.keeta_app +
    form.mrsool_app +
    form.ninja_app +
    form.thechefz_app +
    form.other_app;

  const expensesTotal =
    form.gas_expense +
    form.grocery_expense +
    form.staff_meals +
    form.other_expense;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) loadProfile(data.session.user.email);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadProfile(session.user.email);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function loadProfile(email) {
    const { data, error } = await supabase
      .from("users_profile")
      .select("*")
      .eq("user_email", email)
      .single();

    if (error) {
      setError("User profile not found in users_profile.");
      return;
    }

    setProfile(data);
    loadReports(data);
  }

  async function loadReports(userProfile = profile) {
    let query = supabase
      .from("daily_reports")
      .select("*")
      .order("report_date", { ascending: false })
      .limit(50);

    if (userProfile?.role === "branch_user") {
      query = query.eq("branch_name", userProfile.branch_name).limit(5);
    }

    const { data, error } = await query;

    if (error) {
      setError(error.message);
      return;
    }

    setReports(data || []);
  }

  async function handleLogin() {
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) setError(error.message);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setReports([]);
  }

  async function submitReport() {
    setError("");

    const payload = {
      report_date: reportDate || new Date().toISOString().slice(0, 10),
      branch_name: profile?.branch_name || "Branch 1",
      total_sales: form.total_sales,
      card_sales: form.card_sales,
      jahez_app: form.jahez_app,
      hungerstation_app: form.hungerstation_app,
      keeta_app: form.keeta_app,
      mrsool_app: form.mrsool_app,
      ninja_app: form.ninja_app,
      thechefz_app: form.thechefz_app,
      gas_expense: form.gas_expense,
      grocery_expense: form.grocery_expense,
      staff_meals: form.staff_meals,
      other_expense: form.other_expense,
      other_expense_note: form.other_expense_note,
      net_cash: netCash,
      created_by: session.user.email,
    };

    const { error } = await supabase.from("daily_reports").insert(payload);

    if (error) {
      setError(error.message);
      return;
    }

    await supabase.from("activity_log").insert({
      user_email: session.user.email,
      user_role: profile.role,
      action_type: "Submitted Daily Report",
      field_name: "daily_reports",
      old_value: "-",
      new_value: "Report submitted successfully",
      reason: "Daily branch report entry",
    });

    await loadReports();
    alert("Daily report submitted successfully");
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6" dir="ltr">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8">
          <h1 className="text-2xl font-bold mb-2">Secure Login</h1>
          <p className="text-gray-500 mb-6">Daily Branch Report System</p>

          {error && <p className="mb-4 text-red-600 text-sm">{error}</p>}

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
              onClick={handleLogin}
              className="w-full bg-black text-white rounded-2xl py-3 font-semibold cursor-pointer"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <div className="p-8">Loading profile...</div>;
  }

  if (profile.role === "manager") {
    const missingBranches = ["Branch 4", "Branch 7", "Branch 9"];
    const editedPendingReports = reports.filter((r) => r.is_locked === true);

    return (
      <div className="min-h-screen bg-gray-50 p-6" dir="ltr">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border p-8 flex justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Manager Dashboard</h1>
              <p className="text-gray-500">All Branch Reports Overview</p>
            </div>
            <button onClick={handleLogout} className="border rounded-xl px-4 py-2 text-sm font-medium">
              Logout
            </button>
          </div>

          {error && <p className="text-red-600">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border rounded-2xl p-5">
              <p className="text-gray-500 text-sm">Submitted Reports</p>
              <p className="text-3xl font-bold mt-2">{reports.length}</p>
            </div>
            <div className="bg-white border rounded-2xl p-5">
              <p className="text-gray-500 text-sm">Missing Branches</p>
              <p className="text-3xl font-bold mt-2">{missingBranches.length}</p>
            </div>
            <div className="bg-white border rounded-2xl p-5">
              <p className="text-gray-500 text-sm">Edited / Pending</p>
              <p className="text-3xl font-bold mt-2">{editedPendingReports.length}</p>
            </div>
          </div>

          <section className="bg-white border rounded-2xl p-5">
            <h2 className="text-lg font-semibold mb-4">All Branch Reports</h2>
            <ReportTable reports={reports} setSelectedPreview={setSelectedPreview} showBranch />
          </section>

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

          {selectedPreview && (
            <ReportPreview report={selectedPreview} onClose={() => setSelectedPreview(null)} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="ltr">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border p-8">
        <h1 className="text-2xl font-bold mb-2">Daily Branch Report</h1>

        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-500">{profile.branch_name} - Daily Data Entry</p>
          <button onClick={handleLogout} className="border rounded-xl px-4 py-2 text-sm font-medium">
            Logout
          </button>
        </div>

        {error && <p className="mb-4 text-red-600 text-sm">{error}</p>}

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

        <EntryFields form={form} updateValue={updateValue} setForm={setForm} />

        <section className="bg-gray-100 rounded-2xl p-5 mt-6">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Net Cash</span>
            <span className="text-2xl font-bold">{netCash.toLocaleString()}</span>
          </div>
        </section>

        <button
          type="button"
          onClick={submitReport}
          className="w-full bg-black text-white rounded-2xl py-3 font-semibold cursor-pointer hover:opacity-90 transition mt-6"
        >
          Submit Daily Report
        </button>

        <section className="border rounded-2xl p-5 bg-white mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">My Submitted Reports</h2>
            <span className="text-sm text-gray-500">Last 5 reports</span>
          </div>
          <ReportTable reports={reports} setSelectedPreview={setSelectedPreview} />
        </section>

        {selectedPreview && (
          <ReportPreview report={selectedPreview} onClose={() => setSelectedPreview(null)} />
        )}
      </div>
    </div>
  );
}

function EntryFields({ form, updateValue, setForm }) {
  const fields = [
    ["Total Sales", "total_sales"],
    ["Card / Network", "card_sales"],
    ["Jahez App", "jahez_app"],
    ["HungerStation App", "hungerstation_app"],
    ["Keeta App", "keeta_app"],
    ["Mrsool App", "mrsool_app"],
    ["Ninja App", "ninja_app"],
    ["The Chefz App", "thechefz_app"],
    ["Other App", "other_app"],
  ];

  const expenses = [
    ["Gas", "gas_expense"],
    ["Grocery", "grocery_expense"],
    ["Staff Meals", "staff_meals"],
  ];

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold mb-4">Sales</h2>
        <div className="grid gap-3">
          {fields.map(([label, key]) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <label className="font-medium w-56">{label}</label>
              <input
                type="number"
                value={form[key]}
                onChange={(e) => updateValue(key, e.target.value)}
                className="flex-1 border rounded-xl px-4 py-2"
              />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Expenses</h2>
        <div className="grid gap-3">
          {expenses.map(([label, key]) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <label className="font-medium w-56">{label}</label>
              <input
                type="number"
                value={form[key]}
                onChange={(e) => updateValue(key, e.target.value)}
                className="flex-1 border rounded-xl px-4 py-2"
              />
            </div>
          ))}

          <div className="flex items-center justify-between gap-4">
            <label className="font-medium w-56">Other Expense</label>
            <div className="flex-1 flex gap-3">
              <input
                type="text"
                value={form.other_expense_note}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, other_expense_note: e.target.value }))
                }
                placeholder="Write details"
                className="flex-1 border rounded-xl px-4 py-2"
              />
              <input
                type="number"
                value={form.other_expense}
                onChange={(e) => updateValue("other_expense", e.target.value)}
                className="w-40 border rounded-xl px-4 py-2"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ReportTable({ reports, setSelectedPreview, showBranch = false }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b">
            {showBranch && <th className="py-2">Branch</th>}
            <th className="py-2">Date</th>
            <th className="py-2">Total Sales</th>
            <th className="py-2">Card</th>
            <th className="py-2">Apps</th>
            <th className="py-2">Expenses</th>
            <th className="py-2">Net Cash</th>
            <th className="py-2">Status</th>
            <th className="py-2">Preview</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => {
            const apps =
              Number(report.jahez_app || 0) +
              Number(report.hungerstation_app || 0) +
              Number(report.keeta_app || 0) +
              Number(report.mrsool_app || 0) +
              Number(report.ninja_app || 0) +
              Number(report.thechefz_app || 0);

            const expenses =
              Number(report.gas_expense || 0) +
              Number(report.grocery_expense || 0) +
              Number(report.staff_meals || 0) +
              Number(report.other_expense || 0);

            return (
              <tr key={report.id} className="border-b last:border-b-0">
                {showBranch && <td className="py-3 font-medium">{report.branch_name}</td>}
                <td className="py-3 font-medium">{report.report_date}</td>
                <td className="py-3">{Number(report.total_sales || 0).toLocaleString()}</td>
                <td className="py-3">{Number(report.card_sales || 0).toLocaleString()}</td>
                <td className="py-3">{apps.toLocaleString()}</td>
                <td className="py-3">{expenses.toLocaleString()}</td>
                <td className="py-3 font-semibold">{Number(report.net_cash || 0).toLocaleString()}</td>
                <td className="py-3">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
                    Submitted
                  </span>
                </td>
                <td className="py-3">
                  <button
                    type="button"
                    onClick={() => setSelectedPreview(report)}
                    className="border rounded-lg px-3 py-1 text-sm font-medium cursor-pointer hover:bg-gray-50"
                  >
                    Preview
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ReportPreview({ report, onClose }) {
  return (
    <section className="border rounded-2xl p-5 bg-white mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Report Preview</h2>
        <button type="button" onClick={onClose} className="border rounded-lg px-3 py-1 text-sm">
          Close
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <p><span className="font-medium">Branch:</span> {report.branch_name}</p>
        <p><span className="font-medium">Date:</span> {report.report_date}</p>
        <p><span className="font-medium">Total Sales:</span> {Number(report.total_sales || 0).toLocaleString()}</p>
        <p><span className="font-medium">Card / Network:</span> {Number(report.card_sales || 0).toLocaleString()}</p>
        <p><span className="font-medium">Net Cash:</span> {Number(report.net_cash || 0).toLocaleString()}</p>
        <p className="text-green-600 font-medium">Editable for 3 hours after submission</p>
      </div>
    </section>
  );
}
