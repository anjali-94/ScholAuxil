import { useState } from 'react';
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import ForgotPassword from './ForgotPassword';
import { Link } from 'react-router-dom';


const Login = () => {
    const auth = getAuth();
    const navigate = useNavigate();

    const [authing, setAuthing] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    const signInWithGoogle = async () => {
        setAuthing(true);
        signInWithPopup(auth, new GoogleAuthProvider())
            .then((response) => {
                console.log(response.user.uid);
                navigate('/');
            })
            .catch((error) => {
                console.log(error);
                setAuthing(false);
            });
    };

    const signInWithEmail = async () => {
        setAuthing(true);
        setError('');
        signInWithEmailAndPassword(auth, email, password)
            .then((response) => {
                console.log(response.user.uid);
                navigate('/');
            })
            .catch((error) => {
                console.log(error);
                setError(error.message);
                setAuthing(false);
            });
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Left Panel */}
            <div className="w-full md:w-1/2 h-60 md:h-screen bg-[#e0f2fe] flex flex-col">

                {/* Bottom - Full Image */}
                <div className="flex-grow flex justify-center items-center">
                    <img src="/images/icons/Login.jpg" alt="Signup Illustration" className="h-full" />
                </div>
            </div>



            {/* Right Panel */}
            <div className="w-full md:w-1/2 flex items-center justify-center bg-white px-6 py-12 md:px-20">
                <div className="w-full max-w-md">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">Login</h2>

                    {!showForgotPassword && (
                        <>
                            <input
                                type="email"
                                placeholder="Email"
                                autoComplete="email"
                                className="mb-4 w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                autoComplete="current-password"
                                className="mb-4 w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            {error && <div className="text-red-500 mb-4">{error}</div>}

                            <button
                                onClick={signInWithEmail}
                                disabled={authing}
                                className="w-full py-3 mb-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                            >
                                Log In With Email
                            </button>

                            <div className="flex items-center my-4">
                                <hr className="flex-grow border-gray-300" />
                                <span className="mx-4 text-gray-500">OR</span>
                                <hr className="flex-grow border-gray-300" />
                            </div>

                            <button
                                onClick={signInWithGoogle}
                                disabled={authing}
                                className="w-full py-3 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition"
                            >
                                Continue with Google
                            </button>

                            <div className="text-right mt-4">
                                <button
                                    onClick={() => setShowForgotPassword(true)}
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    Forgot Password?
                                </button>
                            </div>

                            <p className="text-center mt-6 text-gray-600">
                                Don't have an account?{' '}

                                <Link to="/Signup" className="text-blue-600 font-medium hover:underline">Sign Up</Link>

                            </p>
                        </>
                    )}

                    {showForgotPassword && <ForgotPassword />}
                </div>
            </div>
        </div>
    );
};

export default Login;
