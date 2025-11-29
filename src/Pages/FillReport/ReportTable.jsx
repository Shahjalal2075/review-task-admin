import React, { useEffect, useState } from 'react';

const ReportTable = ({ row, page, pageSize, idx }) => {

    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetch(`https://review-task-server.vercel.app/user-info/${row.username}`)
            .then((res) => res.json())
            .then((data) => {
                setUser(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[300px]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#4101d8]"></div>
            </div>
        );
    }

    return (
        <tr className="hover:bg-gray-100">
            <td className="p-2">{(page - 1) * pageSize + idx + 1}</td>
            <td className="p-2">ID:{user.invitationCode}<br />Username: {user.username}</td>
            <td className="p-2">{user.totalBal.toFixed(2)}</td>
            <td className="p-2">{user.totalDeposit.toFixed(2)}</td>
            <td className="p-2">{user.totalWithdraw.toFixed(2)}</td>
            <td className={`p-2  font-bold ${row.type==="deposit"?"text-[green]":"text-[red]"}`}>{row.type==="deposit"?"+":"-"}{parseFloat(row.amount).toFixed(2)}</td>
        </tr>
    );
};

export default ReportTable;