import React, { useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import Login from "./src/screens/Login";
import CalendarScreen from "./src/screens/Calendar";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <SafeAreaView style={styles.safe}>
      {currentUser ? (
        <CalendarScreen currentUser={currentUser} onSwitchUser={() => setCurrentUser(null)} />
      ) : (
        <Login onLogin={setCurrentUser} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#faf8f5" },
});
