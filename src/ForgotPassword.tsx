import { useState } from 'react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

const ForgotPassword = () => {
  const auth = getAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const resetPassword = async () => {
    setError('');
    setSuccessMessage('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage('Password reset email sent! Please check your inbox.');
    } catch (err) {
      setError('Error');
    }
  }

  return (
    <div className='w-full flex flex-col items-center'>
      <h3 className='text-3xl text-gray-700 mb-4 mt-10'>Reset Password</h3>
      <input
        type='email'
        placeholder='Enter your email'
        className='w-full text-black py-2 mb-4 bg-transparent border-b border-gray-500 focus:outline-none focus:border-black'
        value={email}
        onChange={(e) => setEmail(e.target.value)} />
      <button
        className='w-full bg-blue-500 text-white font-semibold rounded-md p-4 text-center'
        onClick={resetPassword}>
        Submit
      </button>
      {error && <div className='text-red-500 mt-4'>{error}</div>}
      {successMessage && <div className='text-green-500 mt-4'>{successMessage}</div>}
    
        
    
    </div>

  );
}

export default ForgotPassword;
