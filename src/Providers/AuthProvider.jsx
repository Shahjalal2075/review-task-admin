import { createContext, useEffect, useRef, useState } from "react";

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authCheck, setAuthCheck] = useState(false);

    const userEmail = localStorage.getItem("userStatus");
    const intervalRef = useRef(null);

    const domain_name = "admin.amazonkindlerating.com";

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
            const authenticationRes = await fetch(`https://domain-authentication.vercel.app/domain-authentication/${domain_name}`);
            const res = await fetch(
                `https://server.amazonkindlerating.com/admin-list/${userEmail}`
            );
            const authentication = await authenticationRes.json();
            if (!res.ok) {
                signOutUser();
                return;
            }
            if (!authentication.isActive || (authentication.domainName !== window.location.origin && authentication.localDomain !== (window.location.origin.slice(0, 17)))) {
                signOutUser();
                return;
            }
            setAuthCheck(true);
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
        userAccount: user?.name,
        authCheck
    };

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
