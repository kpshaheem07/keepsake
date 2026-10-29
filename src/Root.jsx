import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import SignIn from "@/components/SignIn.jsx";
import App from "@/App.jsx";

export default function Root() {
  const [user, setUser] = useState(undefined);
  useEffect(() => onAuthStateChanged(auth, setUser), []);
  if (user === undefined) return <div className="wrap"><p>Loading…</p></div>;
  if (!user) return <SignIn />;
  return <App key={user.uid} user={user} />;
}
