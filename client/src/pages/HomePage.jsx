import React, { useState } from "react";
import {
  Shield,
  Lock,
  Eye,
  CheckCircle,
  AlertTriangle,
  Mail,
  Users,
  ArrowRight,
  Github,
  Play,
  Globe,
  Smartphone,
  Server,
} from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);

  const features = [
    {
      icon: Shield,
      title: "Client-Side Detection",
      description:
        "Phishing detection happens on your device before encryption",
    },
    {
      icon: Lock,
      title: "True End-to-End Encryption",
      description: "AES + RSA encryption ensures only you can read your emails",
    },
    {
      icon: Eye,
      title: "Complete Transparency",
      description: "See exactly why a message is flagged as suspicious",
    },
  ];

  const stats = [
    { number: "3.4B", label: "Phishing emails sent daily" },
    { number: "100%", label: "Client-side detection" },
    { number: "0", label: "Server access to content" },
  ];

  const applications = [
    { icon: Users, title: "Businesses", desc: "Real-time phishing protection" },
    {
      icon: Globe,
      title: "Educational Institutions",
      desc: "Secure data exchange",
    },
    {
      icon: Smartphone,
      title: "Privacy-Conscious Users",
      desc: "Personal encrypted email",
    },
    {
      icon: Server,
      title: "SMEs & Startups",
      desc: "Security without IT teams",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Navbar */}
      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      {/* Hero Section */}
      <div className="pt-16 pb-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 pt-20 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Phishing Protection
            <span className="block text-[#E50914]">Without Reading</span>
            Your Emails
          </h1>
          <p className="text-xl text-[#BBBBBB] mb-8 max-w-3xl mx-auto">
            The world's first email platform with client-side phishing detection
            and true end-to-end encryption.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button className="bg-[#E50914] hover:bg-red-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center group">
              Start Protecting Your Inbox
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="border border-[#2E2E2E] hover:border-white text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center">
              <Play className="mr-2 w-5 h-5" />
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-[#1A1A1A] rounded-xl p-6 border border-[#2E2E2E]"
              >
                <div className="text-3xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-[#BBBBBB]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-20 bg-[#111111]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Revolutionary Features
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-xl border transition-all cursor-pointer ${
                    activeFeature === index
                      ? "bg-[#1A1A1A] border-[#E50914]"
                      : "bg-[#1A1A1A] border-[#2E2E2E] hover:border-[#E50914]"
                  }`}
                  onMouseEnter={() => setActiveFeature(index)}
                  onMouseLeave={() => setActiveFeature(null)}
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`p-3 rounded-lg ${
                        activeFeature === index
                          ? "bg-[#E50914]"
                          : "bg-[#2E2E2E]"
                      }`}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-[#BBBBBB]">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Example UI */}
            <div className="bg-[#1A1A1A] rounded-2xl p-8 border border-[#2E2E2E]">
              <div className="bg-[#0A0A0A] rounded-lg p-6 mb-6">
                <div className="space-y-3">
                  <div className="bg-[#E50914]/20 border border-[#E50914]/30 rounded p-3 flex items-center">
                    <AlertTriangle className="w-5 h-5 text-[#E50914] mr-3" />
                    <span className="text-[#E50914] text-sm">
                      Phishing attempt detected
                    </span>
                  </div>
                  <div className="bg-[#1DB954]/20 border border-[#1DB954]/30 rounded p-3 flex items-center">
                    <CheckCircle className="w-5 h-5 text-[#1DB954] mr-3" />
                    <span className="text-[#1DB954] text-sm">
                      Email encrypted & sent
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <Lock className="w-12 h-12 text-[#E50914] mx-auto mb-4" />
                <p className="text-white font-semibold">
                  Your Privacy Protected
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            How InboxGuard Works
          </h2>
          <p className="text-[#BBBBBB] text-xl text-center mb-12">
            Simple, secure, and transparent process
          </p>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-[#E50914]/30"></div>

            <div className="space-y-12">
              {[
                {
                  step: 1,
                  title: "Compose Email",
                  desc: "Write your email normally in our secure interface",
                  icon: Mail,
                },
                {
                  step: 2,
                  title: "Local Phishing Check",
                  desc: "Advanced algorithms scan for threats on your device",
                  icon: Shield,
                },
                {
                  step: 3,
                  title: "Encrypt & Send",
                  desc: "Email is encrypted with AES + RSA before transmission",
                  icon: Lock,
                },
                {
                  step: 4,
                  title: "Secure Delivery",
                  desc: "Recipient gets encrypted email with optional warnings",
                  icon: CheckCircle,
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center ${
                    index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                  } relative`}
                >
                  <div className="flex-1"></div>
                  {/* Step circle */}
                  <div className="relative z-10 bg-[#E50914] w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <div
                      className={`bg-[#1A1A1A] rounded-xl p-6 border border-[#2E2E2E] ${
                        index % 2 === 0 ? "ml-8" : "mr-8"
                      }`}
                    >
                      <div className="flex items-center space-x-4 mb-3">
                        <item.icon className="w-6 h-6 text-[#E50914]" />
                        <h3 className="text-xl font-semibold text-white">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-[#BBBBBB]">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Applications */}
      <section id="applications" className="py-20 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Built for Everyone
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {applications.map((app, index) => (
              <div
                key={index}
                className="bg-[#1A1A1A] rounded-xl p-6 border border-[#2E2E2E] hover:border-[#E50914] transition-all group"
              >
                <div className="bg-[#E50914] w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <app.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {app.title}
                </h3>
                <p className="text-[#BBBBBB]">{app.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Secure Your Inbox?
          </h2>
          <p className="text-xl text-[#BBBBBB] mb-8">
            Join the privacy revolution and protect yourself from phishing
            without compromising your data.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-[#E50914] hover:bg-red-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all">
              Get Started Free
            </button>
            <button className="border border-[#2E2E2E] hover:border-white text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center">
              <Github className="mr-2 w-5 h-5" />
              View Source Code
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
