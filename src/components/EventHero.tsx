
import { Button } from '@/components/ui/button';
import { ArrowRight, Ticket } from 'lucide-react';
import { Link } from '@tanstack/react-router';

// Assuming the image will be placed in public folder or imported.
// For now, I'll assume it's imported in the parent or I'll use a placeholder style if image fails,
// but the plan is to use the generated image.
const HeroImage = "/wakye_fest_hero_bg.png"; // We will ensure this file exists in public/

const EventHero = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${HeroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.4) saturate(1.2)'
        }}
      />
      
      {/* Gradient Overlay for better text readability */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
        <div className="animate-fade-in-up">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-8xl">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 font-display">
              WAAKYE FEST
            </span>
            <span className="block text-2xl sm:text-4xl font-light tracking-widest mt-2 text-gray-300">
              2026
            </span>
          </h1>
          
          <p className="mx-auto mt-6 max-w-lg text-xl text-gray-300 sm:max-w-3xl">
            Experience the biggest food festival in Ho. Unlimited Waakye, music, and vibes.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/buy-tickets" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white border-0 text-lg font-bold px-8 py-6 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.5)] transition-all hover:scale-105">
                <Ticket className="mr-2 h-5 w-5" />
                Get Tickets
              </Button>
            </Link>
            <Link to="/details" className="w-full sm:w-auto">
               <Button variant="outline" size="lg" className="w-full sm:w-auto border-gray-500 text-gray-300 hover:bg-white/10 hover:text-white text-lg px-8 py-6 rounded-full backdrop-blur-sm">
                Event Details
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventHero;
