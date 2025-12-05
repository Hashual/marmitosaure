
type Props = {
    visible?: boolean;
    text?: string;
    /** size in pixels for the GIF (width and height). Default 80 */
    size?: number;
};

export default function LoadingMask({ visible = true, text }: Props) {
    if (!visible) return null;

    return (
        <div
            aria-hidden={!visible}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ pointerEvents: 'auto' }}
        >
            <div
                className="absolute inset-0"
                style={{ background: 'rgba(30,30,30,0.45)' }}
            />

            <div
                className="relative flex flex-col items-center justify-center p-4 rounded"
                style={{ zIndex: 60 }}
            >
                <img
                    src={new URL('../assets/Touille_Rex.gif', import.meta.url).href}
                    alt="Chargement"
                    className="object-contain"
                    style={{ width: 250, height: 250 }}
                />
                {text && <div className="mt-2 text-sm text-white">{text}</div>}
            </div>
        </div>
    );
}
