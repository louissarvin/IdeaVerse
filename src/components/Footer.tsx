import React from 'react';
import { Zap, Twitter, Github, MessageCircle, Mail, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative py-12 px-4 bg-white/90 border-t-4 border-gray-800">
      <div className="container mx-auto max-w-8xl">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Description */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-sunset-coral border-4 border-gray-800 flex items-center justify-center animate-pixel-glow">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-pixel-2xl font-pixel font-bold text-gray-800 uppercase tracking-wider">IdeaMan</span>
            </div>
            <p className="font-orbitron text-pixel-sm text-gray-600 mb-4 uppercase tracking-wide">
              Empowering creators to mint ideas, build teams, and shape the future of Web3.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-8 h-8 bg-white/90 border-2 border-gray-600 flex items-center justify-center hover:bg-gray-100 transition-colors">
                <Twitter className="w-4 h-4 text-gray-600" />
              </a>
              <a href="#" className="w-8 h-8 bg-white/90 border-2 border-gray-600 flex items-center justify-center hover:bg-gray-100 transition-colors">
                <Github className="w-4 h-4 text-gray-600" />
              </a>
              <a href="#" className="w-8 h-8 bg-white/90 border-2 border-gray-600 flex items-center justify-center hover:bg-gray-100 transition-colors">
                <MessageCircle className="w-4 h-4 text-gray-600" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-pixel font-bold text-pixel-lg text-gray-800 mb-4 uppercase tracking-wider">Platform</h3>
            <ul className="space-y-2 font-orbitron text-pixel-sm text-gray-600">
              <li><a href="#features" className="hover:text-sunset-coral transition-colors uppercase tracking-wide">Features</a></li>
              <li><a href="#marketplace" className="hover:text-sunset-coral transition-colors uppercase tracking-wide">Marketplace</a></li>
              <li><a href="#builders" className="hover:text-sunset-coral transition-colors uppercase tracking-wide">Builders</a></li>
              <li><a href="#roadmap" className="hover:text-sunset-coral transition-colors uppercase tracking-wide">Roadmap</a></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-pixel font-bold text-pixel-lg text-gray-800 mb-4 uppercase tracking-wider">Community</h3>
            <ul className="space-y-2 font-orbitron text-pixel-sm text-gray-600">
              <li><a href="#" className="hover:text-sunset-coral transition-colors uppercase tracking-wide">Discord</a></li>
              <li><a href="#" className="hover:text-sunset-coral transition-colors uppercase tracking-wide">Telegram</a></li>
              <li><a href="#" className="hover:text-sunset-coral transition-colors uppercase tracking-wide">Blog</a></li>
              <li><a href="#" className="hover:text-sunset-coral transition-colors uppercase tracking-wide">Documentation</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-pixel font-bold text-pixel-lg text-gray-800 mb-4 uppercase tracking-wider">Support</h3>
            <ul className="space-y-2 font-orbitron text-pixel-sm text-gray-600">
              <li><a href="#" className="hover:text-sunset-coral transition-colors uppercase tracking-wide">Help Center</a></li>
              <li><a href="#" className="hover:text-sunset-coral transition-colors uppercase tracking-wide">Contact Us</a></li>
              <li><a href="#" className="hover:text-sunset-coral transition-colors uppercase tracking-wide">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-sunset-coral transition-colors uppercase tracking-wide">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t-4 border-gray-800 pt-8 mb-8">
          <div className="max-w-md mx-auto text-center">
            <h3 className="font-pixel font-bold text-pixel-xl text-gray-800 mb-2 uppercase tracking-wider">Stay Updated</h3>
            <p className="font-orbitron text-pixel-sm text-gray-600 mb-4 uppercase tracking-wide">
              Get the latest updates on new features and platform developments
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="ENTER YOUR EMAIL"
                className="flex-1 px-4 py-2 bg-white/90 border-2 border-gray-600 font-orbitron text-pixel-sm placeholder-gray-500 focus:outline-none focus:border-sunset-coral pixel-input uppercase tracking-wide"
              />
              <button className="bg-gradient-to-r from-sunset-coral to-sky-blue text-white px-6 py-2 border-2 border-gray-800 font-pixel font-bold text-pixel-sm hover:shadow-lg transition-all duration-200 uppercase tracking-wider">
                <Mail className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t-4 border-gray-800 pt-8 text-center">
          <p className="font-orbitron text-pixel-sm text-gray-600 flex items-center justify-center space-x-2 uppercase tracking-wide">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-sunset-coral" />
            <span>by the IdeaMan team. © 2025 All rights reserved.</span>
          </p>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-sunset-coral border-4 border-gray-800"></div>
        <div className="absolute -bottom-5 -right-5 w-32 h-32 bg-sky-blue border-4 border-gray-800"></div>
      </div>
    </footer>
  );
};

export default Footer;