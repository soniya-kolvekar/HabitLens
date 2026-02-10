"use client";
import { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import {
    doc,
    getDoc,
    collection,
    query,
    orderBy,
    getDocs,
    updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingName, setEditingName] = useState(false);
    const [newName, setNewName] = useState("");
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) {
                router.push("/login");
                return;
            }
            setUser(currentUser);
            try {
                await Promise.all([
                    fetchUserData(currentUser.uid),
                    fetchHabits(currentUser.uid)
                ]);
            } catch (error) {
                console.error("Error loading profile data:", error);
            } finally {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [router]);

    const fetchUserData = async (uid) => {
        try {
            const userDoc = await getDoc(doc(db, "users", uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                setUserData(data);
                setNewName(data.name || user.email?.split("@")[0] || "");
            } else {
                // Fallback if doc doesn't exist
                const validName = user.email?.split("@")[0] || "";
                setUserData({ name: validName, email: user.email });
                setNewName(validName);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    const fetchHabits = async (uid) => {
        try {
            const q = query(
                collection(db, "users", uid, "habits"),
                orderBy("timestamp", "desc")
            );
            const querySnapshot = await getDocs(q);
            const habitsList = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setHabits(habitsList);
        } catch (error) {
            console.error("Error fetching habits:", error);
        }
    };

    const handleUpdateName = async () => {
        if (!user || !newName.trim()) return;
        try {
            await updateDoc(doc(db, "users", user.uid), {
                name: newName,
            });
            setUserData({ ...userData, name: newName });
            setEditingName(false);
        } catch (error) {
            console.error("Error updating name:", error);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-[#3A1C4A] to-[#8E5AA8] text-white">
                Loading...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#3A1C4A] to-[#8E5AA8] p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-10 bg-[#3A1C4A]/50 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                            {userData?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                            {editingName ? (
                                <div className="flex gap-2">
                                    <input
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white focus:outline-none focus:border-purple-400"
                                    />
                                    <button
                                        onClick={handleUpdateName}
                                        className="text-sm bg-purple-500 hover:bg-purple-600 px-3 py-1 rounded text-white transition"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setEditingName(false)}
                                        className="text-sm bg-gray-500 hover:bg-gray-600 px-3 py-1 rounded text-white transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-bold text-white font-[Marcellus]">
                                        {userData?.name || user?.email?.split("@")[0] || "User"}
                                    </h1>
                                    <button
                                        onClick={() => setEditingName(true)}
                                        className="text-white/80 hover:text-white transition text-sm bg-white/10 px-3 py-1 rounded"
                                    >
                                        Edit
                                    </button>
                                </div>
                            )}
                            <p className="text-white/60 text-sm">{userData?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-[#C9A3D9] text-[#3A1C4A] px-6 py-2 rounded-lg font-semibold hover:bg-white transition shadow-lg"
                    >
                        Logout
                    </button>
                </div>

                {/* Habits History */}
                <h2 className="text-2xl font-bold text-white mb-6 font-[Marcellus] pl-2 border-l-4 border-[#C9A3D9]">
                    Analysis History
                </h2>

                {habits.length === 0 ? (
                    <div className="text-white/70 text-center py-10 bg-[#3A1C4A]/30 rounded-xl">
                        No habits analyzed yet. <a href="/feature1" className="text-[#C9A3D9] hover:underline">Start analyzing!</a>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {habits.map((habit) => (
                            <div
                                key={habit.id}
                                className="bg-[#3A1C4A] backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/5 hover:border-white/20 transition duration-300"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-semibold text-[#C9A3D9]">
                                        {habit.habit}
                                    </h3>
                                    <span className="text-xs text-white/40">
                                        {habit.timestamp?.toDate().toLocaleDateString()}
                                    </span>
                                </div>
                                <div
                                    className="text-white/80 leading-relaxed text-sm bg-black/20 p-4 rounded-lg"
                                    style={{ whiteSpace: "pre-wrap" }}
                                >
                                    {habit.analysis}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
