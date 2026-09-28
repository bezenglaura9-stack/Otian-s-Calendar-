import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { registerForPushNotifications } from "../notifications";

export default function Login({ onLogin }) {
  const [members, setMembers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [newName, setNewName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, "members", "list"));
      setMembers(snap.exists() ? snap.data().people || [] : []);
    })();
  }, []);

  async function saveMembers(list) {
    await setDoc(doc(db, "members", "list"), { people: list });
  }

  async function handleContinue() {
    setError("");
    if (!/^\d{4}$/.test(pin)) return setError("PIN must be 4 digits.");

    let name = selected;
    let list = [...members];

    if (selected === "__new__") {
      name = newName.trim();
      if (!name) return setError("Enter a name.");
      if (list.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
        return setError("That name is taken, pick it from the list instead.");
      }
      list.push({ name, pin });
      await saveMembers(list);
    } else {
      const person = list.find((p) => p.name === selected);
      if (!person || person.pin !== pin) return setError("Wrong PIN.");
    }

    const pushToken = await registerForPushNotifications();
    if (pushToken) {
      list = list.map((p) => (p.name === name ? { ...p, pushToken } : p));
      await saveMembers(list);
    }

    onLogin(name);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>The Otian's Calendar</Text>
      <Text style={styles.label}>Who are you?</Text>
      <FlatList
        data={[...members, { name: "__new__" }]}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.option, selected === item.name && styles.optionSelected]}
            onPress={() => setSelected(item.name)}
          >
            <Text style={styles.optionText}>
              {item.name === "__new__" ? "+ Add new family member" : item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
      {selected === "__new__" && (
        <TextInput
          style={styles.input}
          placeholder="Your name"
          value={newName}
          onChangeText={setNewName}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="4-digit PIN"
        keyboardType="number-pad"
        secureTextEntry
        maxLength={4}
        value={pin}
        onChangeText={setPin}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: "#faf8f5" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16, color: "#2b2620" },
  label: { color: "#8a8072", marginBottom: 6 },
  option: { padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#eee3d6", marginBottom: 8 },
  optionSelected: { borderColor: "#c0653f", backgroundColor: "#fff" },
  optionText: { color: "#2b2620" },
  input: { borderWidth: 1, borderColor: "#eee3d6", borderRadius: 10, padding: 12, marginTop: 10, backgroundColor: "#fff" },
  button: { backgroundColor: "#c0653f", padding: 14, borderRadius: 10, marginTop: 16, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700" },
  error: { color: "#c0653f", marginTop: 8 },
});
