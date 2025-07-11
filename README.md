# IdeaVerse - Own ideas. Stake teams. Build worlds. 🚀

A React-based web application that gamifies idea creation and team building through superhero-themed NFT minting and collaborative workspaces.

## 📋 Overview

IdeaVerse is a platform that transforms creative ideas into tradeable digital assets (NFTs) while fostering collaboration through team formation. Users can mint their ideas as unique digital collectibles, discover others' concepts in a marketplace, and form teams to bring promising ideas to life.

## ✨ Features

- **🎨 Idea Minting**: Transform your creative concepts into unique NFT collectibles
- **🏪 Marketplace**: Browse, discover, and trade idea NFTs created by the community
- **👥 Team Building**: Form collaborative teams around promising ideas
- **👤 Builder Profiles**: Showcase your skills, ratings, and project history
- **📈 Progress Tracking**: Monitor team development and project milestones
- **🎮 Gamified Experience**: Superhero-themed UI with floating animations and modern design

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS with custom animations
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Code Quality**: ESLint with TypeScript support

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to view the application

## 📜 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the project for production
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview production build locally

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Navigation header
│   ├── Footer.tsx      # Site footer
│   ├── HeroSection.tsx # Landing page hero
│   └── ...            # Other components
├── pages/              # Main application pages
│   ├── HomePage.tsx    # Landing page
│   ├── MarketplacePage.tsx # NFT marketplace
│   ├── BuildersPage.tsx    # Builder profiles
│   └── ...            # Other pages
├── contexts/           # React context providers
│   └── AppContext.tsx  # Global application state
└── main.tsx           # Application entry point
```

## 🎯 Core Pages

- **Home** (`/`) - Welcome page with hero section and features overview
- **Marketplace** (`/marketplace`) - Browse and trade idea NFTs
- **Builders** (`/builders`) - Discover talented builders and their profiles
- **Teams** (`/teams`) - View and join collaborative teams
- **Profile** (`/profile/:id`) - Individual user profiles and achievements
- **Create Superhero** (`/create-superhero`) - Mint new idea NFTs

## 🎨 Design System

The application features a superhero-themed design with:
- **Custom gradients**: Dreamy sky-to-mint color schemes
- **Floating animations**: Subtle animated elements throughout the UI
- **Responsive design**: Mobile-first approach with Tailwind CSS
- **Custom fonts**: Orbitron and Press Start 2P for themed typography

## 🔧 Development

### Code Style
- TypeScript for type safety
- ESLint for code linting
- Functional React components with hooks
- Tailwind CSS for styling

### Key Dependencies
- `react` & `react-dom` - Core React framework
- `react-router-dom` - Client-side routing
- `lucide-react` - Modern icon library
- `tailwindcss` - Utility-first CSS framework

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and not currently licensed for public use.

---

Built with ❤️ using React and TypeScript