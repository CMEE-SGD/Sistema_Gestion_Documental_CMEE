import { useEffect, useState } from "react";

interface LoginCarouselProps {
  imagenes: string[];
  intervaloMs?: number;
}

export default function LoginCarousel({ imagenes, intervaloMs = 6000 }: LoginCarouselProps) {
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    if (imagenes.length <= 1) return;
    const id = setInterval(() => {
      setIndice((prev) => (prev + 1) % imagenes.length);
    }, intervaloMs);
    return () => clearInterval(id);
  }, [imagenes.length, intervaloMs]);

  return (
    <div className="absolute inset-0">
      {imagenes.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
            i === indice ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {imagenes.length > 1 && (
        <div className="absolute top-8 right-8 z-20 flex gap-2">
          {imagenes.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndice(i)}
              aria-label={`Mostrar foto ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === indice ? "w-6 bg-[#f0c563]" : "w-1.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
