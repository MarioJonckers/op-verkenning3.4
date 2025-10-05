export default function Footer() {
    return (
        <div
            style={{
                position: 'absolute',
                bottom: 8,
                right: 12,
                fontSize: 12,
                color: '#94a3b8',
                pointerEvents: 'none',
            }}
        >
            versie {typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev'}
        </div>
    );
}
