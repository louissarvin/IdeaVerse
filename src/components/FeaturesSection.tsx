import React from 'react';
import { Coins, Shield, Users, TrendingUp, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Coins,
    title: 'Mint Ideas',
    description: 'Transform your creative concepts into NFTs. Own your intellectual property.',
    color: 'sunset-coral',
    bgColor: 'bg-sunset-coral/20',
    iconColor: 'text-sunset-coral',
    pixelColor: 'from-orange-400 to-red-500',
  },
  {
    icon: Shield,
    title: 'Build Identity',
    description: 'Develop your reputation through verified contributions. Earn badges and levels.',
    color: 'sky-blue',
    bgColor: 'bg-sky-blue/20',
    iconColor: 'text-sky-blue',
    pixelColor: 'from-blue-400 to-cyan-500',
  },
  {
    icon: Users,
    title: 'Form Teams',
    description: 'Connect with like-minded builders. Stake tokens to join exclusive teams.',
    color: 'moss-green',
    bgColor: 'bg-moss-green/20',
    iconColor: 'text-moss-green',
    pixelColor: 'from-green-400 to-emerald-500',
  },
  {
    icon: TrendingUp,
    title: 'Track Progress',
    description: 'Monitor milestone achievements with transparent blockchain verification.',
    color: 'sunset-coral',
    bgColor: 'bg-gradient-to-br from-sunset-coral/20 to-sky-blue/20',
    iconColor: 'text-sunset-coral',
    pixelColor: 'from-purple-400 to-pink-500',
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-16 px-4 relative">
      <div className="container mx-auto max-w-8xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-white/90 border-4 border-gray-600 px-4 py-2 mb-4">
            <Sparkles className="w-4 h-4 text-sunset-coral" />
            <span className="font-pixel text-pixel-sm font-bold text-gray-700 uppercase tracking-wider">Core Features</span>
          </div>
          <h2 className="text-pixel-3xl md:text-pixel-5xl font-pixel font-bold text-gray-800 mb-4 uppercase tracking-wider">
            Everything You Need to <span className="text-sunset-coral">Build</span>
          </h2>
          <p className="text-pixel-lg font-orbitron text-gray-600 max-w-2xl mx-auto uppercase tracking-wide">
            From ideation to execution, IdeaMan provides the complete toolkit
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white/90 border-4 border-gray-800 hover:shadow-xl hover:scale-105 transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Compact Pixel Art Header */}
              <div className={`h-16 bg-gradient-to-r ${feature.pixelColor} relative overflow-hidden border-b-4 border-gray-800`}>
                {/* Pixel Pattern */}
                <div className="absolute inset-0 opacity-30">
                  <div className="grid grid-cols-6 h-full">
                    {[...Array(18)].map((_, i) => (
                      <div key={i} className={`${i % 3 === 0 ? 'bg-white/30' : i % 5 === 0 ? 'bg-black/20' : ''}`}></div>
                    ))}
                  </div>
                </div>
                
                {/* Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-white/90 border-2 border-gray-600 flex items-center justify-center">
                    <feature.icon className={`w-5 h-5 ${feature.iconColor}`} />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-pixel-lg font-pixel font-bold text-gray-800 mb-2 uppercase tracking-wider">
                  {feature.title}
                </h3>
                <p className="font-orbitron text-pixel-sm text-gray-600 leading-relaxed uppercase tracking-wide">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <button className="inline-flex items-center space-x-2 bg-gradient-to-r from-sunset-coral to-sky-blue text-white px-8 py-4 border-4 border-gray-800 font-pixel font-bold text-pixel-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 uppercase tracking-wider animate-pixel-glow">
            <span>GET STARTED TODAY</span>
            <TrendingUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;