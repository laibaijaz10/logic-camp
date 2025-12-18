"use client";

import React, { useState } from "react";
import Image from "next/image";

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: undefined }); // Clear field-specific error
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setErrors({});

    // Client-side validation
    const newErrors: typeof errors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.password.trim()) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      console.log(form);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      // Safe JSON parsing
      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error("Server returned invalid JSON");
      }

      if (!res.ok) {
        setMessage({ text: data.message || `Error ${res.status}`, type: "error" });
      } else {
        setMessage({ text: data.message || "Registration successful!", type: "success" });
        setForm({ name: "", email: "", password: "" });
      }
    } catch (err: any) {
      console.error("Error submitting form:", err);
      setMessage({ text: err.message || "Something went wrong. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-lg text-white">
        {/* Glow Accent */}
        <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-fuchsia-600/20 blur-2xl" />

        <div className="relative rounded-2xl border border-gray-800/60 bg-gray-900/60 backdrop-blur-xl shadow-xl p-8 animate-fadeIn">
          <div className="flex flex-col items-center mb-6 animate-slideDown">
            <Image
              src="/logo.png"
              alt="Logic Camp logo"
              width={72}
              height={72}
              className="mb-3 rounded-xl object-contain"
              priority
            />
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              Create account
            </span>
          </div>

          <h1 className="text-3xl font-bold mb-2 tracking-tight">
            <span className="bg-gradient-to-r from-indigo-300 via-indigo-400 to-violet-400 bg-clip-text text-transparent">Welcome to Logic Camp</span>
          </h1>
          <p className="text-gray-400 mb-8">Let’s get you set up. Please provide your details below.</p>

          <form onSubmit={handleSubmit} className="space-y-5 animate-fadeInUp">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block mb-1.5 text-gray-300">Full Name</label>
              <input
                id="name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className={
                  "w-full rounded-lg px-3.5 py-2.5 bg-gray-800/60 border text-white placeholder:text-gray-400 outline-none transition focus:ring-2 " +
                  (errors.name
                    ? "border-red-500 focus:ring-red-500/70"
                    : "border-gray-700/60 focus:border-indigo-500/70 focus:ring-indigo-500/40")
                }
                required
              />
              {errors.name && <p className="mt-1 text-red-400 text-sm">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block mb-1.5 text-gray-300">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={
                  "w-full rounded-lg px-3.5 py-2.5 bg-gray-800/60 border text-white placeholder:text-gray-400 outline-none transition focus:ring-2 " +
                  (errors.email
                    ? "border-red-500 focus:ring-red-500/70"
                    : "border-gray-700/60 focus:border-indigo-500/70 focus:ring-indigo-500/40")
                }
                required
              />
              {errors.email && <p className="mt-1 text-red-400 text-sm">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block mb-1.5 text-gray-300">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={
                  "w-full rounded-lg px-3.5 py-2.5 bg-gray-800/60 border text-white placeholder:text-gray-400 outline-none transition focus:ring-2 " +
                  (errors.password
                    ? "border-red-500 focus:ring-red-500/70"
                    : "border-gray-700/60 focus:border-indigo-500/70 focus:ring-indigo-500/40")
                }
                required
              />
              {errors.password && <p className="mt-1 text-red-400 text-sm">{errors.password}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 font-medium text-white shadow-lg shadow-indigo-900/20 transition hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Registering...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          {/* Global Message */}
          {message && (
            <p
              aria-live="polite"
              className={
                "mt-4 text-center text-sm animate-fadeIn " +
                (message.type === "success" ? "text-green-400" : "text-red-400")
              }
            >
              {message.type === "success" ? "✅ " : "❌ "}
              {message.text}
            </p>
          )}

          {/* Helper */}
          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account? <a href="/signin" className="text-indigo-400 hover:text-indigo-300 underline-offset-4 hover:underline">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
