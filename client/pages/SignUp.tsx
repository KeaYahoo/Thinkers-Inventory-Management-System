import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  // No need for login function from context as Supabase handles session automatically via listener

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      // Check if email confirmation is required? Supabase usually logs in by default unless disabled.
      // If "Confirm email" is enabled, session might be null.
      // We'll assume successful sign up logs user in or we redirect to dashboard.
      // Ideally we warn user to check email.
      // For now, let's navigate to dashboard which is protected, so if not logged in they'll be bounced back?
      // Or better, show success message?
      // "Join Trvlsync" usually implies immediate access if email confirm is off.
      navigate("/dashboard");
    } catch (err) {
       setError("Failed to create account.");
    }
  };

  return (
    <>
      <Seo title="Create your Trvlsync account" description="Join Trvlsync to save favourite destinations and manage upcoming trips." />
      <Header />
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 pt-32 pb-20" aria-labelledby="signup-heading">
        <Card className="w-full max-w-md" role="form">
          <CardHeader>
            <CardTitle id="signup-heading" className="text-center text-2xl">
              Create an account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  placeholder="Minimum 8 characters"
                />
              </div>
              {error && (
                <p className="text-sm text-red-500" role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full bg-primary-brown hover:bg-brown-dark">
                Create account
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  );
}
