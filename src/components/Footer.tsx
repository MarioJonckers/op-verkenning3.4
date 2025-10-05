export default function Footer() {
    return (
        <div style={{
            position: 'fixed',
            right: 8,
            bottom: 8,
            padding: '4px 8px',
            borderRadius: 8,
            fontSize: 12,
            color: '#64748b',
            background: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(6px)',
            zIndex: 10
        }}>
            versie {typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'}
        </div>
    );
}
