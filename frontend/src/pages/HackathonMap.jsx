import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FaFaceSadTear } from "react-icons/fa6";
import { MapContainer, TileLayer, Marker, Popup, ScaleControl } from "react-leaflet";

const HackathonMapPage = () => {
  const [searchParams] = useSearchParams();
  const lat = parseFloat(searchParams.get("lat"));
  const lng = parseFloat(searchParams.get("lng"));
  const name = atob(searchParams.get("name"));
  const [tileError, setTileError] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!lat || !lng || isNaN(lat) || isNaN(lng) || tileError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-base-200">
        <h1 className="text-xl font-semibold text-center mb-3">Map unavailable</h1>
        <FaFaceSadTear className="size-20 mb-12 text-base-content hover:text-base-content/20 cursor-pointer"/>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline hover:text-blue-300"
        >
          Open in Google Maps
        </a>
      </div>
    );
  }

  const position = [lat, lng];
  const customIcon = L.icon({
    iconUrl: "../../public/pngimg.com - google_maps_pin_PNG25.png",
    iconSize: [38, 38],
    iconAnchor: [19, 38],
  });

  return (
    <div className="h-screen w-full bg-base-200 flex flex-col">
      <div className="p-4 text-center border-b border-base-300">
        <h1 className="text-2xl font-bold">{name || "Hackathon Location"}</h1>
      </div>
      <div className="flex-1 relative rounded-none overflow-hidden">
        <MapContainer
          center={position}
          zoom={13}
          scrollWheelZoom={true}
          className="h-full w-full z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            eventHandlers={{
              tileerror: () => setTileError(true),
            }}
          />
          <Marker position={position} icon={customIcon} className="mix-blend-color-burn">
            <Popup>{name || "Hackathon Location"}</Popup>
          </Marker>
          <ScaleControl position="bottomright" metric={true} imperial={false}/>
        </MapContainer>
      </div>
    </div>
  );
};

export default HackathonMapPage;
