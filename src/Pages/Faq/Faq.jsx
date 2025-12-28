import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AuthContext } from '../../Providers/AuthProvider';

const Faq = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [faqs, setFaqs] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  const fetchFaqs = async () => {
    const res = await fetch('https://server.amazonkindlerating.com/faq');
    const data = await res.json();
    setFaqs(data);
    setLoading(false);
  };

  useEffect(() => {
    if (user.role !== "Admin") {
      navigate('/');
      return;
    }
    fetchFaqs();
  }, []);

  const handleAddFaq = async () => {
    if (!newQuestion || !newAnswer) return Swal.fire('Error', 'Fill all fields!', 'error');

    const res = await fetch('https://server.amazonkindlerating.com/faq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: newQuestion, answer: newAnswer }),
    });

    if (res.ok) {
      Swal.fire('Added!', 'FAQ added successfully.', 'success');
      setNewQuestion('');
      setNewAnswer('');
      fetchFaqs();
    }
  };

  const handleEditFaq = (faq) => {
    Swal.fire({
      title: 'Edit FAQ',
      html: `
        <input id="question" class="swal2-input" value="${faq.question}" placeholder="Question">
        <textarea id="answer" class="swal2-textarea" placeholder="Answer">${faq.answer}</textarea>
      `,
      showCancelButton: true,
      confirmButtonText: 'Save',
      preConfirm: () => {
        const question = document.getElementById('question').value;
        const answer = document.getElementById('answer').value;
        if (!question || !answer) {
          Swal.showValidationMessage('Please fill both fields');
          return false;
        }
        return { question, answer };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await fetch(`https://server.amazonkindlerating.com/faq/${faq._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result.value),
        });
        if (res.ok) {
          Swal.fire('Updated!', 'FAQ updated successfully.', 'success');
          fetchFaqs();
        }
      }
    });
  };

  const handleDeleteFaq = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won’t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await fetch(`https://server.amazonkindlerating.com/faq/${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          Swal.fire('Deleted!', 'FAQ has been deleted.', 'success');
          fetchFaqs();
        }
      }
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
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h2 className="text-2xl font-bold mb-4">FAQ Manager</h2>

      <div className="space-y-2">
        {faqs.map((faq) => (
          <div key={faq._id} className="border p-4 rounded shadow flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleEditFaq(faq)}
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteFaq(faq._id)}
                className="px-3 py-1 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t pt-4">
        <h3 className="font-semibold mb-2">Add New FAQ</h3>
        <input
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Question"
          className="border p-2 w-full mb-2 rounded"
        />
        <textarea
          value={newAnswer}
          onChange={(e) => setNewAnswer(e.target.value)}
          placeholder="Answer"
          className="border p-2 w-full mb-2 rounded"
        ></textarea>
        <button
          onClick={handleAddFaq}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Add FAQ
        </button>
      </div>
    </div>
  );
};

export default Faq;
