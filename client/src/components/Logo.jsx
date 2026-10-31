import React from 'react';

export const Logo = ({ size = 'md', showSubtitle = true }) => {
  const iconSize = size === 'lg' ? 44 : size === 'sm' ? 28 : 34;
  const titleSize = size === 'lg' ? '1.5rem' : size === 'sm' ? '1.05rem' : '1.25rem';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', userSelect: 'none' }}>
      <div
        style={{
          width: iconSize,
          height: iconSize,
          borderRadius: size === 'lg' ? '12px' : '10px',
          background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.25) 0%, rgba(20, 184, 166, 0.2) 100%)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          boxShadow: '0 4px 16px rgba(0, 102, 255, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <svg
          width={iconSize * 0.65}
          height={iconSize * 0.65}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.5 16C5.01472 16 3 13.9853 3 11.5C3 9.01472 5.01472 7 7.5 7C9.5 7 11 8.5 12 10C13 11.5 14.5 13 16.5 13C18.9853 13 21 10.9853 21 8.5C21 6.01472 18.9853 4 16.5 4"
            stroke="url(#brightloop-grad-1)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M16.5 8C18.9853 8 21 10.0147 21 12.5C21 14.9853 18.9853 17 16.5 17C14.5 17 13 15.5 12 14C11 12.5 9.5 11 7.5 11C5.01472 11 3 13.0147 3 15.5C3 17.9853 5.01472 20 7.5 20"
            stroke="url(#brightloop-grad-2)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="brightloop-grad-1" x1="3" y1="7" x2="21" y2="13" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38BDF8" />
              <stop offset="1" stopColor="#0066FF" />
            </linearGradient>
            <linearGradient id="brightloop-grad-2" x1="21" y1="8" x2="3" y2="20" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2DD4BF" />
              <stop offset="1" stopColor="#0D9488" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.1 }}>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: titleSize,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            background: 'linear-gradient(180deg, #FFFFFF 20%, #CBD5E1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Brightloop
        </span>
        {showSubtitle && (
          <span
            style={{
              fontSize: '0.625rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--sophisticated-teal)',
            }}
          >
            Liquid SaaS
          </span>
        )}
      </div>
    </div>
  );
};
export default Logo;
