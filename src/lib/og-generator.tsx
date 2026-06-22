import { ImageResponse } from 'next/og';
import { Cloud, FileText, Book, Folder, Search, User, Compass } from 'lucide-react';

export const ogSize = { width: 1200, height: 630 };

interface OGProps {
  title: string;
  subtitle?: string;
  type?: 'default' | 'aprender' | 'sobre-mi' | 'buscar' | 'pdf' | 'cuaderno' | 'materia' | 'folder';
}

export function generateOGImage({ title, subtitle, type = 'default' }: OGProps) {
  const Icon = (() => {
    switch (type) {
      case 'aprender': return Compass;
      case 'sobre-mi': return User;
      case 'buscar': return Search;
      case 'pdf': return FileText;
      case 'cuaderno': return Book;
      case 'materia': return Book;
      case 'folder': return Folder;
      default: return Cloud;
    }
  })();

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Background Accent */}
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex',
            backgroundColor: '#ffffff',
            backgroundImage: 'linear-gradient(to bottom right, #ffffff, #f1f5f9)',
          }}
        />

        {/* Content Container */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10, padding: '40px', textAlign: 'center' }}>
          
          {/* Logo / Icon Area */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px', background: '#fef2f2', padding: '30px', borderRadius: '40px', border: '4px solid #f87171' }}>
             {type === 'default' ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  width={120}
                  height={120}
                >
                  <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                </svg>
             ) : (
                <Icon width={120} height={120} color="#dc2626" strokeWidth={1.5} />
             )}
          </div>

          <h1 style={{ fontSize: '72px', fontWeight: 800, color: '#0f172a', margin: '0 0 20px 0', letterSpacing: '-0.025em', lineHeight: 1.1, maxWidth: '900px' }}>
            {title}
          </h1>
          
          {subtitle && (
            <p style={{ fontSize: '36px', color: '#64748b', margin: 0, maxWidth: '800px', lineHeight: 1.3 }}>
              {subtitle}
            </p>
          )}

        </div>

        {/* Footer */}
        <div style={{ position: 'absolute', bottom: '40px', display: 'flex', alignItems: 'center' }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#dc2626"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              width={40}
              height={40}
            >
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
            </svg>
            <span style={{ fontSize: '32px', fontWeight: 700, color: '#0f172a', marginLeft: '15px' }}>La Nube de Most</span>
            <span style={{ fontSize: '32px', color: '#cbd5e1', marginLeft: '15px', marginRight: '15px' }}>•</span>
            <span style={{ fontSize: '28px', color: '#64748b' }}>mostcloud.space</span>
        </div>
      </div>
    ),
    { ...ogSize }
  );
}
