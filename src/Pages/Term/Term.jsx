import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../Providers/AuthProvider';
import { useNavigate } from 'react-router-dom';

const Term = () => {
  const [loading, setLoading] = useState(true);
  const [termsText, setTermsText] = useState("");
  const [newTerms, setNewTerms] = useState("");
  const [updating, setUpdating] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Fetch terms when page loads
  useEffect(() => {
    if (user.role !== "Admin") {
      navigate('/');
      return;
    }
    fetch('https://review-task-server.vercel.app/term/termalien')
      .then((res) => res.json())
      .then((data) => {
        setTermsText(data.text);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching terms:", error);
        setTermsText("Failed to load Terms & Conditions.");
        setLoading(false);
      });
  }, []);

  // Update terms via API
  const handleSave = () => {
    if (!newTerms.trim()) {
      alert("Please enter new Terms & Conditions.");
      return;
    }

    setUpdating(true);

    fetch('https://review-task-server.vercel.app/term/termalien', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: newTerms })
    })
      .then((res) => res.json())
      .then((data) => {
        setTermsText(newTerms);
        setNewTerms("");
        setUpdating(false);
        alert("Terms updated successfully!");
      })
      .catch((error) => {
        console.error("Error updating terms:", error);
        setUpdating(false);
        alert("Failed to update Terms.");
      });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#4101d8]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-center">Terms and Conditions</h1>

      <div className="whitespace-pre-wrap mb-8">{termsText}</div>

      <h2 className="text-2xl font-semibold mb-2">Update Terms & Conditions</h2>
      <textarea
        value={newTerms}
        onChange={(e) => setNewTerms(e.target.value)}
        className="w-full h-40 p-3 border border-gray-300 rounded mb-4"
        placeholder="Write new Terms & Conditions here..."
      />

      <button
        onClick={handleSave}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        disabled={updating}
      >
        {updating ? "Saving..." : "Save New Terms"}
      </button>

      <p className="mt-10 text-sm text-gray-500 text-center">
        © {new Date().getFullYear()} S. All rights reserved.
      </p>
    </div>
  );
};

export default Term;
