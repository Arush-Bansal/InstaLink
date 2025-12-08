import Link from "next/link";
import { ArrowLeft, Mail, MapPin, Sparkles, GraduationCap, Heart, Code2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col relative overflow-hidden bg-emerald-50/30 text-slate-900">
      
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-white/50 p-2 rounded-full border border-emerald-100 group-hover:border-emerald-300 transition-colors">
            <ArrowLeft className="w-5 h-5 text-emerald-700" />
          </div>
          <span className="font-medium text-emerald-900">Back to Home</span>
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-12 pb-24 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-emerald-100 bg-white/60 backdrop-blur-md mb-4 shadow-sm shadow-emerald-900/5">
            <Sparkles className="w-4 h-4 text-emerald-600 mr-2" />
            <span className="text-sm font-medium text-emerald-900/80 tracking-wide">About GrifiLinks</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            Empowering the Next Generation of <span className="text-gradient">Creators</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            We are building the ultimate toolkit for fashion influencers to monetize their content and connect with their audience.
          </p>
        </div>
      </section>

      {/* Mission & Roots Section */}
      <section className="relative z-10 py-16 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mission Card */}
            <div className="glass-card p-8 rounded-3xl border border-emerald-100 relative overflow-hidden group hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-500">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Rocket className="w-32 h-32 text-emerald-600" />
               </div>
               <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 text-emerald-600">
                 <Heart className="w-6 h-6" />
               </div>
               <h3 className="text-2xl font-bold mb-4 text-slate-900">Our Mission</h3>
               <p className="text-slate-600 leading-relaxed mb-6">
                 Influencers shape the way we discover and shop. Yet, the tools available to them are often clunky and disconnected. We are here to change that by building a "Link in Bio" experience that is as beautiful as it is functional.
               </p>
               <div className="flex items-center gap-2 text-emerald-700 font-medium">
                 <Sparkles className="w-4 h-4" />
                 <span>For the Creator Economy</span>
               </div>
            </div>

            {/* Engineering Roots Card */}
            <div className="glass-card p-8 rounded-3xl border border-emerald-100 relative overflow-hidden group hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Code2 className="w-32 h-32 text-blue-600" />
               </div>
               <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                 <GraduationCap className="w-6 h-6" />
               </div>
               <h3 className="text-2xl font-bold mb-4 text-slate-900">Engineering Excellence</h3>
               <p className="text-slate-600 leading-relaxed mb-6">
                 With roots at IIT Delhi, we bring a rigorous, engineering-first approach to solving creative problems. We believe that great design must be backed by robust, scalable technology.
               </p>
               <div className="flex items-center gap-2 text-blue-700 font-medium">
                 <MapPin className="w-4 h-4" />
                 <span>Based in New Delhi, India</span>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative z-10 py-24 px-4 md:px-8 bg-white/40 backdrop-blur-sm border-t border-emerald-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-slate-900">Get in Touch</h2>
          <p className="text-lg text-slate-600 mb-10 max-w-xl mx-auto">
            Whether you have a feature request, a bug to report, or just want to say hi, we'd love to hear from you.
          </p>
          
          <div className="glass-card p-8 rounded-2xl inline-flex flex-col items-center gap-4 border border-emerald-200 shadow-lg shadow-emerald-500/5 hover:scale-105 transition-transform duration-300">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
              <Mail className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Email Us At</p>
              <a href="mailto:reachout@grifi.in" className="text-2xl md:text-3xl font-bold text-emerald-700 hover:text-emerald-600 transition-colors">
                reachout@grifi.in
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-slate-500 text-sm relative z-10">
        <p>&copy; {new Date().getFullYear()} GrifiLinks. Made with ❤️ in India.</p>
      </footer>

    </main>
  );
}
