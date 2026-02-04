interface PopupProps {
    type: 'success' | 'error';
    message: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function Popup({ type, message, isOpen, onClose }: PopupProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 transform transition-all scale-100 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col items-center text-center">
                    {type === 'success' ? (
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <svg fill="none" stroke="currentColor" className="w-8 h-8 text-green-600" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" strokeWidth={3} /></svg>
                        </div>
                    ) : (
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <svg fill="none" stroke="currentColor" className="w-8 h-8 text-red-600" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" strokeWidth={3} /></svg>
                        </div>
                    )}

                    <h3 className={`text-xl font-bold mb-2 ${type === 'success' ? 'text-gray-900' : 'text-red-900'}`}>
                        {type === 'success' ? '¡Éxito!' : 'Error'}
                    </h3>

                    <p className="text-gray-600 mb-6">
                        {message}
                    </p>

                    <button
                        onClick={onClose}
                        className={`w-full py-3 px-6 rounded-xl font-bold text-white transition-all transform active:scale-95 ${type === 'success'
                            ? 'bg-[#003366] hover:bg-blue-900 shadow-lg shadow-blue-900/20'
                            : 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20'
                            }`}
                    >
                        {type === 'success' ? 'Entendido' : 'Cerrar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
