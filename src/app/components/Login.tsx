import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import axios from 'axios';
import { API_URL } from '../../config/api';

export function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: formData.email,
        password: formData.password
      });

      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Role-based navigation
      const userRole = response.data.user?.role?.toLowerCase();
      
      if (userRole === 'admin') {
        navigate('/admin');
      } else if (userRole === 'employee') {
        navigate('/employee');
      } else if (userRole === 'user') {
        navigate('/user');
      } else {
        // Unknown role
        setError('Unknown user role. Please contact administrator.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Handle different error types
      if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error')) {
        setError('Cannot connect to server. Please make sure the backend server is running.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white flex items-center justify-center relative overflow-hidden">
      {/* Background with noise texture overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
      
      {/* Diagonal stripes background */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)] bg-[length:20px_20px] bg-[position:0_0,10px_10px]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-md mx-auto">
          {/* Back to Home Link */}
          <div className="mb-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
            <Link to="/" className="hover:text-black hover:underline">Home</Link>
            <ChevronRight size={12} />
            <span className="text-black">Login</span>
          </div>

          {/* Main Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h1 className="font-black uppercase tracking-tighter text-4xl md:text-5xl mb-4">
              <span className="text-[#30578e]">TT</span> Login
            </h1>
            <div className="w-24 h-2 bg-[#30578e] mx-auto"></div>
          </motion.div>

          {/* Login Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="border-4 border-black bg-white p-8 md:p-12 shadow-[12px_12px_0px_0px_#30578e]"
          >
            {/* Sign in Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-black uppercase mb-2 flex items-center gap-2">
                Sign in to
                <span className="text-[#30578e]">•</span>
                <span className="text-[#30578e]">TrueTorq</span>
              </h2>
              <p className="font-mono text-xs text-neutral-500 uppercase tracking-widest">
                Access your account
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border-2 border-red-500 text-red-700 font-mono text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block font-bold uppercase text-sm tracking-wide">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                  className="w-full bg-neutral-100 border-2 border-black p-4 focus:outline-none focus:bg-black focus:text-white transition-colors font-mono text-sm"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block font-bold uppercase text-sm tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter your password"
                    className="w-full bg-neutral-100 border-2 border-black p-4 pr-12 focus:outline-none focus:bg-black focus:text-white transition-colors font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-neutral-200 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff size={20} className="text-neutral-600" />
                    ) : (
                      <Eye size={20} className="text-neutral-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={(e) => e.preventDefault()}
                  className="font-mono text-xs text-neutral-500 hover:text-black hover:underline uppercase tracking-widest"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white font-black uppercase tracking-widest py-4 border-2 border-black hover:bg-white hover:text-black transition-all shadow-[4px_4px_0px_0px_#30578e] hover:shadow-[6px_6px_0px_0px_#30578e] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_#30578e]"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-8 pt-8 border-t-2 border-black text-center">
              <p className="font-mono text-xs text-neutral-500 mb-2 uppercase tracking-widest">
                Don't have an account?
              </p>
              <button
                type="button"
                onClick={(e) => e.preventDefault()}
                className="font-bold uppercase text-sm text-[#30578e] hover:text-black hover:underline transition-colors"
              >
                Sign Up
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}


