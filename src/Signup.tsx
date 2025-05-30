import { useState } from 'react';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
 import { Link } from 'react-router-dom';

const Signup = () => {
  const auth = getAuth();
  const navigate = useNavigate();

  const [authing, setAuthing] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const signUpWithGoogle = async () => {
    setAuthing(true);
    signInWithPopup(auth, new GoogleAuthProvider())
      .then((response) => {
        console.log(response.user.uid);
        navigate('/login');
      })
      .catch((error) => {
        console.log(error);
        setAuthing(false);
      });
  };

  const signUpWithEmail = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setAuthing(true);
    setError('');
    setEmailSent(false);

    createUserWithEmailAndPassword(auth, email, password)
      .then(async (response) => {
        await sendEmailVerification(response.user);
        setEmailSent(true);
      })
      .catch((error) => {
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
          <img src="/images/icons/Signup.jpg" alt="Signup Illustration" className="h-full" />
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center bg-white px-6 py-12 md:px-20">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Sign Up</h2>

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
            className="mb-4 w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Re-enter Password"
            className="mb-4 w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {error && <div className="text-red-500 mb-4">{error}</div>}
          {emailSent && (
            <div className="text-green-500 mb-4">
              Verification email sent! Please check your inbox.
            </div>
          )}

          <button
            onClick={signUpWithEmail}
            disabled={authing}
            className="w-full py-3 mb-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Sign Up with Email
          </button>

          <div className="flex items-center my-4">
            <hr className="flex-grow border-gray-300" />
            <span className="mx-4 text-gray-500">OR</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          <button
            onClick={signUpWithGoogle}
            disabled={authing}
            className="w-full py-3 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition"
          >
            Continue with Google
          </button>

          <p className="text-center mt-6 text-gray-600">
            Already have an account?{' '}
            <Link to="/Login" className="text-blue-600 font-medium hover:underline"> Log in</Link>

          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
