import Image from "next/image";
import FlowerAnimation from "./components/FlowerAnimation";

export default function Home() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden font-sans">
      {/* Animated Flower Background */}
      <FlowerAnimation />
      
      <main className="relative z-10 flex flex-col items-center justify-center gap-12 px-6 py-20 text-center">
        {/* Logo */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 animate-fade-in">
          <Image
            src="/circle-logo.png"
            alt="Bloom Flora Logo"
            fill
            priority
            className="object-contain drop-shadow-2xl"
          />
        </div>
        
        {/* Main Content */}
        <div className="flex flex-col items-center gap-6 max-w-2xl animate-slide-up">
          <h1 className="text-4xl md:text-6xl font-bold text-[#f5e6d3] leading-tight">
            Yakında Hizmete Açılıyoruz
          </h1>
          <p className="text-lg md:text-xl text-[#f5e6d3]/80 leading-relaxed max-w-xl">
            Çiçek ve bitki sevgisiyle dolu yeni bir deneyim için hazırlanıyoruz. 
            <span className="block mt-2">Bloom Flora çok yakında sizlerle...</span>
          </p>
        </div>

        {/* Decorative Element */}
        <div className="flex gap-2 opacity-50">
          <div className="w-2 h-2 rounded-full bg-[#f5e6d3] animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-[#f5e6d3] animate-pulse" style={{animationDelay: '0.2s'}}></div>
          <div className="w-2 h-2 rounded-full bg-[#f5e6d3] animate-pulse" style={{animationDelay: '0.4s'}}></div>
        </div>

        {/* Location Section */}
        <div className="flex flex-col items-center gap-8 w-full max-w-4xl mt-8 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-[#f5e6d3] rounded-full"></div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#f5e6d3]">
              Adresimiz
            </h2>
            <div className="w-1 h-8 bg-[#f5e6d3] rounded-full"></div>
          </div>
          
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#f5e6d3] to-[#d4c5b3] rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
            <div className="relative bg-[#4a1524]/80 backdrop-blur-md rounded-3xl p-8 md:p-10 border border-[#f5e6d3]/30 shadow-2xl">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#f5e6d3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-[#f5e6d3] text-xl md:text-2xl font-medium leading-relaxed">
                    Müftü Mahallesi, Stadyum Sokak
                  </p>
                  <p className="text-[#f5e6d3]/90 text-lg md:text-xl">
                    No: 32/A
                  </p>
                  <p className="text-[#f5e6d3]/80 text-lg md:text-xl">
                    53020 Merkez/Rize
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Google Maps */}
          <div className="w-full rounded-3xl overflow-hidden shadow-2xl border-2 border-[#f5e6d3]/30 hover:border-[#f5e6d3]/50 transition-all duration-300">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d751.8363437558744!2d40.52343306959064!3d41.02048699603044!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x406786b4b4b4b4b5%3A0x0!2zNDHCsDAxJzEzLjgiTiA0MMKwMzEnMjQuNCJF!5e0!3m2!1str!2str!4v1234567890123!5m2!1str!2str"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Bloom Flora Konumu"
            ></iframe>
          </div>
        </div>

        {/* Contact Section */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full max-w-4xl mt-8 px-4">
          {/* Email */}
          <a 
            href="mailto:bloomflorarize@gmail.com"
            className="group relative flex items-center gap-4 bg-[#4a1524]/80 backdrop-blur-md rounded-2xl px-8 py-5 border border-[#f5e6d3]/30 hover:border-[#f5e6d3]/60 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 w-full md:w-auto"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#f5e6d3] to-[#d4c5b3] rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
            <div className="relative flex items-center gap-4">
              <div className="bg-[#f5e6d3]/10 p-3 rounded-xl group-hover:bg-[#f5e6d3]/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#f5e6d3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[#f5e6d3]/70 text-xs font-medium uppercase tracking-wider">Email</span>
                <span className="text-[#f5e6d3] text-base md:text-lg font-medium">bloomflorarize@gmail.com</span>
              </div>
            </div>
          </a>

          {/* Instagram */}
          <a 
            href="https://www.instagram.com/bloomflorarize?igsh=bWNpczI3d2MxdGc2"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center gap-4 bg-[#4a1524]/80 backdrop-blur-md rounded-2xl px-8 py-5 border border-[#f5e6d3]/30 hover:border-[#f5e6d3]/60 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 w-full md:w-auto"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#f5e6d3] to-[#d4c5b3] rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
            <div className="relative flex items-center gap-4">
              <div className="bg-[#f5e6d3]/10 p-3 rounded-xl group-hover:bg-[#f5e6d3]/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#f5e6d3]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[#f5e6d3]/70 text-xs font-medium uppercase tracking-wider">Instagram</span>
                <span className="text-[#f5e6d3] text-base md:text-lg font-medium">@bloomflorarize</span>
              </div>
            </div>
          </a>
        </div>

        {/* Footer */}
        <div className="mt-12 text-[#f5e6d3]/60 text-sm">
          © 2026 Bloom Flora. Tüm hakları saklıdır.
        </div>
      </main>
    </div>
  );
}
