import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../../firebase';
import axios from 'axios';
import './Auth.css';

const API_URL = 'http://localhost:5000/api/auth';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            const response = await axios.post(`${API_URL}/login`, {
                email: formData.email,
                password: formData.password
            });
            
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/tasks');
        } catch (err) {
            console.error('Email login error:', err);
            setError(
                err.response?.data?.message || 
                'Login failed. Please check your email and password.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError('');
        
        try {
            const result = await signInWithPopup(auth, provider);
            const token = await result.user.getIdToken();

            const response = await axios.post(`${API_URL}/login`, {
                token
            });

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/tasks');
        } catch (error) {
            console.error('Google sign-in error:', error);
            setError(
                error.response?.data?.message || 
                'Google sign-in failed. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Login</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleEmailLogin}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                            minLength={6}
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="auth-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging in...' : 'Login with Email'}
                    </button>
                </form>
                <div className="divider">
                    <span>OR</span>
                </div>
                <button 
                    onClick={handleGoogleSignIn} 
                    className="google-button"
                    disabled={isLoading}
                >
                    <img 
                        src="https://img.freepik.com/premium-vector/print-creative-modern-color-full-logo-design_1271730-562.jpg?semt=ais_hybrid&w=740" 
                        alt="Google Logo"
                        style={{ width: '24px', height: '24px', marginRight: '10px', verticalAlign: 'middle',textAlign: 'center'}}
                    />
                    {isLoading ? 'Signing in...' : 'Sign in with Google'}
                </button>
                <p className="auth-link">
                    Don't have an account? <span onClick={() => navigate('/signup')}>Sign up</span>
                </p>
            </div>
        </div>
    );
};

export default Login; 