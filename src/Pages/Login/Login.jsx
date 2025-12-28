import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const adminList = [
    {
        email: "alien@superadmin.com",
        password: "admin4R"
    },
    {
        email: "adam@phitureapp.com",
        password: "Adam1122"
    },
    {
        email: "tom@phitureapp.com",
        password: "Tom102030"
    },
    {
        email: "jim@phitureapp.com",
        password: "Jim090807"
    },
]

const Login = () => {
    const MySwal = withReactContent(Swal);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'mobile'

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async () => {
        try {
            if (loginMethod === 'email') {
                if (formData.email === '' || formData.password === '') {
                    toast('Fill login details.');
                    return;
                }
                const admin = adminList.find(
                    (admin) =>
                        admin.email.toLowerCase() === formData.email.toLowerCase() &&
                        admin.password === formData.password
                );

                if (admin) {
                    localStorage.setItem('userStatus', admin.email);
                    MySwal.fire({
                        icon: 'success',
                        title: 'Login Successful.',
                        confirmButtonColor: '#3085d6',
                    });
                    navigate('/');
                    window.location.reload();
                } else {
                    toast.error('Invalid email or password.');
                }


            } else {
                if (formData.phone === '' || formData.password === '') {
                    console.log('1');
                    toast('Fill login details.');
                    return;
                }
                const res = await axios.get('https://server.amazonkindlerating.com/user-list');
                const existingUser = res.data.find(user => user.phone === formData.phone);
                if (existingUser) {
                    if (existingUser.password === formData.password) {
                        toast.success('Login Successfull.')
                        localStorage.setItem('userStatus', formData.phone);
                        navigate('/');
                        console.log('2');
                        window.location.reload();
                    }
                    else {
                        console.log('3');
                        toast.error('Password Incorrect.');
                    }
                }
                else {
                    console.log('4');
                    toast.error('Phone Number Not Registered!');
                }
            }

        }
        catch (error) {
            console.error('Error during registration:', error);
            toast.error('Something went wrong! Try Again.');
        }

    };

    const handleSwapBtn = (e) => {
        setLoginMethod(e);
        setFormData({
            ...formData,
            email: '',
            password: '',
            phone: '',
        });
    }


    return (
        <div className="bg-gradient-to-r from-[#4e54c8] to-[#8f94fb] min-h-[100vh]">
            <div className="container mx-auto pb-20">
                <div className="flex flex-col items-center justify-center py-6">
                    <div className="relative lg:w-[50%] md:w-[75%] w-full bg-white rounded-3xl shadow-xl p-6">
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-20 h-20 bg-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">Task</div>
                        </div>

                        {/* Toggle login method */}
                        <div className="flex mb-6 rounded-full overflow-hidden border border-teal-400">

                            <button
                                className={`flex-1 py-2 font-semibold ${loginMethod === 'email' ? 'bg-teal-400 text-white' : 'bg-teal-100 text-teal-600'}`}
                                onClick={() => handleSwapBtn('email')}
                            >
                                Login with Email
                            </button>
                        </div>

                        {loginMethod === 'email' ? (
                            <>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="E-mail"
                                    className="w-full mb-4 p-3 rounded-lg bg-[#f7f5fb] focus:outline-none"
                                />
                                <div className="relative mb-4">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Password"
                                        className="w-full p-3 rounded-lg bg-[#f7f5fb] focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute top-3 right-3 text-gray-500"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Mobile Number"
                                    className="w-full mb-4 p-3 rounded-lg bg-[#f7f5fb] focus:outline-none"
                                />
                                <div className="relative mb-4">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Password"
                                        className="w-full p-3 rounded-lg bg-[#f7f5fb] focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute top-3 right-3 text-gray-500"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </>
                        )}

                        <button
                            onClick={handleSubmit}
                            className="w-full cursor-pointer bg-teal-300 hover:bg-teal-400 text-white font-semibold py-3 rounded-full mb-4 shadow-md"
                        >
                            Sign In
                        </button>
                    </div>
                    <ToastContainer />
                </div>
            </div>
        </div>
    );
};

export default Login;
