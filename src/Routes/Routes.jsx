import { createBrowserRouter } from "react-router-dom";
import ErrorPage from "../Pages/ErrorPage/ErrorPage";
import Root from "../Layouts/Root";
import Home from "../Pages/Home/Home";
import MembershipList from "../Pages/MembershipList/MembershipList";
import WalletRecord from "../Pages/WalletRecord/WalletRecord";
import UsdtAddres from "../Pages/UsdtAddres/UsdtAddres";
import NationalAgents from "../Pages/NationalAgents/NationalAgents";
import FillReport from "../Pages/FillReport/FillReport";
import ProductManagement from "../Pages/ProductManagement/ProductManagement";
import ProductThreshold from "../Pages/ProductThreshold/ProductThreshold";
import CommissionSettings from "../Pages/CommissionSettings/CommissionSettings";
import Announcement from "../Pages/Announcement/Announcement";
import VipLevel from "../Pages/VipLevel/VipLevel";
import CustomerService from "../Pages/CustomerService/CustomerService";
import DepositRecord from "../Pages/DepositRecord/DepositRecord";
import WithdrawRecord from "../Pages/WithdrawRecord/WithdrawRecord";
import TaskRecord from "../Pages/TaskRecord/TaskRecord";
import SystemSettings from "../Pages/SystemSettings/SystemSettings";
import SlideShowSettings from "../Pages/SlideShowSettings/SlideShowSettings";
import PrivateRoute from "./PrivateRoute";
import Login from "../Pages/Login/Login";
import Term from "../Pages/Term/Term";
import About from "../Pages/About/About";
import Faq from "../Pages/Faq/Faq";
import CheckRoute from "./CheckRoute";
import CombineTaskHistory from "../Pages/CombineTaskHistory/CombineTaskHistory";
import CombineTaskList from "../Pages/CombineTaskList/CombineTaskList";
import SignupBonus from "../Pages/SignupBonus/SignupBonus";
import RewardTaskList from "../Pages/RewardTaskList/RewardTaskList";
import RewardTaskHistory from "../Pages/RewardTaskHistory/RewardTaskHistory";
import Kyc from "../Pages/KYC/Kyc";
import DepositAgent from "../Pages/DepositAgent/DepositAgent";
import PromoCode from "../Pages/PromoCode/PromoCode";
import AdminList from "../Pages/AdminList/AdminList";


const Routes = createBrowserRouter([
  {
    path: "/",
    element: <PrivateRoute><Root></Root></PrivateRoute>,
    errorElement: <ErrorPage></ErrorPage>,
    children: [
      {
        path: "/",
        element: <Home></Home>
      },
      {
        path: "/membership-list",
        element: <MembershipList></MembershipList>
      },
      {
        path: "/combine-task-list",
        element: <CombineTaskList></CombineTaskList>
      },
      {
        path: "/combine-task-history",
        element: <CombineTaskHistory></CombineTaskHistory>
      },
      {
        path: "/reward-task-list",
        element: <RewardTaskList></RewardTaskList>
      },
      {
        path: "/reward-task-history",
        element: <RewardTaskHistory></RewardTaskHistory>
      },
      {
        path: "/deposit-record",
        element: <DepositRecord></DepositRecord>
      },
      {
        path: "/withdraw-record",
        element: <WithdrawRecord></WithdrawRecord>
      },
      {
        path: "/wallet-record",
        element: <WalletRecord></WalletRecord>
      },
      {
        path: "/usdt-address",
        element: <UsdtAddres></UsdtAddres>
      },
      {
        path: "/task-record",
        element: <TaskRecord></TaskRecord>
      },
      {
        path: "/national-agents",
        element: <NationalAgents></NationalAgents>
      },
      {
        path: "/fill-report",
        element: <FillReport></FillReport>
      },
      {
        path: "/task-report",
        element: <TaskRecord></TaskRecord>
      },
      {
        path: "/product-management",
        element: <ProductManagement></ProductManagement>
      },
      {
        path: "/product-threshold",
        element: <ProductThreshold></ProductThreshold>
      },
      {
        path: "/commission-settings",
        element: <CommissionSettings></CommissionSettings>
      },
      {
        path: "/signup-bonus",
        element: <SignupBonus></SignupBonus>
      },
      {
        path: "/announcement",
        element: <Announcement></Announcement>
      },
      {
        path: "/system-settings",
        element:<SystemSettings></SystemSettings>
      },
      {
        path: "/vip-level",
        element: <VipLevel></VipLevel>
      },
      {
        path: "/slide-show-settings",
        element: <SlideShowSettings></SlideShowSettings>
      },
      {
        path: "/customer-service",
        element: <CustomerService></CustomerService>
      },
      {
        path: "/term-settings",
        element: <Term></Term>
      },
      {
        path: "/about-settings",
        element: <About></About>
      },
      {
        path: "/faq-settings",
        element: <Faq></Faq>
      },
      {
        path: "/kyc",
        element: <Kyc></Kyc>
      },
      {
        path: "/deposit-agent",
        element: <DepositAgent></DepositAgent>
      },
      {
        path: "/promo-code",
        element: <PromoCode></PromoCode>
      },
      {
        path: "/admin-list",
        element: <AdminList></AdminList>
      },

    ]
  },
  {
    path: "/login",
    element: <CheckRoute><Login></Login></CheckRoute>
  },
]);

export default Routes;