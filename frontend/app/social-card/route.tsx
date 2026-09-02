import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { categoryLabel } from '@/lib/category-theme';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'NewsFree365 — Verified Global Intelligence';
    const category = searchParams.get('category') || 'NEWS';
    const ratio = searchParams.get('ratio') || '1.91:1';
    const bgImage = searchParams.get('image') || '';

    // Dimensions based on ratio
    let width = 1200;
    let height = 630;

    if (ratio === '1:1') {
      width = 1080;
      height = 1080;
    } else if (ratio === '9:16') {
      width = 1080;
      height = 1920;
    } else if (ratio === '16:9') {
      width = 1200;
      height = 675;
    }

    const catText = categoryLabel(category).toUpperCase();

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#060a14',
            position: 'relative',
            fontFamily: 'sans-serif',
            boxSizing: 'border-box',
          }}
        >
          {/* Background Image (if available) */}
          {bgImage && (
            <img
              src={bgImage}
              alt=""
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          )}

          {/* Top Subtle Vignette */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '35%',
              background: 'linear-gradient(to bottom, rgba(5, 9, 19, 0.75) 0%, rgba(5, 9, 19, 0) 100%)',
            }}
          />

          {/* Bottom Contrast Gradient */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '65%',
              background: 'linear-gradient(to bottom, rgba(5, 9, 19, 0) 0%, rgba(5, 9, 19, 0.7) 40%, rgba(5, 9, 19, 0.98) 100%)',
            }}
          />

          {/* 1. Header: Brand Logo (# Circle) + Wordmark */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              padding: ratio === '9:16' ? '50px 45px' : '45px 50px',
              gap: '16px',
            }}
          >
            {/* Logo Emblem (#) */}
            <div
              style={{
                width: ratio === '9:16' ? '68px' : '58px',
                height: ratio === '9:16' ? '68px' : '58px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0f9f8f 0%, #0f766e 45%, #031f1d 100%)',
                border: '2px solid rgba(204, 251, 241, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 18px rgba(15, 118, 110, 0.7)',
              }}
            >
              <span
                style={{
                  fontSize: ratio === '9:16' ? '38px' : '32px',
                  fontWeight: 900,
                  color: '#ffffff',
                  fontStyle: 'italic',
                  lineHeight: 1,
                  marginTop: '-3px',
                }}
              >
                #
              </span>
            </div>

            {/* Wordmark */}
            <span
              style={{
                fontSize: ratio === '9:16' ? '42px' : '36px',
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '-0.5px',
                textShadow: '0 2px 14px rgba(0, 0, 0, 0.9)',
              }}
            >
              NewsFree365
            </span>
          </div>

          {/* 2. Bottom Content: Category Badge + Main News Headline */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              padding: ratio === '9:16' ? '0 50px 90px 50px' : '0 50px 50px 50px',
            }}
          >
            {/* Category Pill */}
            <div
              style={{
                display: 'flex',
                alignSelf: 'flex-start',
                backgroundColor: '#0f766e',
                border: '1.5px solid #2dd4bf',
                borderRadius: '8px',
                padding: '8px 18px',
                marginBottom: '16px',
                boxShadow: '0 0 16px rgba(20, 184, 166, 0.5)',
              }}
            >
              <span
                style={{
                  fontSize: ratio === '9:16' ? '24px' : '20px',
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '0.5px',
                }}
              >
                {catText}
              </span>
            </div>

            {/* Headline Title */}
            <div
              style={{
                fontSize: ratio === '9:16' ? '56px' : ratio === '1:1' ? '50px' : '44px',
                fontWeight: 900,
                color: '#ffffff',
                lineHeight: 1.22,
                letterSpacing: '-0.5px',
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.95)',
                display: '-webkit-box',
                WebkitLineClamp: ratio === '9:16' ? 6 : ratio === '1:1' ? 5 : 4,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {title}
            </div>
          </div>
        </div>
      ),
      {
        width,
        height,
      }
    );
  } catch (err: any) {
    return new Response(`Failed to render social card: ${err.message}`, { status: 500 });
  }
}
