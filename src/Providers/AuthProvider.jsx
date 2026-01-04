import { createContext, useEffect, useRef, useState } from "react";

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const userEmail = localStorage.getItem("userStatus");
    const intervalRef = useRef(null);

    const signOutUser = () => {
        setLoading(true);
        localStorage.removeItem("userStatus");
        setUser(null);
        setLoading(false);
        window.location.reload();
    };

    const fetchUser = async () => {
        if (!userEmail) {
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(
                `https://server.amazonkindlerating.com/admin-list/${userEmail}`
            );
            if (!res.ok) {
                signOutUser();
                return;
            }
            const data = await res.json();
            if (!data || !data.email) {
                signOutUser();
                return;
            }
            setUser({
                email: data.email,
                name: data.username,
                role: data.role === "superadmin" ? "Admin" : data.role
            });
            setLoading(false);
        } catch (error) {
            signOutUser();
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchUser();
        intervalRef.current = setInterval(() => {
            fetchUser();
        }, 60000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [userEmail]);

    const authInfo = {
        user,
        setUser,
        userEmail,
        loading,
        signOutUser,
        userAccount: user?.name
    };

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
