import React from 'react';
import { CheckCircle, Circle, Clock, Target } from 'lucide-react';

const roadmapItems = [
  {
    id: 1,
    phase: 'Phase 1',
    title: 'Platform Foundation',
    description: 'Core NFT minting and marketplace functionality',
    status: 'completed',
    progress: 100,
    pixelColor: 'from-green-400 to-emerald-500',
  },
  {
    id: 2,
    phase: 'Phase 2',
    title: 'Community Features',
    description: 'Team formation, staking, and collaboration tools',
    status: 'in-progress',
    progress: 65,
    pixelColor: 'from-blue-400 to-cyan-500',
  },
  {
    id: 3,
    phase: 'Phase 3',
    title: 'Advanced Analytics',
    description: 'Progress tracking, milestone verification, and insights',
    status: 'upcoming',
    progress: 15,
    pixelColor: 'from-orange-400 to-red-500',
  },
  {
    id: 4,
    phase: 'Phase 4',
    title: 'Ecosystem Expansion',
    description: 'Cross-chain support and advanced governance',
    status: 'planned',
    progress: 0,
    pixelColor: 'from-purple-400 to-pink-500',
  },
];

const RoadmapSection = () => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-6 h-6 text-blue-600" />;
      case 'upcoming':
        return <Target className="w-6 h-6 text-orange-600" />;
      case 'planned':
        return <Circle className="w-6 h-6 text-gray-400" />;
      default:
        return <Circle className="w-6 h-6 text-gray-400" />;
    }
  };

  return (
    <section id="roadmap" className="py-16 px-4 relative">
      <div className="container mx-auto max-w-8xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-pixel-3xl md:text-pixel-5xl font-pixel font-bold text-gray-800 mb-4 uppercase tracking-wider pixel-text-shadow">
            <span className="inline-block bg-white/20 border-4 border-gray-800 px-4 py-2 mb-2 shadow-lg">Development</span>{' '}
            <span className="inline-block bg-sunset-coral/20 border-4 border-red-600 px-4 py-2 shadow-lg text-sunset-coral">Roadmap</span>
          </h2>
          <p className="text-pixel-lg font-orbitron text-gray-600 max-w-2xl mx-auto uppercase tracking-wide">
            Track our progress and development milestones
          </p>
        </div>

        {/* Roadmap Timeline */}
        <div className="grid lg:grid-cols-4 gap-4">
          {roadmapItems.map((item, index) => (
            <div
              key={item.id}
              className="group transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative bg-white/90 border-4 border-gray-800 p-4 shadow-lg">
                {/* Compact Pixel Art Header */}
                <div className={`h-12 bg-gradient-to-r ${item.pixelColor} relative overflow-hidden border-b-4 border-gray-800 mb-3`}>
                  {/* Progress Bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
                    <div
                      className="h-full bg-white transition-all duration-500"
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>

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
                    <div className="w-6 h-6 bg-white/90 border-2 border-gray-600 flex items-center justify-center">
                      {getStatusIcon(item.status)}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="font-pixel font-bold text-pixel-lg text-gray-800 mb-1 uppercase tracking-wider">
                    {item.phase}
                  </h3>
                  <h4 className="font-orbitron font-semibold text-pixel-sm text-gray-700 mb-2 uppercase tracking-wide">
                    {item.title}
                  </h4>
                  <p className="font-orbitron text-pixel-xs text-gray-600 mb-3 uppercase tracking-wide">
                    {item.description}
                  </p>
                  <div className="text-pixel-xs font-pixel font-bold text-gray-500 uppercase tracking-wider">
                    {item.progress}% COMPLETE
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoadmapSection;