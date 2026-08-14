import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/** Apple / home-screen — hash mark. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          background: 'linear-gradient(145deg, #0f9f8f 0%, #0f766e 42%, #031f1d 100%)',
        }}
      >
        <svg width="120" height="120" viewBox="0 0 32 32" fill="none">
          <g fill="#fff" transform="translate(16 16) rotate(-8) translate(-16 -16)">
            <rect x="10.5" y="7" width="3" height="18" rx="0.9" />
            <rect x="18.5" y="7" width="3" height="18" rx="0.9" />
            <rect x="7.5" y="11" width="17" height="3" rx="0.9" />
            <rect x="7.5" y="18" width="17" height="3" rx="0.9" />
          </g>
        </svg>
      </div>
    ),
    { ...size },
  );
}
