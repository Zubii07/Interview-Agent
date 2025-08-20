import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

export default function Login() {
	const { login } = useAuth();
	const toast = useToast();
	const navigate = useNavigate();
	const location = useLocation();
	const from = location.state?.from?.pathname || '/dashboard';

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setLoading(true);
		try {
			await login({ email, password });
			toast.success('Logged in successfully');
			navigate('/home', { replace: true });
		} catch (err) {
			setError(err?.message || err?.response?.data?.message || 'Login failed.');
		} finally {
			setLoading(false);
		}
    };

	return (
			<div className="min-h-screen bg-gray-50 flex flex-col">
				<Header />
				<main className="flex-1 flex items-center justify-center p-4">
					<div className="w-full max-w-md bg-white rounded-xl p-6 shadow">
				<h1 className="text-xl font-semibold mb-4">Sign in</h1>
				{error && <div className="p-2 mb-3 text-sm text-red-700 bg-red-50 rounded">{error}</div>}
				<form onSubmit={handleSubmit} className="space-y-3">
					<div>
						<label className="block text-sm text-gray-600">Email</label>
						<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="mt-1 w-full border rounded px-3 py-2" />
					</div>
					<div>
						<label className="block text-sm text-gray-600">Password</label>
						<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="mt-1 w-full border rounded px-3 py-2" />
					</div>
					<button type="submit" disabled={loading} className="w-full bg-purple-600 text-white rounded py-2 hover:bg-purple-700 disabled:opacity-60">
						{loading ? 'Signing in...' : 'Sign in'}
					</button>
				</form>
				<p className="text-sm text-gray-600 mt-3">
					No account? <Link to="/signup" className="text-purple-700">Create one</Link>
				</p>
					</div>
				</main>
				<Footer />
			</div>
	);
}
