# BloomFlora - Modüler CMS & Tanıtım Sitesi Şablonu

Modern, modüler ve mobile-first bir tanıtım sitesi şablonu. Next.js 16, Supabase ve shadcn/ui ile geliştirildi.

##  Özellikler

- **Modüler Page Builder**: Blok bazlı içerik yönetimi
- **Mobile-First**: 360px'den başlayan responsive tasarım (public site)
- **Admin Panel**: Desktop-optimized yönetim paneli (shadcn/ui)
- **Tema Yönetimi**: CSS variables ile dinamik tema desteği
- **Supabase**: Auth + Storage entegrasyonu
- **TypeScript**: Tip güvenli kod

##  Gereksinimler

- Node.js 18+
- npm
- Supabase hesabı (ücretsiz tier yeterli)

##  Kurulum

### 1. Bağımlılıkları yükleyin
```bash
npm install
```

### 2. Environment Variables Ayarlayın

`.env.local` dosyası zaten mevcut ama **placeholder değerler** içeriyor.

**Gerçek Supabase projesi oluşturmak için:**

a. [Supabase Dashboard](https://app.supabase.com)'a gidin  
b. Yeni bir proje oluşturun  
c. Project Settings > API'den URL ve anon key'i alın  
d. `.env.local` dosyasını güncelleyin:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Development Server'ı Başlatın
```bash
npm run dev
```

Site `http://localhost:3000` adresinde açılacak.

##  Proje Yapısı

```
src/
├── app/
│   ├── (public)/          # Public site (mobile-first)
│   └── admin/             # Admin panel (desktop-first)
├── components/
│   ├── ui/                # shadcn/ui bileşenleri
│   ├── public/            # Public site bileşenleri
│   └── admin/             # Admin panel bileşenleri
├── modules/               # Page builder modülleri
├── lib/
│   ├── supabase/          # Supabase helpers
│   ├── theme/             # Tema yönetimi
│   └── utils.ts           # Utility fonksiyonlar
└── styles/
    └── globals.css        # Global CSS + tema token'ları
```

##  Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint kontrolü
npm run type-check   # TypeScript kontrolü
```
