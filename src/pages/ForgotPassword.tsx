import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Cloud, ArrowLeft, Loader2, Mail } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { supabase } from '../lib/supabase';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSuccess('If an account exists, a password reset link has been sent to your email.');
      setEmail('');
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
      </header>

      {/* Main */}
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md glass-panel p-8 rounded-[2rem] relative">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">Reset your password</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Enter your email and we'll send you a reset link.
            </p>
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
              <label className="text-sm font-medium text-muted-foreground" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 rounded-xl"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl text-base font-semibold shadow-lg shadow-primary/20"
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Send reset link
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border/50 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-primary font-semibold hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-4 md:px-8 border-t border-border/50 text-muted-foreground text-sm text-center">
        <span>© 2024 CloudTalk Enterprise. All rights reserved.</span>
      </footer>
    </div>
  );
}

export default ForgotPassword;
