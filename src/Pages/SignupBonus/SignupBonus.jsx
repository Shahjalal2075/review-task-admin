import React, { useState, useEffect } from 'react';
import { Plus, Minus, Save, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const SignupBonus = () => {
    const [bonuses, setBonuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const API_URL = 'https://server.amazonkindlerating.com/signup-bonus';
    const SAVE_URL = 'https://server.amazonkindlerating.com/signup-bonus/officetimealien';

    // 1. Fetch Data on Component Mount
    useEffect(() => {
        fetchBonusData();
    }, []);

    const fetchBonusData = async () => {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();

            // Jodi data paye, set korbe. Jodi empty array paye, default Day 1 set korbe.
            if (Array.isArray(data) && data.length > 0) {
                setBonuses(data);
            } else {
                setBonuses([{ day: 1, reward: 0 }]);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setMessage({ type: 'error', text: 'Data load kora jacche na via API.' });
            // Fallback default
            setBonuses([{ day: 1, reward: 0 }]);
        } finally {
            setLoading(false);
        }
    };

    // 2. Handle Reward Value Change
    const handleRewardChange = (index, value) => {
        const newBonuses = [...bonuses];
        // Ensure the value is a number, default to 0 if empty
        newBonuses[index].reward = value === '' ? '' : parseInt(value, 10);
        setBonuses(newBonuses);
    };

    // 3. Add New Day
    const handleAddDay = () => {
        const newDayNumber = bonuses.length + 1;
        setBonuses([...bonuses, { day: newDayNumber, reward: 0 }]);
        setMessage({ type: '', text: '' }); // Clear messages
    };

    // 4. Remove Last Day
    const handleRemoveDay = () => {
        if (bonuses.length > 1) {
            const newBonuses = bonuses.slice(0, -1);
            setBonuses(newBonuses);
            setMessage({ type: '', text: '' });
        } else {
            // Validation: Must keep at least 1 field
            setMessage({ type: 'error', text: 'Kompokkhe 1 ta day field thakte hobe.' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    // 5. Save Data (PATCH)
    const handleSave = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });

        // Validate empty fields before saving
        const hasInvalidFields = bonuses.some(b => b.reward === '' || isNaN(b.reward));
        if (hasInvalidFields) {
            setMessage({ type: 'error', text: 'Sob gulo field e valid number input din.' });
            setSaving(false);
            return;
        }

        const payload = {
            bonus: bonuses
        }
        
        try {
            const response = await fetch(SAVE_URL, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Signup bonus safol vabe update hoyeche!' });
                // Optional: Refetch data to be sure
                // fetchBonusData(); 
            } else {
                setMessage({ type: 'error', text: 'Save korte somossha hoyeche.' });
            }
        } catch (error) {
            console.error('Error saving data:', error);
            setMessage({ type: 'error', text: 'Server e connect kora jacche na.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                {/* Header */}
                <div className="bg-blue-600 p-6 text-center">
                    <h2 className="text-2xl font-bold text-white">Signup Bonus Setup</h2>
                    <p className="text-blue-100 text-sm mt-1">Daily login reward configuration</p>
                </div>

                <div className="p-6 space-y-6">

                    {/* Feedback Message */}
                    {message.text && (
                        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${message.type === 'error'
                            ? 'bg-red-50 text-red-600 border border-red-200'
                            : 'bg-green-50 text-green-600 border border-green-200'
                            }`}>
                            {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                            {message.text}
                        </div>
                    )}

                    {/* Inputs List */}
                    <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                        {bonuses.map((bonus, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200 group hover:border-blue-300 transition-colors">
                                <label className="text-gray-700 font-medium w-20">
                                    Day {bonus.day}
                                </label>
                                <div className="flex items-center gap-2 flex-1">
                                    <span className="text-gray-400 font-semibold text-sm">Points:</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={bonus.reward}
                                        onChange={(e) => handleRewardChange(index, e.target.value)}
                                        className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Control Buttons (Plus / Minus) */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                            Manage Days ({bonuses.length})
                        </span>
                        <div className="flex gap-3">
                            <button
                                onClick={handleRemoveDay}
                                disabled={bonuses.length <= 1}
                                className={`p-2 rounded-full transition-all duration-200 flex items-center justify-center border ${bonuses.length <= 1
                                    ? 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed'
                                    : 'bg-red-50 text-red-500 border-red-200 hover:bg-red-500 hover:text-white hover:shadow-md'
                                    }`}
                                title="Remove last day"
                            >
                                <Minus size={20} />
                            </button>

                            <button
                                onClick={handleAddDay}
                                className="p-2 rounded-full bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white hover:shadow-md transition-all duration-200 flex items-center justify-center"
                                title="Add next day"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                Save Configuration
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignupBonus;