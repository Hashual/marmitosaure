import { Link, useNavigate } from "react-router-dom";
import LucideHeart from "../assets/LucideHeart";
import LucideUser from "../assets/LucideUser";
import LucidePlus from "../assets/LucidePlus";
import LucideSearch from "../assets/LucideSearch";
import Logo from "../assets/dino.png";

export default function Header() {
  const navigate = useNavigate();

  return (
    <>
      {/* Background gradient with clip path */}
      <div
        className=""
        style={{
          background: "linear-gradient(180deg, #7dd3bd 0%, #ecf9f5 100%)",
          clipPath: "polygon(0 0, 100% 0, 100% 75%, 0 100%)",
        }}
      />

      {/* Header content */}
      <div className="left-0 top-0 w-full h-[235px] z-50">
        <div className="absolute left-1/2 top-[32px] -translate-x-1/2 w-[1030px] h-[40px]">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Link to="/" className="w-[40px] h-[40px] shrink-0">
              <img
                alt="Logo Marmitosaure"
                className="w-full h-full object-cover rounded-full"
                src={Logo}
              />
            </Link>

            {/* Search bar */}
            <div className="flex items-center gap-[10px] bg-[#ecf9f5] px-[24px] py-[11px] w-[400px] h-[37px]">
              <div className="w-[16.5px] h-[16.5px] opacity-75 shrink-0">
                <LucideSearch />
              </div>
              <input
                type="text"
                placeholder="Commencez à rechercher une recette..."
                className="bg-transparent border-none outline-none text-[#24755d] text-[12px] opacity-75 flex-1 w-full"
                style={{ fontFamily: "Inria Serif, sans-serif" }}
              />
            </div>

            {/* Navigation icons */}
            <div className="flex items-center gap-[24px]">
              <button
                onClick={() => navigate("/recipe-create")}
                className="w-[24px] h-[24px] cursor-pointer hover:opacity-75 transition-opacity"
                aria-label="Créer une recette"
              >
                <LucidePlus />
              </button>
              <button
                className="w-[24px] h-[24px] cursor-pointer hover:opacity-75 transition-opacity"
                aria-label="Favoris"
              >
                <LucideHeart />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="w-[24px] h-[24px] cursor-pointer hover:opacity-75 transition-opacity"
                aria-label="Connexion"
              >
                <LucideUser />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
