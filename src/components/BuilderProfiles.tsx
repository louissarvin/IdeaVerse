import React from 'react';
import { Star, Trophy, Users, Zap, Badge } from 'lucide-react';

const builders = [
  {
    id: 1,
    name: 'Alex Chen',
    username: '@alexbuilds',
    avatar: '👨‍💻',
    level: 42,
    reputation: 2850,
    specialties: ['DeFi', 'Smart Contracts'],
    achievements: ['First Mint', 'Team Player', 'Innovation Leader'],
    teamsFormed: 12,
    ideasMinted: 8,
    bgGradient: 'from-sunset-coral/20 to-sky-blue/20',
  },
  {
    id: 2,
    name: 'Sarah Kim',
    username: '@sarahcodes',
    avatar: '👩‍🎨',
    level: 38,
    reputation: 2340,
    specialties: ['UI/UX', 'Frontend'],
    achievements: ['Design Master', 'Community Builder', 'Pixel Artist'],
    teamsFormed: 9,
    ideasMinted: 15,
    bgGradient: 'from-moss-green/20 to-sunset-coral/20',
  },
  {
    id: 3,
    name: 'Marcus Johnson',
    username: '@marcusdev',
    avatar: '🚀',
    level: 55,
    reputation: 3420,
    specialties: ['Blockchain', 'Backend'],
    achievements: ['Code Ninja', 'Mentor', 'Tech Lead'],
    teamsFormed: 18,
    ideasMinted: 6,
    bgGradient: 'from-sky-blue/20 to-moss-green/20',
  },
];

const BuilderProfiles = () => {
  return (
    <section id="builders" className="py-20 px-4 relative">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-fredoka font-bold text-gray-800 mb-4">
            Meet Our <span className="text-moss-green">Builders</span>
          </h2>
          <p className="text-lg font-poppins text-gray-600 max-w-2xl mx-auto">
            Connect with talented creators who are shaping the future of Web3
          </p>
        </div>

        {/* Builders Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {builders.map((builder, index) => (
            <div
              key={builder.id}
              className={`group relative overflow-hidden rounded-3xl backdrop-blur-md bg-gradient-to-br ${builder.bgGradient} border border-white/30 p-6 hover:shadow-xl hover:scale-105 transition-all duration-300`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 w-20 h-20 bg-white rounded-full"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-white rounded-full"></div>
              </div>

              <div className="relative z-10">
                {/* Avatar & Level */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-sunset-coral to-sky-blue rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                    {builder.avatar}
                  </div>
                  <div>
                    <h3 className="font-fredoka font-bold text-xl text-gray-800">{builder.name}</h3>
                    <p className="font-poppins text-sm text-gray-600">{builder.username}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Zap className="w-4 h-4 text-sunset-coral" />
                      <span className="font-poppins text-sm font-semibold text-sunset-coral">Level {builder.level}</span>
                    </div>
                  </div>
                </div>

                {/* Reputation */}
                <div className="flex items-center space-x-2 mb-4">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-poppins text-sm font-medium text-gray-700">
                    {builder.reputation.toLocaleString()} Reputation
                  </span>
                </div>

                {/* Specialties */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {builder.specialties.map((specialty, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-white/30 backdrop-blur-sm rounded-full text-xs font-poppins font-medium text-gray-700"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="font-fredoka font-bold text-lg text-sky-blue">{builder.teamsFormed}</div>
                    <div className="font-poppins text-xs text-gray-600">Teams Formed</div>
                  </div>
                  <div className="text-center">
                    <div className="font-fredoka font-bold text-lg text-moss-green">{builder.ideasMinted}</div>
                    <div className="font-poppins text-xs text-gray-600">Ideas Minted</div>
                  </div>
                </div>

                {/* Achievements */}
                <div className="mb-4">
                  <h4 className="font-poppins text-sm font-semibold text-gray-700 mb-2">Recent Achievements</h4>
                  <div className="flex flex-wrap gap-1">
                    {builder.achievements.slice(0, 3).map((achievement, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-sunset-coral/20 to-sky-blue/20 rounded-full"
                      >
                        <Trophy className="w-3 h-3 text-sunset-coral" />
                        <span className="text-xs font-poppins text-gray-700">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Connect Button */}
                <button className="w-full bg-gradient-to-r from-sunset-coral to-sky-blue text-white py-2 rounded-xl font-poppins font-medium text-sm hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                  Connect & Collaborate
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Join Community CTA */}
        <div className="text-center">
          <div className="inline-block p-8 backdrop-blur-md bg-white/20 border border-white/30 rounded-3xl">
            <div className="mb-4">
              <Badge className="w-12 h-12 text-sunset-coral mx-auto" />
            </div>
            <h3 className="font-fredoka font-bold text-2xl text-gray-800 mb-2">
              Become a Builder
            </h3>
            <p className="font-poppins text-gray-600 mb-6 max-w-md">
              Join our community of creators and start building your reputation in the Web3 space
            </p>
            <button className="inline-flex items-center space-x-2 bg-gradient-to-r from-moss-green to-sky-blue text-white px-8 py-3 rounded-full font-poppins font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-200">
              <Users className="w-4 h-4" />
              <span>Join Community</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BuilderProfiles;