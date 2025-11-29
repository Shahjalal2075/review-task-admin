import { Outlet } from "react-router-dom";
import Header from "../Pages/SharedSection/Header/Header";

const Root = () => {
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
