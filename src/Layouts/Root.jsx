import { Outlet } from "react-router-dom";
import Header from "../Pages/SharedSection/Header/Header";
import { AuthContext } from "../Providers/AuthProvider";
import { useContext } from "react";

const Root = () => {
    const { authCheck } = useContext(AuthContext);

    if (!authCheck) {
        return (
            <div className="flex justify-center items-center h-[300px]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#4101d8]"></div>
            </div>
        );
    }

    return (
        <div className=" min-h-screen">
            <div className="md:flex">
                <Header />
                <main className="flex-1 p-4 mt-16 md:mt-0">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Root;
