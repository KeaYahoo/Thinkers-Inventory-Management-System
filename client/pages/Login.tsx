import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch, ApiError } from "@/lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      const data = await apiFetch<{ token: string }>("/auth/login", {
        method: "POST",
        body: { email, password },
      });

      login(data.token);
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Failed to log in.");
      } else {
        setError("Failed to log in.");
      }
    }
  };

  return (
    <>
      <Seo title="Log in" description="Access your Trvlsync dashboard to manage bookings and profile details." />
      <Header />
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 pt-32 pb-20" aria-labelledby="login-heading">
        <Card className="w-full max-w-md" role="form">
          <CardHeader>
            <CardTitle id="login-heading" className="text-center text-2xl">
              Log in
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
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-red-500" role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full bg-primary-brown hover:bg-brown-dark">
                Log in
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center text-sm">
            <span>
              Don't have an account?
              <Link to="/signup" className="ml-1 underline">
                Sign up
              </Link>
            </span>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </>
  );
}
