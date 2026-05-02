// Mapa Google embed sem API key — usa o endpoint público de busca.
// q pode ser "AWR Baterias Gravataí" ou coordenadas "lat,lng".

interface Props {
  query: string;
  title: string;
  height?: number;
}

export function CityMap({ query, title, height = 360 }: Props) {
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <iframe
        src={src}
        title={title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="w-full"
        style={{ height, border: 0 }}
        allowFullScreen
      />
    </div>
  );
}

export default CityMap;
