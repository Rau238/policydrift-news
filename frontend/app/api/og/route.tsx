import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title')?.slice(0, 150) || 'PolicyDrift — Real-Time News & Global Policy';
    const category = searchParams.get('category')?.toUpperCase() || 'NEWS';
    const date = searchParams.get('date') || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#070d12',
            backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(15, 118, 110, 0.25) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(13, 148, 136, 0.2) 0%, transparent 60%)',
            padding: '60px 70px',
            fontFamily: 'sans-serif',
            color: '#ffffff',
            boxSizing: 'border-box',
          }}
        >
          {/* Top Bar: Brand & Category */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            {/* Logo + Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#0d9488',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(13, 148, 136, 0.6)',
                }}
              >
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: 900,
                    color: '#ffffff',
                    lineHeight: 1,
                  }}
                >
                  P
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '26px',
                    fontWeight: 800,
                    letterSpacing: '-0.5px',
                    color: '#f8fafc',
                  }}
                >
                  PolicyDrift
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#2dd4bf',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                  }}
                >
                  Global News &amp; Policy
                </span>
              </div>
            </div>

            {/* Category Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(13, 148, 136, 0.2)',
                border: '1px solid rgba(45, 212, 191, 0.4)',
                borderRadius: '9999px',
                padding: '8px 20px',
                fontSize: '14px',
                fontWeight: 700,
                color: '#5eead4',
                letterSpacing: '1px',
              }}
            >
              {category}
            </div>
          </div>

          {/* Headline Body */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              marginTop: '20px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                fontSize: title.length > 90 ? '42px' : title.length > 50 ? '50px' : '58px',
                fontWeight: 800,
                lineHeight: 1.18,
                letterSpacing: '-0.8px',
                color: '#ffffff',
                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              }}
            >
              {title}
            </div>
          </div>

          {/* Footer Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              borderTop: '1px solid rgba(148, 163, 184, 0.15)',
              paddingTop: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#94a3b8',
                }}
              >
                {date}
              </span>
              <span style={{ fontSize: '15px', color: '#475569' }}>•</span>
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#2dd4bf',
                }}
              >
                Verified Syndicated Brief
              </span>
            </div>

            <div
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: '#64748b',
                letterSpacing: '0.5px',
              }}
            >
              policydrift.live
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e) {
    console.error('[PolicyDrift] Error generating OG image:', e);
    return new Response('Failed to generate image', { status: 500 });
  }
}
