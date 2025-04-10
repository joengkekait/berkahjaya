import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 flex flex-col items-center">
          <div className="w-24 h-24 mb-2 rounded-full overflow-hidden bg-blue-800">
            <img
              src="/bjt_logo.png"
              alt="Berkah Jaya Transport Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <CardTitle className="text-xl font-bold text-blue-900 text-center">
            Berkah Jaya Transport
          </CardTitle>
          <CardDescription className="text-sm text-gray-500 text-center">
            Sistem Manajemen Keuangan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-900 hover:bg-blue-800"
              disabled={isLoading}
            >
              {isLoading ? "Memproses..." : "Masuk"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-xs text-center text-gray-500">
            &copy; {new Date().getFullYear()} Berkah Jaya Transport. All rights
            reserved.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
