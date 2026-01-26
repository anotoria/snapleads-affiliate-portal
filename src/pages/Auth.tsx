import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, User, ArrowRight, ShieldAlert, Building, Phone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Logo } from "@/components/Logo";
import { GradientButton } from "@/components/GradientButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

type LoginFormData = {
  email: string;
  password: string;
};

type SignUpFormData = {
  fullName: string;
  email: string;
  companyName: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeNotifications: boolean;
};

type ResetFormData = {
  email: string;
};

type ChangePasswordFormData = {
  newPassword: string;
  confirmNewPassword: string;
};

type AuthMode = "login" | "signup" | "reset" | "change-password";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword, changePassword, session, mustChangePassword } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  // Handle authentication state and password change requirement
  useEffect(() => {
    if (session) {
      if (mustChangePassword) {
        setMode("change-password");
      } else if (mode !== "change-password") {
        navigate("/");
      }
    }
  }, [session, mustChangePassword, navigate, mode]);

  const loginSchema = z.object({
    email: z.string().email(t.auth.email),
    password: z.string().min(6, t.auth.password),
  });

  const signUpSchema = z.object({
    fullName: z.string().min(2, t.auth.fullName),
    email: z.string().email(t.auth.email),
    companyName: z.string().min(2, "Company name is required"),
    phone: z.string()
      .min(10, "Phone must have at least 10 digits")
      .max(15, "Phone must have at most 15 digits")
      .regex(/^[0-9]+$/, "Phone must contain only numbers"),
    password: z.string().min(6, t.auth.password),
    confirmPassword: z.string(),
    agreeNotifications: z.boolean().refine(val => val === true, "You must agree to receive notifications"),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

  const resetSchema = z.object({
    email: z.string().email(t.auth.email),
  });

  const changePasswordSchema = z.object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmNewPassword: z.string(),
  }).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
  });

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: "", email: "", companyName: "", phone: "", password: "", confirmPassword: "", agreeNotifications: false },
  });

  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: "" },
  });

  const changePasswordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { newPassword: "", confirmNewPassword: "" },
  });

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    const { error } = await signIn(data.email, data.password);
    setIsLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message === "Invalid login credentials" 
          ? "Invalid email or password. Please try again."
          : error.message,
      });
    } else {
      toast({
        title: t.auth.welcomeBack + "!",
        description: "You have successfully logged in.",
      });
    }
  };

  const handleSignUp = async (data: SignUpFormData) => {
    setIsLoading(true);
    const { error } = await signUp(data.email, data.password, data.fullName, data.companyName, data.phone);
    setIsLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: error.message.includes("already registered")
          ? "This email is already registered. Please log in instead."
          : error.message,
      });
    } else {
      toast({
        title: t.auth.createAccount + "!",
        description: "Welcome to SnapLeads. You can now start earning.",
      });
      navigate("/");
    }
  };

  const handleResetPassword = async (data: ResetFormData) => {
    setIsLoading(true);
    const { error } = await resetPassword(data.email);
    setIsLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Reset failed",
        description: error.message,
      });
    } else {
      toast({
        title: "Check your email",
        description: "We've sent you a password reset link.",
      });
      setMode("login");
    }
  };

  const handleChangePassword = async (data: ChangePasswordFormData) => {
    setIsLoading(true);
    const { error } = await changePassword(data.newPassword);
    setIsLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Password change failed",
        description: error.message,
      });
    } else {
      toast({
        title: "Password updated!",
        description: "Your password has been changed successfully.",
      });
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4">
      <Card className="w-full max-w-md animate-fade-in border-border/50 shadow-card">
        <CardHeader className="space-y-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <Logo size="lg" />
            <span className="text-sm text-muted-foreground">{t.common.affiliatePortal}</span>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-foreground">
              {mode === "login" && t.auth.welcomeBack}
              {mode === "signup" && t.auth.createAccount}
              {mode === "reset" && t.auth.resetPassword}
              {mode === "change-password" && "Change Password"}
            </CardTitle>
            <CardDescription className="mt-2 text-muted-foreground">
              {mode === "login" && t.auth.signInToContinue}
              {mode === "signup" && t.auth.startEarning}
              {mode === "reset" && t.auth.resetPasswordDescription}
              {mode === "change-password" && "Please set a new password to continue"}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {mode === "change-password" && (
            <>
              <Alert className="border-amber-500/50 bg-amber-500/10">
                <ShieldAlert className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-amber-700 dark:text-amber-300">
                  Your account requires a password change before you can continue.
                </AlertDescription>
              </Alert>

              <form onSubmit={changePasswordForm.handleSubmit(handleChangePassword)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-foreground">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      {...changePasswordForm.register("newPassword")}
                    />
                  </div>
                  {changePasswordForm.formState.errors.newPassword && (
                    <p className="text-sm text-destructive">{changePasswordForm.formState.errors.newPassword.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword" className="text-foreground">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirmNewPassword"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      {...changePasswordForm.register("confirmNewPassword")}
                    />
                  </div>
                  {changePasswordForm.formState.errors.confirmNewPassword && (
                    <p className="text-sm text-destructive">{changePasswordForm.formState.errors.confirmNewPassword.message}</p>
                  )}
                </div>

                <GradientButton type="submit" isLoading={isLoading}>
                  Update Password
                  <ArrowRight className="h-4 w-4" />
                </GradientButton>
              </form>
            </>
          )}

          {mode === "login" && (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">{t.auth.email}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    {...loginForm.register("email")}
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">{t.auth.password}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    {...loginForm.register("password")}
                  />
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setMode("reset")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t.auth.forgotPassword}
                </button>
              </div>

              <GradientButton type="submit" isLoading={isLoading}>
                {t.auth.signIn}
                <ArrowRight className="h-4 w-4" />
              </GradientButton>
            </form>
          )}

          {mode === "signup" && (
            <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-foreground">{t.auth.fullName}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    className="pl-10"
                    {...signUpForm.register("fullName")}
                  />
                </div>
                {signUpForm.formState.errors.fullName && (
                  <p className="text-sm text-destructive">{signUpForm.formState.errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signupEmail" className="text-foreground">{t.auth.email}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="signupEmail"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    {...signUpForm.register("email")}
                  />
                </div>
                {signUpForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{signUpForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-foreground">Company Name</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="Your Company"
                    className="pl-10"
                    {...signUpForm.register("companyName")}
                  />
                </div>
                {signUpForm.formState.errors.companyName && (
                  <p className="text-sm text-destructive">{signUpForm.formState.errors.companyName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="text"
                    placeholder="11999998888"
                    className="pl-10"
                    {...signUpForm.register("phone")}
                  />
                </div>
                {signUpForm.formState.errors.phone && (
                  <p className="text-sm text-destructive">{signUpForm.formState.errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signupPassword" className="text-foreground">{t.auth.password}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="signupPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    {...signUpForm.register("password")}
                  />
                </div>
                {signUpForm.formState.errors.password && (
                  <p className="text-sm text-destructive">{signUpForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    {...signUpForm.register("confirmPassword")}
                  />
                </div>
                {signUpForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">{signUpForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agreeNotifications"
                  checked={signUpForm.watch("agreeNotifications")}
                  onCheckedChange={(checked) => signUpForm.setValue("agreeNotifications", checked === true)}
                />
                <label
                  htmlFor="agreeNotifications"
                  className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                >
                  I agree to receive email and phone notifications (like when I earn a commission) and other important notifications regarding the affiliate program.
                </label>
              </div>
              {signUpForm.formState.errors.agreeNotifications && (
                <p className="text-sm text-destructive">{signUpForm.formState.errors.agreeNotifications.message}</p>
              )}

              <a
                href="https://snapleads.com.br/joinaffiliate"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-sm text-primary hover:underline"
              >
                Ver portal de Afiliados
              </a>

              <GradientButton type="submit" isLoading={isLoading}>
                {t.auth.signUp}
                <ArrowRight className="h-4 w-4" />
              </GradientButton>
            </form>
          )}

          {mode === "reset" && (
            <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resetEmail" className="text-foreground">{t.auth.email}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="resetEmail"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    {...resetForm.register("email")}
                  />
                </div>
                {resetForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{resetForm.formState.errors.email.message}</p>
                )}
              </div>

              <GradientButton type="submit" isLoading={isLoading}>
                {t.auth.sendResetLink}
                <ArrowRight className="h-4 w-4" />
              </GradientButton>

              <button
                type="button"
                onClick={() => setMode("login")}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t.auth.cancel}
              </button>
            </form>
          )}

          {mode !== "reset" && mode !== "change-password" && (
            <div className="text-center text-sm text-muted-foreground">
              {mode === "login" ? (
                <>
                  {t.auth.noAccount}{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="font-medium text-foreground hover:underline"
                  >
                    {t.auth.signUp}
                  </button>
                </>
              ) : (
                <>
                  {t.auth.hasAccount}{" "}
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="font-medium text-foreground hover:underline"
                  >
                    {t.auth.signIn}
                  </button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
