import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../Providers/AuthProvider';
import { toast, ToastContainer } from 'react-toastify';

const BindWalletModal = ({ onClose, userDetails }) => {

    //const { user, userEmail } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const userEmail = (userDetails.phone === '') ? userDetails.email : userDetails.phone;

    const [walletAddress, setWalletAddress] = useState(userDetails.walletAddress);
    const [walletDetails, setWalletDetails] = useState(userDetails);
    const [realName, setRealName] = useState(userDetails.realName);

    /* useEffect(() => {
        fetch(`https://server.amazonkindlerating.com/wallet/${userEmail}`)
            .then((res) => res.json())
            .then((data) => {
                setWalletAddress(data.walletAddress || '');
                setRealName(data.realName || '');
                setWalletDetails(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [userEmail]); */

    const handleSubmit = () => {
        if (walletAddress === '') {
            return toast("Fill Wallet Address.");
        }
        if (realName === '') {
            return toast("Fill Real Name.");
        }

        if (walletDetails) {
            fetch(`https://server.amazonkindlerating.com/wallet/${userEmail}`, {
                method: 'PATCH',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({ walletAddress, realName })
            })
                .then(() => {
                    toast('Wallet Updated.')
                    onClose();
                })
                .catch(() => {
                    toast('Failed to add.')
                });
        } else {
            /* fetch('https://server.amazonkindlerating.com/wallet', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({ walletAddress, realName, username: user.username, phone: user.phone, email: user.email, walletType: "TRC-20" })
            })
                .then(() => {
                    toast('Wallet Updated.')
                    onClose();
                })
                .catch(() => {
                    toast('Failed to add.')
                }); */
            toast('Wallet not exist.')
            onClose();
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[300px]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#4101d8]"></div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 flex justify-center items-center bg-[#00000071] z-50">
            <div className="bg-white rounded-lg p-6 w-[600px]">
                <h2 className="text-xl font-bold mb-4">Wallet USDT/USDC Bind</h2>

                <label className="block text-sm mb-1 text-blue-600">
                    USDT/USDC address: (TRC-20)
                </label>
                <input
                    type="text"
                    placeholder="Please enter the USDT/USDC address!"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="w-full border border-blue-200 p-2 mb-4 rounded"
                />

                {/* <label className="block text-sm mb-1">Real Name</label>
                <input
                    type="text"
                    placeholder="Please enter the Real Name!"
                    value={realName}
                    onChange={(e) => setRealName(e.target.value)}
                    className="w-full border border-blue-200 p-2 mb-6 rounded"
                /> */}

                <button
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r from-teal-400 to-cyan-500 text-white py-2 rounded font-bold"
                >
                    Save
                </button>
            </div>
            <ToastContainer />
        </div>
    );
};

export default BindWalletModal;
