'use client';

export default function WhatsAppButton() {
  const handleClick = () => {
    const phone = '6281234567890';
    const text = encodeURIComponent(
      'Halo Zentra, saya ingin bertanya tentang layanan hosting'
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <>
      <style jsx>{`
        @keyframes wa-gentle-pulse {
          0%,
          100% {
            box-shadow:
              0 10px 30px -5px rgba(37, 211, 102, 0.5),
              0 0 0 0 rgba(37, 211, 102, 0.6);
          }
          50% {
            box-shadow:
              0 14px 40px -5px rgba(37, 211, 102, 0.7),
              0 0 0 14px rgba(37, 211, 102, 0);
          }
        }
        .wa-pulse {
          animation: wa-gentle-pulse 3s ease-in-out infinite;
        }
      `}</style>

      <div className="group fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {/* Tooltip */}
        <span
          className="pointer-events-none select-none rounded-lg bg-neutral-900/95 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-lg ring-1 ring-white/10 backdrop-blur translate-x-2 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-0"
          role="tooltip"
        >
          Chat dengan kami
        </span>

        {/* Floating Button */}
        <button
          type="button"
          onClick={handleClick}
          aria-label="Hubungi via WhatsApp"
          className="wa-pulse flex h-14 w-14 items-center justify-center rounded-full text-white transition-all duration-300 ease-out hover:scale-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300/60"
          style={{
            background:
              'linear-gradient(135deg, #25d366 0%, #128c7e 100%)',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            width="30"
            height="30"
            fill="currentColor"
            aria-hidden="true"
            style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))' }}
          >
            <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.15-.515 2.478-1.318.13-.32.244-.658.244-1.004 0-.214-1.892-1.143-2.078-1.143zm-2.84 7.063h-.014a9.31 9.31 0 0 1-5-1.43l-.357-.215-3.72.974.99-3.62-.228-.37a9.298 9.298 0 0 1-1.43-4.985c0-5.143 4.186-9.328 9.33-9.328 2.493 0 4.83.973 6.59 2.74a9.25 9.25 0 0 1 2.726 6.59c0 5.143-4.186 9.343-9.314 9.343zm7.92-17.262A11.12 11.12 0 0 0 16.262 3.75c-6.16 0-11.176 5.014-11.176 11.175a11.13 11.13 0 0 0 1.49 5.587L5 26.25l5.887-1.547a11.131 11.131 0 0 0 5.345 1.361h.014c6.16 0 11.176-5.014 11.176-11.175 0-2.983-1.16-5.787-3.27-7.898z" />
          </svg>
        </button>
      </div>
    </>
  );
}
