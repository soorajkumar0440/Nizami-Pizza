import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [lockTimer, setLockTimer] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const { login, isAdmin } = useAuth();
    const navigate = useNavigate();

    // If already admin, redirect to dashboard
    useEffect(() => {
        if (isAdmin) {
            navigate('/ctrl-vault-9x/dashboard');
        }
    }, [isAdmin, navigate]);

    // Lockout timer after too many failed attempts
    useEffect(() => {
        let interval;
        if (isLocked && lockTimer > 0) {
            interval = setInterval(() => {
                setLockTimer(prev => {
                    if (prev <= 1) {
                        setIsLocked(false);
                        setFailedAttempts(0);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isLocked, lockTimer]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Check if locked out
        if (isLocked) {
            setError(`Too many attempts. Try again in ${lockTimer}s`);
            return;
        }

        setIsLoading(true);

        if (!email || !password) {
            setError('Please fill in all fields');
            setIsLoading(false);
            return;
        }

        const result = await login(email, password);
        if (result.success) {
            if (result.isAdmin) {
                setFailedAttempts(0);
                navigate('/ctrl-vault-9x/dashboard');
            } else {
                // Generic error - don't reveal that the user exists but isn't admin
                setError('Access denied.');
                handleFailedAttempt();
            }
        } else {
            // Generic error message - don't give hints
            setError('Access denied.');
            handleFailedAttempt();
        }
        setIsLoading(false);
    };

    const handleFailedAttempt = () => {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        
        // Lock after 5 failed attempts for 60 seconds
        if (newAttempts >= 5) {
            setIsLocked(true);
            setLockTimer(60);
        }
    };

    return (
        <div className="auth-page admin-login-page">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-brand-logo">
                        <img src="/logo.png" alt="Nizami Logo" />
                    </div>
                    <div className="auth-header">
                        <span className="admin-badge">SECURE ACCESS</span>
                        <h1>System <span className="text-accent">Portal</span></h1>
                        <p>Authorized personnel only</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {error && <div className="auth-error">{error}</div>}
                        {isLocked && (
                            <div className="auth-error" style={{ background: 'rgba(255,0,0,0.15)', border: '1px solid rgba(255,0,0,0.3)' }}>
                                🔒 Account locked. Try again in {lockTimer}s
                            </div>
                        )}

                        <div className="form-group">
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder=" "
                                autoComplete="email"
                                disabled={isLocked}
                                required
                            />
                            <label htmlFor="email">Email</label>
                        </div>

                        <div className="form-group">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder=" "
                                autoComplete="current-password"
                                disabled={isLocked}
                                required
                            />
                            <label htmlFor="password">Password</label>
                            <button 
                                type="button" 
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                disabled={isLocked}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <button type="submit" className="auth-btn admin-btn" disabled={isLoading || isLocked}>
                            <span>{isLocked ? `Locked (${lockTimer}s)` : isLoading ? 'Verifying...' : 'Authenticate'}</span>
                        </button>
                    </form>
                    
                    <div className="admin-link" style={{ textAlign: 'center', marginTop: '20px' }}>
                        <Link to="/" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <Home size={16} /> Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
