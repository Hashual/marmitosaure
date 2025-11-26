import { Link, useNavigate } from "react-router-dom";

const imgLucideSearch = "https://www.figma.com/api/mcp/asset/f912f357-1d3e-485d-bc72-9078d1e678af";
const imgLucidePlus = "https://www.figma.com/api/mcp/asset/67d8e788-2a79-4aa4-b050-1086a2bb9024";
const imgLucideHeart = "https://www.figma.com/api/mcp/asset/b91610f7-fd64-45ca-b632-7efaf04f60d2";
const imgLucideUser = "https://www.figma.com/api/mcp/asset/d2d93cd4-c26f-496d-9314-2e4f2bc396a9";
const imgLogo = "https://www.figma.com/api/mcp/asset/8bb478b7-370e-4ad4-8905-1b7cd86c3d0e";

export default function Header() {
  const navigate = useNavigate();

  return (
    <>
      {/* Background gradient with clip-path */}
      <div 
        className="fixed left-0 top-0 w-full h-[235px] z-0" 
        style={{ 
          background: 'linear-gradient(180deg, #7dd3bd 0%, #ecf9f5 100%)',
          clipPath: 'polygon(0 0, 100% 0, 100% 75%, 0 100%)'
        }}
      />
      
      {/* Header content */}
      <div className="fixed left-0 top-0 w-full h-[235px] z-50">
        <div className="absolute left-1/2 top-[32px] -translate-x-1/2 w-[1030px] h-[40px]">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link to="/" className="w-[40px] h-[40px] shrink-0">
            <img alt="Logo Marmitosaure" className="w-full h-full object-cover rounded-full" src={imgLogo} />
          </Link>

          {/* Search Bar */}
          <div className="flex items-center gap-[10px] bg-[#ecf9f5] px-[24px] py-[11px] w-[400px] h-[37px]">
            <div className="w-[16.5px] h-[16.5px] opacity-75 shrink-0">
              <img alt="" className="w-full h-full" src={imgLucideSearch} />
            </div>
            <input
              type="text"
              placeholder="Commencez à rechercher une recette..."
              className="bg-transparent border-none outline-none text-[#24755d] text-[12px] opacity-75 flex-1 w-full"
              style={{ fontFamily: 'Inria Serif, sans-serif' }}
            />
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-[24px]">
            <button className="w-[24px] h-[24px] cursor-pointer hover:opacity-75 transition-opacity">
              <img alt="Ajouter une recette" className="w-full h-full" src={imgLucidePlus} />
            </button>
            <button className="w-[24px] h-[24px] cursor-pointer hover:opacity-75 transition-opacity">
              <img alt="Favoris" className="w-full h-full" src={imgLucideHeart} />
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="w-[24px] h-[24px] cursor-pointer hover:opacity-75 transition-opacity"
            >
              <img alt="Mon compte" className="w-full h-full" src={imgLucideUser} />
            </button>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
