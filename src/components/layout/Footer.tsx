import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  FiInstagram,
  FiFacebook,
  FiTwitter,
  FiYoutube,
  FiMusic,
  FiPhone,
  FiExternalLink,
} from "react-icons/fi";

export default function Footer() {
  const settings = useQuery(api.settings.getAll);
  const allSettings = (settings as any[]) || [];
  const getSetting = (key: string) =>
    allSettings.find((s: any) => s.key === key)?.value;

  const socials = getSetting("socials") || {};
  const whatsapp = getSetting("whatsapp") || "";

  const socialLinks = [
    { key: "instagram", url: socials.instagram, icon: <FiInstagram size={18} />, label: "Instagram", hoverColor: "hover:text-pink-400" },
    { key: "facebook", url: socials.facebook, icon: <FiFacebook size={18} />, label: "Facebook", hoverColor: "hover:text-blue-400" },
    { key: "twitter", url: socials.twitter, icon: <FiTwitter size={18} />, label: "X / Twitter", hoverColor: "hover:text-sky-400" },
    { key: "tiktok", url: socials.tiktok, icon: <FiMusic size={18} />, label: "TikTok", hoverColor: "hover:text-gray-300" },
    { key: "youtube", url: socials.youtube, icon: <FiYoutube size={18} />, label: "YouTube", hoverColor: "hover:text-red-400" },
  ];

  const visibleSocials = socialLinks.filter((s) => s.url && s.url.trim());
  const hasWhatsApp = whatsapp && whatsapp.trim();

  return (
    <footer className="bg-aqui-dark text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <img
                src="/logo-aqui-white.png"
                alt="AQUÍ"
                className="h-14"
              />
            </div>
            <p className="text-gray-400 text-sm">
              Marketplace dominicano. Todo lo que buscas, en un solo lugar.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Categorías</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link
                  to="/productos?category=tecnologia"
                  className="hover:text-aqui-orange transition-colors"
                >
                  Tecnología
                </Link>
              </li>
              <li>
                <Link
                  to="/productos?category=bienestar"
                  className="hover:text-aqui-orange transition-colors"
                >
                  Bienestar
                </Link>
              </li>
              <li>
                <Link
                  to="/productos?category=hogar"
                  className="hover:text-aqui-orange transition-colors"
                >
                  Hogar
                </Link>
              </li>
              <li>
                <Link
                  to="/productos?category=auto"
                  className="hover:text-aqui-orange transition-colors"
                >
                  Auto
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Para Vendedores</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link
                  to="/registro"
                  className="hover:text-aqui-orange transition-colors"
                >
                  Crear Tienda
                </Link>
              </li>
              <li>
                <Link
                  to="/vendor/dashboard"
                  className="hover:text-aqui-orange transition-colors"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Soporte</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>soporte@aqui.com.do</li>
              <li>809-555-0000</li>
              <li>Atención 24/7</li>
            </ul>
          </div>
        </div>

        {/* Social Icons */}
        {(visibleSocials.length > 0 || hasWhatsApp) && (
          <div className="flex items-center gap-4 mt-8 pt-8 border-t border-gray-700">
            <span className="text-gray-500 text-sm mr-2">Síguenos:</span>
            {visibleSocials.map((s) => (
              <a
                key={s.key}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-400 ${s.hoverColor} transition-all hover:scale-110`}
                title={s.label}
              >
                {s.icon}
              </a>
            ))}
            {hasWhatsApp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-green-400 transition-all hover:scale-110"
                title="WhatsApp"
              >
                <FiPhone size={18} />
              </a>
            )}
          </div>
        )}

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2026 AQUÍ. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
