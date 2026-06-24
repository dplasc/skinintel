'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useLoading } from '@/contexts/LoadingContext'
import { loginSchema } from '@/lib/zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useRef, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { handleLoginAction } from './actions/login'
import SocialLogin from './social-login'

const inputClassName =
  'ps-13 pe-12 h-14 rounded-xl border border-[#ECE0D4] bg-[#FFFDFA] text-sm text-[#2B2A28] transition placeholder:text-[#9A938A] focus:border-[#D9734E] focus:outline-none focus:ring-2 focus:ring-[#D9734E]/30 focus-visible:border-[#D9734E] focus-visible:ring-[#D9734E]/30 !shadow-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 dark:placeholder:text-neutral-500'

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { loading, setLoading } = useLoading()
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null)

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    setLoading(true)
    setIsSubmitting(true)

    startTransition(async () => {
      try {
        if (!formRef.current) return

        const formData = new FormData(formRef.current)
        const res = await handleLoginAction(formData)

        if (res?.error) {
          toast.error(res.error)
        } else {
          await signIn('credentials', {
            redirect: true,
            email: values.email,
            password: values.password,
            callbackUrl: '/dashboard',
          })
          toast.success('Prijava uspješna!')
        }
      } catch (error) {
        toast.error('Došlo je do greške. Pokušajte ponovno.')
      } finally {
        setLoading(false)
      }
    });

    setTimeout(() => {
      setIsSubmitting(false)
    }, 2000);
  }

  return (
    <>
      <Form {...form}>
        <form
          ref={formRef}
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
        >
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute start-5 top-1/2 h-5 w-5 -translate-y-1/2 transform text-[#9A938A] dark:text-neutral-400" />
                    <Input
                      {...field}
                      type="email"
                      placeholder="Email adresa"
                      name="email"
                      className={inputClassName}
                      disabled={loading}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute start-5 top-1/2 h-5 w-5 -translate-y-1/2 transform text-[#9A938A] dark:text-neutral-400" />
                    <Input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Lozinka"
                      name="password"
                      className={inputClassName}
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 h-[unset] !transform -translate-y-1/2 !bg-transparent !p-0 text-[#9A938A] hover:!bg-transparent hover:text-[#6E6A63] dark:text-neutral-400 dark:hover:text-neutral-200"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Remember Me & Forgot Password */}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                className="h-4.5 w-4.5 border border-[#ECE0D4] data-[state=checked]:!border-[#D9734E] data-[state=checked]:!bg-[#D9734E] dark:border-neutral-600"
              />
              <label htmlFor="remember" className="text-sm text-[#6E6A63] dark:text-neutral-300">
                Zapamti me
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="mt-2 h-[52px] w-full rounded-2xl border-0 bg-[#D9734E] text-sm font-semibold text-white shadow-[0_8px_24px_rgba(217,115,78,0.32)] transition hover:!bg-[#C45F3D] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading || isPending}
          >
            {isSubmitting || isPending ? (
              <>
                <Loader2 className="mr-2 h-4.5 w-4.5 animate-spin" />
                Prijava...
              </>
            ) : (
              'Prijava'
            )}
          </Button>
        </form>
      </Form>

      {/* Divider */}
      <div className="relative mt-8 text-center before:absolute before:left-0 before:top-1/2 before:h-px before:w-full before:bg-[#ECE0D4] dark:before:bg-neutral-700">
        <span className="relative z-10 bg-[#FFFDFA] px-4 text-sm text-[#9A938A] dark:bg-neutral-900 dark:text-neutral-400">
          Ili nastavite s
        </span>
      </div>

      {/* Social Login */}
      <SocialLogin />
    </>
  )
}

export default LoginForm
