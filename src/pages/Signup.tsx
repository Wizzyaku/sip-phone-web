import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cloud, CheckCircle, Globe, Shield, ArrowRight, Loader2, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

function getPasswordStrength(password: string): number {
  let score = 0;
  if (password.length > 0) score += 1;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score += 1;
  return score;
}

export function Signup() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const progress = useMemo(() => {
    const filled = [fullName, email, password].filter(Boolean).length;
    return Math.max(10, (filled / 3) * 100);
  }, [fullName, email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!agreed) {
      setError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError('An account with this email already exists. Please log in.');
        return;
      }

      setSuccess('Account created! Please check your email to confirm your account, then log in.');
      window.setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-auth-mesh min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full py-6 px-4 md:px-8 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Cloud className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-primary tracking-tight">CloudTalk</span>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <span className="text-muted-foreground text-sm">Already have an account?</span>
          <Link to="/login" className="text-primary text-sm font-semibold hover:underline">
            Log In
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow flex items-center justify-center px-4 py-4 md:py-12">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
          {/* Left: Branding */}
          <div className="hidden lg:block lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest">
              <CheckCircle className="h-3.5 w-3.5" />
              Enterprise Communication Redefined
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Scale your business <br />
              <span className="text-primary">without limits.</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl">
              Join high-growth teams using CloudTalk to manage their global communications, virtual numbers, and
              customer outreach with enterprise-grade reliability.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center shadow-sm">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Global Presence</p>
                  <p className="text-sm text-muted-foreground">Numbers in 140+ countries.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center shadow-sm">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Bank-Level Security</p>
                  <p className="text-sm text-muted-foreground">SOC2 and GDPR compliant.</p>
                </div>
              </div>
            </div>

            <div className="pt-8 hidden lg:block">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-bold">
                  JD
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-bold">
                  AS
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-bold">
                  MK
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-background bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  +12k
                </div>
              </div>
              <p className="text-muted-foreground text-sm mt-3 italic">
                "The most intuitive dialer we've ever used."
              </p>
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-6 flex justify-center w-full">
            <div className="w-full max-w-[440px] glass-panel p-4 md:p-8 rounded-2xl md:rounded-[2rem] relative border border-border shadow-2xl overflow-hidden">
              {/* Progress bar */}
              <div className="absolute top-0 left-0 w-full h-1 bg-muted overflow-hidden rounded-t-[2rem]">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="relative z-10 mb-4 md:mb-8 text-center lg:text-left">
                <h2 className="text-xl md:text-3xl font-bold text-foreground">Create your account</h2>
                <p className="text-muted-foreground text-xs md:text-sm mt-1 md:mt-2">Start your 14-day free trial today.</p>
              </div>

              {error && (
                <div className="mb-4 md:mb-6 rounded-xl bg-destructive/10 px-4 py-3 text-[13px] md:text-sm text-destructive relative z-10">{error}</div>
              )}
              {success && (
                <div className="mb-4 md:mb-6 rounded-xl bg-green-100 px-4 py-3 text-[13px] md:text-sm text-green-800 dark:bg-green-900/30 dark:text-green-300 relative z-10">
                  {success}
                </div>
              )}

              <form className="space-y-2.5 md:space-y-5 relative z-10" onSubmit={handleSubmit}>
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-[11px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground" htmlFor="full_name">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 md:h-5 w-4 md:w-5 text-muted-foreground" />
                    <Input
                      id="full_name"
                      placeholder="Richard Williams"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-9 md:pl-10 h-10 md:h-11 rounded-xl text-sm md:text-base"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-[11px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground" htmlFor="work_email">
                    Work Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 md:h-5 w-4 md:w-5 text-muted-foreground" />
                    <Input
                      id="work_email"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 md:pl-10 h-10 md:h-11 rounded-xl text-sm md:text-base"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-[11px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 md:h-5 w-4 md:w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 md:pl-10 pr-9 md:pr-10 h-10 md:h-11 rounded-xl text-sm md:text-base"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 md:h-5 w-4 md:w-5" /> : <Eye className="h-4 md:h-5 w-4 md:w-5" />}
                    </button>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                      <div className={cn('h-full transition-all', strength >= 1 ? 'bg-red-500' : 'bg-transparent')} />
                    </div>
                    <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                      <div className={cn('h-full transition-all', strength >= 2 ? 'bg-amber-500' : 'bg-transparent')} />
                    </div>
                    <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                      <div className={cn('h-full transition-all', strength >= 3 ? 'bg-green-500' : 'bg-transparent')} />
                    </div>
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer relative z-10">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                  />
                  <span className="text-[13px] md:text-sm text-muted-foreground leading-relaxed">
                    I agree to the{' '}
                    <a href="#" className="text-primary hover:underline font-semibold">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-primary hover:underline font-semibold">
                      Privacy Policy
                    </a>
                    .
                  </span>
                </label>

                <Button
                  type="submit"
                  className="w-full h-10 md:h-11 rounded-xl text-sm md:text-base font-semibold shadow-lg shadow-primary/20"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Start Free Trial
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>

              <div className="mt-1 pt-2 md:mt-2 md:pt-3 border-t border-border/50 text-center relative z-10">
                <p className="text-muted-foreground text-[11px] md:text-sm mb-1.5 md:mb-3">Or sign up with</p>
                <div className="grid grid-cols-1 gap-2 md:gap-3">
                  <Button variant="outline" className="h-10 md:h-11 rounded-xl bg-background/50">
                    <svg className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span className="font-semibold text-xs md:text-sm">Google</span>
                  </Button>
                </div>
                <p className="text-[11px] md:text-sm text-muted-foreground mt-2 md:mt-3">Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign in here</Link></p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="hidden md:block w-full py-6 px-4 md:px-8 border-t border-border/50 text-muted-foreground text-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <span>© 2024 CloudTalk Enterprise. All rights reserved.</span>
            <span className="hidden md:inline">|</span>
            <a href="#" className="hover:text-primary">
              Status
            </a>
            <a href="#" className="hover:text-primary">
              Help Center
            </a>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs uppercase tracking-widest font-bold">Systems Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>English (US)</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Signup;
