import { createContext, useEffect, useState } from "react";
//import { GoogleAuthProvider, createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
//import auth from "../firebase/firebase.config";

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const userEmail = localStorage.getItem('userStatus');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userEmail === "alien@superadmin.com")
            setUser({ email: userEmail, name: "Admin", role: "Admin" });
        else if (userEmail === "adam@phitureapp.com") {
            setUser({ email: userEmail, name: "Adam", role: "Mod" });
        }
        else if (userEmail === "jim@phitureapp.com") {
            setUser({ email: userEmail, name: "Jim", role: "Mod" });
        }
        else if (userEmail === "tom@phitureapp.com") {
            setUser({ email: userEmail, name: "Tom", role: "Mod" });
        }
        else {
            setUser(null);
        }
        setLoading(false);
    }, [userEmail]);

    const signOutUser = () => {
        setLoading(true);
        localStorage.removeItem('userStatus');
        setUser(null);
        setLoading(false);
        window.location.reload();
    }
    const authInfo = { user, signOutUser, userEmail, loading, userAccount: user?.name }

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;