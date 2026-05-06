import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Leaf, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSelect } from "@/components/LanguageSelect";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, signup, isLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      toast.error(t("auth.fillFields"));
      return;
    }
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, name);
      }
      toast.success(isLogin ? t("auth.welcomeBackToast") : t("auth.accountCreatedToast"));
      navigate("/");
    } catch (e) {
      // Error is handled in context
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-[420px] animate-scale-in">
        <div className="mb-4 flex justify-end">
          <LanguageSelect className="h-8 w-[150px]" />
        </div>
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
            <Leaf className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-black tracking-tight">{t("app.brandName")}</h1>
          <p className="mt-2 text-muted-foreground">{t("auth.subtitle")}</p>
        </div>

        <Card className="premium-card overflow-hidden">
          <div className="p-8">
            <h2 className="text-xl font-bold mb-6 text-center">
              {isLogin ? t("auth.welcomeBack") : t("auth.createAccount")}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.emailAddress")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("auth.emailPlaceholder")}
                    className="pl-10 h-12 rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("auth.passwordPlaceholder")}
                    className="pl-10 pr-10 h-12 rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label htmlFor="name">{t("auth.userName")}</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={t("auth.userNamePlaceholder")}
                    className="h-12 rounded-xl"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-primary text-lg font-bold shadow-glow hover:bg-primary/90 mt-4 transition-transform active:scale-95"
              >
                {isLoading ? t("auth.processing") : (isLogin ? t("auth.signIn") : t("auth.signUp"))}
              </Button>
              
              <div className="text-center mt-4">
                <button 
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
                >
                  {isLogin ? t("auth.toggleToSignup") : t("auth.toggleToSignin")}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">{t("auth.authorizedOnly")}</p>
              <p className="mt-2 text-[10px] text-muted-foreground leading-relaxed">
                {t("auth.legalNotice")}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
