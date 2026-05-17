import { useState, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const tabs = ["Plan", "Check-in", "Adjust", "Status", "Ask"];

export default function App() {
  const [tab, setTab]         = useState("Plan");
  const [loading, setLoading] = useState(false);
  const [output, setOutput]   = useState("");

  // Plan
  const getPlan = async () => {
    setLoading(true); setOutput("");
    const res = await axios.get(`${API}/api/plan`);
    setOutput(res.data.plan);
    setLoading(false);
  };

  // Checkin
  const [checkin, setCheckin] = useState({
    workout_done: true, pain_level: 0, energy_level: 5,
    calories: 0, protein: 0, notes: ""
  });
  const submitCheckin = async () => {
    setLoading(true); setOutput("");
    const res = await axios.post(`${API}/api/checkin`, checkin);
    setOutput(res.data.feedback);
    setLoading(false);
  };

  // Adjust
  const [reason, setReason] = useState("");
  const submitAdjust = async () => {
    setLoading(true); setOutput("");
    const res = await axios.post(`${API}/api/adjust`, { reason });
    setOutput(res.data.adjusted_plan);
    setLoading(false);
  };

  // Status
  const [status, setStatus] = useState(null);
  const getStatus = async () => {
    setLoading(true);
    const res = await axios.get(`${API}/api/status`);
    setStatus(res.data); setLoading(false);
  };
  useEffect(() => { if (tab === "Status") getStatus(); }, [tab]);

  // Ask
  const [question, setQuestion] = useState("");
  const submitAsk = async () => {
    setLoading(true); setOutput("");
    const res = await axios.post(`${API}/api/ask`, { question });
    setOutput(res.data.answer);
    setLoading(false);
  };

  return (
    <div style={styles.app}>
      <h1 style={styles.title}>🔥 FitForge AI</h1>
      <p style={styles.sub}>53kg → 90kg | Your Daily Coach</p>

      {/* Tabs */}
      <div style={styles.tabs}>
        {tabs.map(t => (
          <button key={t} onClick={() => { setTab(t); setOutput(""); }}
            style={{ ...styles.tab, ...(tab === t ? styles.activeTab : {}) }}>
            {t}
          </button>
        ))}
      </div>

      <div style={styles.card}>

        {/* PLAN */}
        {tab === "Plan" && (
          <div>
            <p style={styles.hint}>Get today's workout + diet plan.</p>
            <button style={styles.btn} onClick={getPlan} disabled={loading}>
              {loading ? "Generating..." : "Generate Today's Plan"}
            </button>
          </div>
        )}

        {/* CHECKIN */}
        {tab === "Check-in" && (
          <div style={styles.form}>
            <p style={styles.hint}>Log what you did today.</p>
            <label style={styles.label}>Workout done?</label>
            <select style={styles.input}
              value={checkin.workout_done}
              onChange={e => setCheckin({...checkin, workout_done: e.target.value === "true"})}>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
            <label style={styles.label}>Back pain (0–10)</label>
            <input style={styles.input} type="number" min="0" max="10"
              value={checkin.pain_level}
              onChange={e => setCheckin({...checkin, pain_level: +e.target.value})} />
            <label style={styles.label}>Energy (0–10)</label>
            <input style={styles.input} type="number" min="0" max="10"
              value={checkin.energy_level}
              onChange={e => setCheckin({...checkin, energy_level: +e.target.value})} />
            <label style={styles.label}>Calories eaten</label>
            <input style={styles.input} type="number"
              value={checkin.calories}
              onChange={e => setCheckin({...checkin, calories: +e.target.value})} />
            <label style={styles.label}>Protein (g)</label>
            <input style={styles.input} type="number"
              value={checkin.protein}
              onChange={e => setCheckin({...checkin, protein: +e.target.value})} />
            <label style={styles.label}>Notes</label>
            <textarea style={styles.textarea}
              value={checkin.notes}
              onChange={e => setCheckin({...checkin, notes: e.target.value})} />
            <button style={styles.btn} onClick={submitCheckin} disabled={loading}>
              {loading ? "Submitting..." : "Submit Check-in"}
            </button>
          </div>
        )}

        {/* ADJUST */}
        {tab === "Adjust" && (
          <div>
            <p style={styles.hint}>Tell the agent what you can't do today.</p>
            <textarea style={styles.textarea}
              placeholder="e.g. I can't do pull-ups, shoulder is tight"
              value={reason}
              onChange={e => setReason(e.target.value)} />
            <button style={styles.btn} onClick={submitAdjust} disabled={loading}>
              {loading ? "Adjusting..." : "Adjust My Plan"}
            </button>
          </div>
        )}

        {/* STATUS */}
        {tab === "Status" && status && (
          <div style={styles.statusGrid}>
            <Stat label="Week" value={status.week_start} />
            <Stat label="Sessions" value={`${status.sessions_completed}/${status.sessions_target}`} />
            <Stat label="Calories" value={`${status.calories_this_week}/${status.calorie_target}`} />
            <Stat label="Protein" value={`${status.protein_this_week}g/${status.protein_target}g`} />
            <Stat label="Goal" value={status.weight_goal} />
          </div>
        )}

        {/* ASK */}
        {tab === "Ask" && (
          <div>
            <p style={styles.hint}>Ask anything about your fitness or diet.</p>
            <textarea style={styles.textarea}
              placeholder="e.g. What should I eat post-workout? How do I fix back pain?"
              value={question}
              onChange={e => setQuestion(e.target.value)} />
            <button style={styles.btn} onClick={submitAsk} disabled={loading}>
              {loading ? "Thinking..." : "Ask Agent"}
            </button>
          </div>
        )}

        {/* Output */}
        {loading && <div style={styles.loading}>⏳ Agent thinking...</div>}
        {output && (
          <div style={styles.output}>
            <ReactMarkdown>{output}</ReactMarkdown>
          </div>
        )}

      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={styles.statBox}>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statValue}>{value}</div>
    </div>
  );
}

