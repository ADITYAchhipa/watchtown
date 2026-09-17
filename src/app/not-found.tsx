import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px 20px',
        backgroundColor: '#f8f8f8',
      }}
    >
      <h1
        style={{
          fontSize: '72px',
          fontWeight: 700,
          color: '#1a1a1a',
          margin: '0 0 10px',
          fontFamily: 'Urbanist, sans-serif',
        }}
      >
        404
      </h1>
      <h2
        style={{
          fontSize: '24px',
          fontWeight: 600,
          color: '#333',
          margin: '0 0 15px',
          fontFamily: 'Urbanist, sans-serif',
        }}
      >
        Oops! Page Not Found
      </h2>
      <p
        style={{
          maxWidth: '480px',
          color: '#666',
          fontSize: '15px',
          lineHeight: '1.6',
          margin: '0 0 30px',
        }}
      >
        The luxury timepiece or collection page you are looking for might have been moved, renamed,
        or is temporarily unavailable.
      </p>
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            backgroundColor: '#000000',
            color: '#ffffff',
            padding: '12px 28px',
            borderRadius: '4px',
            fontWeight: 600,
            fontSize: '14px',
            textDecoration: 'none',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          Return to Home
        </Link>
        <Link
          href="/#whatsapp-cta"
          style={{
            display: 'inline-block',
            backgroundColor: '#25D366',
            color: '#ffffff',
            padding: '12px 28px',
            borderRadius: '4px',
            fontWeight: 600,
            fontSize: '14px',
            textDecoration: 'none',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          Contact on WhatsApp
        </Link>
      </div>
    </div>
  );
}
