import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Leaf, Lock, Mail, UserPlus, LogIn, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      toast.error("Please fill in all fields");
      return;
    }
    
    login(email, name || undefined);
    toast.success(isLogin ? "Welcome back!" : "Account created successfully!");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-[420px] animate-scale-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
            <Leaf className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-black tracking-tight">SprayBot Monitor</h1>
          <p className="mt-2 text-muted-foreground">Secure agricultural telemetry platform</p>
        </div>

        <Card className="premium-card overflow-hidden">
          <div className="p-8">
            <h2 className="text-xl font-bold mb-6 text-center">
              {isLogin ? "Welcome Back" : "Create New Account"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="farmer@agrispray.io"
                    className="pl-10 h-12 rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 h-12 rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label htmlFor="name">User Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g. Farmer John"
                    className="h-12 rounded-xl"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              <Button type="submit" className="w-full h-12 rounded-xl bg-primary text-lg font-bold shadow-glow hover:bg-primary/90 mt-4 transition-transform active:scale-95">
                {isLogin ? "Sign In" : "Sign Up"}
              </Button>
              
              <div className="text-center mt-4">
                <button 
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
                >
                  {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Authorized Monitoring Only</p>
              <p className="mt-2 text-[10px] text-muted-foreground leading-relaxed">
                By logging in, you agree to our Terms of Service and Privacy Policy for agricultural data management.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