const styles = {
  app:        { maxWidth: 640, margin: "0 auto", padding: "16px", fontFamily: "system-ui, sans-serif", background: "#0f0f0f", minHeight: "100vh", color: "#f0f0f0" },
  title:      { fontSize: 28, fontWeight: 800, margin: 0, color: "#ff6b35" },
  sub:        { color: "#888", marginTop: 4, marginBottom: 16, fontSize: 14 },
  tabs:       { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" },
  tab:        { padding: "8px 14px", borderRadius: 8, border: "1px solid #333", background: "#1a1a1a", color: "#aaa", cursor: "pointer", fontSize: 14 },
  activeTab:  { background: "#ff6b35", color: "#fff", border: "1px solid #ff6b35" },
  card:       { background: "#1a1a1a", borderRadius: 12, padding: 20, border: "1px solid #2a2a2a" },
  hint:       { color: "#888", fontSize: 13, marginBottom: 12 },
  form:       { display: "flex", flexDirection: "column", gap: 8 },
  label:      { fontSize: 13, color: "#aaa" },
  input:      { padding: "8px 12px", borderRadius: 8, border: "1px solid #333", background: "#111", color: "#f0f0f0", fontSize: 14 },
  textarea:   { padding: "10px 12px", borderRadius: 8, border: "1px solid #333", background: "#111", color: "#f0f0f0", fontSize: 14, minHeight: 80, resize: "vertical" },
  btn:        { marginTop: 8, padding: "12px 20px", borderRadius: 8, background: "#ff6b35", color: "#fff", border: "none", fontWeight: 700, fontSize: 15, cursor: "pointer" },
  output:     { marginTop: 20, padding: 16, background: "#111", borderRadius: 8, fontSize: 14, lineHeight: 1.7, borderLeft: "3px solid #ff6b35" },
  loading:    { marginTop: 16, color: "#888", fontSize: 14 },
  statusGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  statBox:    { background: "#111", padding: 16, borderRadius: 8, border: "1px solid #2a2a2a" },
  statLabel:  { fontSize: 12, color: "#888", marginBottom: 4 },
  statValue:  { fontSize: 18, fontWeight: 700, color: "#ff6b35" },
};