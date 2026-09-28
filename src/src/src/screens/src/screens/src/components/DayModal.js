import React, { useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function DayModal({ visible, date, events, currentUser, onClose }) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [commentText, setCommentText] = useState({});

  async function saveEvent() {
    if (!title.trim()) return;
    await addDoc(collection(db, "events"), {
      title: title.trim(),
      date,
      time: time.trim(),
      notes: notes.trim(),
      by: currentUser,
      comments: [],
      createdAt: Date.now(),
    });
    setTitle("");
    setTime("");
    setNotes("");
    setShowForm(false);
  }

  async function addComment(eventId) {
    const text = (commentText[eventId] || "").trim();
    if (!text) return;
    const ev = events.find((e) => e.id === eventId);
    const comments = [...(ev.comments || []), { by: currentUser, text, at: Date.now() }];
    await updateDoc(doc(db, "events", eventId), { comments });
    setCommentText((prev) => ({ ...prev, [eventId]: "" }));
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.close}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.dateHeading}>{date}</Text>
          <ScrollView style={{ maxHeight: 380 }}>
            {events.length === 0 && <Text style={styles.muted}>No events yet.</Text>}
            {events.map((e) => (
              <View key={e.id} style={styles.event}>
                <Text style={styles.eventTitle}>
                  {e.title} {e.time ? `· ${e.time}` : ""}
                </Text>
                <Text style={styles.muted}>added by {e.by}</Text>
                {!!e.notes && <Text style={styles.eventNotes}>{e.notes}</Text>}
                {(e.comments || []).map((c, i) => (
                  <Text key={i} style={styles.comment}>
                    <Text style={{ fontWeight: "700" }}>{c.by}: </Text>
                    {c.text}
                  </Text>
                ))}
                <View style={styles.commentRow}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Add a note..."
                    value={commentText[e.id] || ""}
                    onChangeText={(t) => setCommentText((prev) => ({ ...prev, [e.id]: t }))}
                  />
                  <TouchableOpacity onPress={() => addComment(e.id)}>
                    <Text style={styles.send}>Send</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          {showForm ? (
            <View>
              <TextInput style={styles.input} placeholder="Event title" value={title} onChangeText={setTitle} />
              <TextInput style={styles.input} placeholder="Time (e.g. 6:00 PM)" value={time} onChangeText={setTime} />
              <TextInput style={styles.input} placeholder="Notes (optional)" value={notes} onChangeText={setNotes} multiline />
              <TouchableOpacity style={styles.button} onPress={saveEvent}>
                <Text style={styles.buttonText}>Save Event</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.button} onPress={() => setShowForm(true)}>
              <Text style={styles.buttonText}>+ Add event this day</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 18, maxHeight: "85%" },
  close: { textAlign: "right", color: "#8a8072", fontSize: 16, marginBottom: 4 },
  dateHeading: { fontSize: 18, fontWeight: "700", marginBottom: 10, color: "#2b2620" },
  muted: { color: "#8a8072", fontSize: 13 },
  event: { backgroundColor: "#faf8f5", borderLeftWidth: 3, borderLeftColor: "#7d8f69", borderRadius: 8, padding: 10, marginBottom: 10 },
  eventTitle: { fontWeight: "700", color: "#2b2620" },
  eventNotes: { color: "#2b2620", marginTop: 4 },
  comment: { fontSize: 13, marginTop: 4, color: "#2b2620" },
  commentRow: { flexDirection: "row", marginTop: 8, gap: 6 },
  commentInput: { flex: 1, borderWidth: 1, borderColor: "#eee3d6", borderRadius: 8, padding: 8, backgroundColor: "#fff" },
  send: { color: "#c0653f", fontWeight: "700", paddingHorizontal: 6, paddingVertical: 8 },
  input: { borderWidth: 1, borderColor: "#eee3d6", borderRadius: 10, padding: 10, marginTop: 8, backgroundColor: "#faf8f5" },
  button: { backgroundColor: "#c0653f", padding: 14, borderRadius: 10, marginTop: 12, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700" },
});
