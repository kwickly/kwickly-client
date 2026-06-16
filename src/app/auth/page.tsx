'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/useAuth';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
// import { api } from '@/lib/api'; // Commented out until backend is connected

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    
    setIsLoading(true);
    try {
      // Mock API call
      // await api.post('/auth/send-otp', { phone });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStep('OTP');
      toast.success('OTP sent successfully. Use 123456 to login.');
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    
    setIsLoading(true);
    try {
      // Mock API call
      // const res = await api.post('/auth/verify-otp', { phone, otp });
      // const { token, user } = res.data.data;
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (otp !== '123456') throw new Error('Invalid OTP');
      
      const mockToken = 'mock-jwt-token-123';
      const mockUser = { id: 'cust-1', phone, firstName: 'John' };
      
      login(mockToken, mockUser);
      toast.success('Logged in successfully!');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="space-y-2 text-center pb-8">
          <CardTitle className="text-3xl font-bold tracking-tight">Welcome Back</CardTitle>
          <CardDescription className="text-base">
            {step === 'PHONE' ? 'Enter your phone number to login or create an account.' : `We sent an OTP to ${phone}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'PHONE' ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                    +1
                  </span>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="555-0123"
                    className="rounded-l-none text-lg h-12"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Send OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp">One-Time Password</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  className="text-center text-2xl tracking-[0.5em] h-14 font-mono"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Verify & Login'}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setStep('PHONE')} disabled={isLoading}>
                Back to Phone
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
