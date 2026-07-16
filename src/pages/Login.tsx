import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cloud, CheckCircle, Globe, Shield, ArrowRight, Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { supabase } from '../lib/supabase';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      if (data.session) {
        navigate('/dashboard');
      } else {
        setError('Please confirm your email before signing in.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-auth-mesh min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full py-4 md:py-6 px-4 md:px-8 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Cloud className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          <span className="text-xl md:text-2xl font-bold text-primary tracking-tight">CloudTalk</span>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <span className="hidden md:inline text-muted-foreground text-sm">Don't have an account?</span>
          <Link to="/signup" className="text-primary text-sm font-semibold hover:underline bg-primary/10 px-3 py-1.5 md:bg-transparent md:px-0 md:py-0 rounded-full md:rounded-none">
            Sign up
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow flex items-center justify-center px-4 py-4 md:py-12">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
          {/* Left: Branding */}
          <div className="hidden lg:block lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest">
              <CheckCircle className="h-3.5 w-3.5" />
              Enterprise Communication Redefined
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Welcome back to <br />
              <span className="text-primary">CloudTalk.</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl">
              Sign in to manage your business calls, messages, and contacts from anywhere in the world.
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
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-6 flex justify-center w-full">
            <div className="w-full max-w-[440px] glass-panel p-6 md:p-8 rounded-2xl md:rounded-[2rem] relative border border-border shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 rounded-full blur-[40px] pointer-events-none" />

              <div className="relative z-10 mb-6 md:mb-8 text-center lg:text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Sign in</h2>
                <p className="text-muted-foreground text-sm mt-1 md:mt-2">Enter your credentials to continue.</p>
              </div>

              {error && (
                <div className="mb-4 md:mb-6 rounded-xl bg-destructive/10 px-4 py-3 text-[13px] md:text-sm text-destructive relative z-10">{error}</div>
              )}

              <form className="space-y-4 md:space-y-5 relative z-10" onSubmit={handleSubmit}>
                <div className="space-y-1.5 md:space-y-2">
                  <label className="text-[11px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground" htmlFor="email">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 md:h-5 w-4 md:w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 md:pl-10 h-11 md:h-12 rounded-xl text-sm bg-background/50"
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
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 md:pl-10 pr-9 md:pr-10 h-11 md:h-12 rounded-xl text-sm bg-background/50"
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
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-3.5 w-3.5 md:h-4 md:w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className="text-[11px] md:text-sm text-muted-foreground">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-[11px] md:text-sm text-primary font-semibold hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 md:h-12 rounded-xl text-sm md:text-base font-semibold shadow-lg shadow-primary/20"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Sign In
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>

              <div className="mt-1 pt-2 md:mt-2 md:pt-3 border-t border-border/50 text-center relative z-10">
                <p className="text-muted-foreground text-[11px] md:text-sm mb-1.5 md:mb-3">Or sign in with</p>
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
                <p className="text-[11px] md:text-sm text-muted-foreground mt-2 md:mt-3">Don't have an account? <Link to="/signup" className="text-primary font-semibold hover:underline">Sign up here</Link></p>
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

export default Login;
