"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, MessageSquare, Zap, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import ScrollReveal from "@/components/animations/ScrollReveal";
import StaggerContainer from "@/components/animations/StaggerContainer";
import StaggerItem from "@/components/animations/StaggerItem";
import HoverScale from "@/components/animations/HoverScale";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white overflow-hidden">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center cursor-pointer"
            >
              <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Aruna
              </div>
            </motion.div>
            <div className="flex items-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/auth/signin"
                  className="text-neutral-600 hover:text-neutral-900 px-4 py-2 text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
              </motion.div>
              <HoverScale>
                <Link
                  href="/auth/signin"
                  className="bg-gradient-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-all inline-flex items-center gap-2 shadow-medium shadow-primary-500/20"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </HoverScale>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center">
          <ScrollReveal delay={0.1}>
            <motion.div
              whileHover={{ scale: 1.05, rotate: [0, -5, 5, -5, 0] }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium mb-8 border border-primary-100"
            >
              <Zap className="w-4 h-4" />
              AI-Powered Business Intelligence
            </motion.div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              Talk to Your Business.
              <br />
              <motion.span
                className="bg-gradient-primary bg-clip-text text-transparent inline-block"
                animate={{
                  backgroundPosition: ["0%", "100%", "0%"],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  backgroundSize: "200% auto",
                }}
              >
                Get Instant Insights.
              </motion.span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <p className="text-xl text-neutral-600 mb-10 max-w-2xl mx-auto">
              Aruna combines conversational AI with advanced analytics. Ask questions in plain language
              and watch your data come alive with intelligent visualizations.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <HoverScale scale={1.02}>
                <Link
                  href="/auth/signin"
                  className="bg-gradient-primary text-white px-8 py-4 rounded-lg text-lg font-medium hover:opacity-90 transition-all shadow-large shadow-primary-500/30 inline-flex items-center gap-2"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </HoverScale>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="border-2 border-neutral-300 text-neutral-700 px-8 py-4 rounded-lg text-lg font-medium hover:border-neutral-400 hover:bg-neutral-50 transition-all"
              >
                Watch Demo
              </motion.button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <ScrollReveal delay={0.1}>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Everything You Need to Understand Your Business
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Built for modern businesses that need answers, not dashboards.
            </p>
          </div>
        </ScrollReveal>

        <StaggerContainer className="grid md:grid-cols-3 gap-8">
          <StaggerItem>
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white p-8 rounded-xl border border-neutral-200 hover:border-primary-300 hover:shadow-large transition-all cursor-pointer"
            >
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4"
              >
                <MessageSquare className="w-6 h-6 text-primary-600" />
              </motion.div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Conversational AI</h3>
              <p className="text-neutral-600">
                Ask questions in natural language. No SQL, no complex queries. Just talk to your data.
              </p>
            </motion.div>
          </StaggerItem>

          <StaggerItem>
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white p-8 rounded-xl border border-neutral-200 hover:border-secondary-300 hover:shadow-large transition-all cursor-pointer"
            >
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-4"
              >
                <BarChart3 className="w-6 h-6 text-secondary-600" />
              </motion.div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Smart Visualizations</h3>
              <p className="text-neutral-600">
                Automatically generated charts, heatmaps, and dashboards that adapt to your questions.
              </p>
            </motion.div>
          </StaggerItem>

          <StaggerItem>
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white p-8 rounded-xl border border-neutral-200 hover:border-success-300 hover:shadow-large transition-all cursor-pointer"
            >
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mb-4"
              >
                <TrendingUp className="w-6 h-6 text-success-600" />
              </motion.div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Industry Modules</h3>
              <p className="text-neutral-600">
                Pre-built modules for Padel, F&B, Retail, and more. Extensible to any industry.
              </p>
            </motion.div>
          </StaggerItem>
        </StaggerContainer>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-primary py-20 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal delay={0.1}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Business Intelligence?
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-xl text-primary-100 mb-8">
              Join forward-thinking businesses using AI to make data-driven decisions.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.3}>
            <HoverScale scale={1.05}>
              <Link
                href="/auth/signin"
                className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-neutral-50 transition-all inline-flex items-center gap-2 shadow-large"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </HoverScale>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="border-t border-neutral-200 bg-white py-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4 md:mb-0"
            >
              Aruna
            </motion.div>
            <div className="text-neutral-600 text-sm">
              © 2024 Aruna. All rights reserved.
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}






