import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';

// Form schemas
const loginSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

const registerSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  age: z.preprocess(
    (val) => Number(val),
    z.number().positive('Geçerli bir yaş giriniz')
  ),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login');
  const { user, loginMutation, registerMutation } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      age: 0,
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="flex min-h-screen">
      {/* Form Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">VRIntership</h1>
            <p className="mt-2 text-gray-600">
              Sanal kariyer deneyimi platformuna hoş geldiniz
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Giriş Yap</TabsTrigger>
              <TabsTrigger value="register">Kaydol</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="ornek@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Şifre</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Giriş Yapılıyor
                      </>
                    ) : (
                      'Giriş Yap'
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="register" className="mt-6">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="ornek@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Şifre</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>İsim</FormLabel>
                        <FormControl>
                          <Input placeholder="Adınız" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Yaş</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="25" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Kaydediliyor
                      </>
                    ) : (
                      'Kaydol'
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Hero Section */}
      <div className="hidden md:w-1/2 md:flex bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="flex flex-col justify-center items-center p-12 text-white w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="max-w-md text-center"
          >
            <h2 className="text-4xl font-bold mb-6">Kariyer Yolculuğuna Başla</h2>
            <p className="text-xl mb-8">
              VRIntership ile gerçek hayat senaryolarında kendinizi test edin ve hangi teknoloji kariyerine uygun olduğunuzu keşfedin.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 bg-white/10 p-3 rounded-lg">
                <div className="bg-white text-purple-600 rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <p className="font-medium">Kişiselleştirilmiş kariyer testleri</p>
              </div>
              <div className="flex items-center space-x-3 bg-white/10 p-3 rounded-lg">
                <div className="bg-white text-purple-600 rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path><path d="M8 7h6"></path><path d="M8 11h8"></path><path d="M8 15h5"></path></svg>
                </div>
                <p className="font-medium">İnteraktif hikaye temelli deneyim</p>
              </div>
              <div className="flex items-center space-x-3 bg-white/10 p-3 rounded-lg">
                <div className="bg-white text-purple-600 rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12 2v8"></path><path d="m16 6-4 4-4-4"></path><path d="M8 16a4 4 0 1 1 8 0v4H8Z"></path></svg>
                </div>
                <p className="font-medium">İlerlemenizi takip edin ve gelişin</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}