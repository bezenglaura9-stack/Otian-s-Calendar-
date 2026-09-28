import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import DayModal from "../components/DayModal";

function ymd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function CalendarScreen({ currentUser, onSwitchUser }) {
  const [viewDate, setViewDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const knownIds = useRef(null);
  const [banner, setBanner] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "events"), (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (knownIds.current !== null) {
        const fresh = docs.filter((d) => !knownIds.current.has(d.id) && d.by !== currentUser);
        if (fresh.length) {
          const last = fresh[fresh.length - 1];
          setBanner(`🔔 ${last.by} added "${last.title}"`);
          setTimeout(() => setBanner(""), 4000);
        }
      }
      knownIds.current = new Set(docs.map((d) => d.id));
      setEvents(docs);
    });
    return unsub;
  }, [currentUser]);

  const y = viewDate.getFullYear();
  const m = viewDate.getMonth();
  const first = new Date(y, m, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const todayStr = ymd(new Date());
  const eventDates = new Set(events.map((e) => e.date));

  const cells = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(ymd(new Date(y, m, d)));

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>The Otian's Calendar</Text>
      <Text style={styles.month}>{viewDate.toLocaleString("default", { month: "long", year: "numeric" })}</Text>
      <View style={styles.row}>
        <Text style={styles.muted}>Hi, {currentUser}</Text>
        <TouchableOpacity onPress={onSwitchUser}><Text style={styles.switchLink}>switch</Text></TouchableOpacity>
      </View>
      {!!banner && <View style={styles.banner}><Text style={styles.bannerText}>{banner}</Text></View>}

      <View style={styles.row}>
        <TouchableOpacity onPress={() => setViewDate(new Date(y, m - 1, 1))}>
          <Text style={styles.nav}>‹ Prev</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setViewDate(new Date(y, m + 1, 1))}>
          <Text style={styles.nav}>Next ›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <Text key={i} style={styles.dow}>{d}</Text>
        ))}
        {cells.map((dateStr, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.day,
              dateStr === todayStr && styles.dayToday,
            ]}
            disabled={!dateStr}
            onPress={() => setSelectedDate(dateStr)}
          >
            <Text style={styles.dayText}>{dateStr ? String(Number(dateStr.slice(-2))) : ""}</Text>
            {dateStr && eventDates.has(dateStr) && <View style={styles.dot} />}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.addButton} onPress={() => setSelectedDate(ymd(new Date()))}>
        <Text style={styles.addButtonText}>+ New Event</Text>
      </TouchableOpacity>

      <DayModal
        visible={!!selectedDate}
        date={selectedDate}
        events={events.filter((e) => e.date === selectedDate)}
        currentUser={currentUser}
        onClose={() => setSelectedDate(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: "#faf8f5" },
  subtitle: { color: "#8a8072", fontSize: 13 },
  month: { fontSize: 20, fontWeight: "700", color: "#2b2620", marginBottom: 6 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8, alignItems: "center" },
  muted: { color: "#8a8072" },
  switchLink: { color: "#8a8072", textDecorationLine: "underline" },
  banner: { backgroundColor: "#7d8f69", padding: 10, borderRadius: 10, marginBottom: 10 },
  bannerText: { color: "#fff" },
  nav: { color: "#c0653f", fontWeight: "700", padding: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", backgroundColor: "#fff", borderRadius: 14, padding: 10, borderWidth: 1, borderColor: "#eee3d6" },
  dow: { width: "14.28%", textAlign: "center", color: "#8a8072", fontSize: 11, marginBottom: 4 },
  day: { width: "14.28%", aspectRatio: 1, alignItems: "center", justifyContent: "center", borderRadius: 8 },
  dayToday: { borderWidth: 1, borderColor: "#c0653f" },
  dayText: { color: "#2b2620" },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#c0653f", marginTop: 2 },
  addButton: { backgroundColor: "#c0653f", padding: 14, borderRadius: 10, marginTop: 16, alignItems: "center" },
  addButtonText: { color: "#fff", fontWeight: "700" },
});
