import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cloud, CheckCircle, Globe, Shield, Users, ArrowRight, Loader2, Mail, Lock, User } from 'lucide-react';
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
  const [companySize, setCompanySize] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const progress = useMemo(() => {
    const filled = [fullName, email, companySize, password].filter(Boolean).length;
    return Math.max(10, (filled / 4) * 100);
  }, [fullName, email, companySize, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!fullName.trim() || !email.trim() || !password.trim() || !companySize) {
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
            company_size: companySize,
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
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Branding */}
          <div className="lg:col-span-6 space-y-6">
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
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md glass-panel p-8 rounded-[2rem] relative">
              {/* Progress bar */}
              <div className="absolute top-0 left-0 w-full h-1 bg-muted overflow-hidden rounded-t-[2rem]">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">Create your account</h2>
                <p className="text-muted-foreground text-sm mt-1">Start your 14-day free trial today.</p>
              </div>

              {error && (
                <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
              )}
              {success && (
                <div className="mb-4 rounded-lg bg-green-100 px-4 py-3 text-sm text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  {success}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground" htmlFor="full_name">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="full_name"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10 h-11 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground" htmlFor="work_email">
                    Work Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="work_email"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground" htmlFor="company_size">
                    Company Size
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <select
                      id="company_size"
                      value={companySize}
                      onChange={(e) => setCompanySize(e.target.value)}
                      className="flex h-11 w-full rounded-xl border border-input bg-background px-3 pl-10 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring appearance-none cursor-pointer"
                      required
                    >
                      <option value="" disabled>
                        Select size...
                      </option>
                      <option value="1-10">1 - 10 employees</option>
                      <option value="11-50">11 - 50 employees</option>
                      <option value="51-200">51 - 200 employees</option>
                      <option value="201-500">201 - 500 employees</option>
                      <option value="500+">500+ employees</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-11 rounded-xl"
                      required
                    />
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

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                  />
                  <span className="text-sm text-muted-foreground leading-relaxed">
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
                  className="w-full h-11 rounded-xl text-base font-semibold shadow-lg shadow-primary/20"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Start Free Trial
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-border/50 text-center">
                <p className="text-muted-foreground text-sm mb-4">Or sign up with</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-10 rounded-xl">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span className="font-semibold text-sm">Google</span>
                  </Button>
                  <Button variant="outline" className="h-10 rounded-xl">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                    <span className="font-semibold text-sm">GitHub</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-4 md:px-8 border-t border-border/50 text-muted-foreground text-sm">
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
