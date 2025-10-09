import PixelTransition from '../PixelTransition';
import { useNavigate } from 'react-router-dom';
import muaRoiNuocImg from '../../assets/Img_category/mua_roi_nuoc.jpg';
import tuongImg from '../../assets/Img_category/tuong.jpg';
import cheoImg from '../../assets/Img_category/Cheo.jpg';
import caiLuongImg from '../../assets/Img_category/cai_luong.jpg';
import caTruImg from '../../assets/Img_category/ca_tru.jpg';

const Category = () => {
  const navigate = useNavigate();

  const categories = [
    {
      id: 1,
      name: 'Múa rối nước',
      searchQuery: 'Múa rối nước',
      image: muaRoiNuocImg,
      description: 'Nghệ thuật truyền thống độc đáo của Việt Nam',
    },
    {
      id: 2,
      name: 'Tuồng',
      searchQuery: 'Tuồng',
      image: tuongImg,
      description: 'Hát tuồng - Di sản văn hóa phi vật thể',
    },
    {
      id: 3,
      name: 'Chèo',
      searchQuery: 'Chèo',
      image: cheoImg,
      description: 'Nghệ thuật sân khấu dân gian phổ biến',
    },
    {
      id: 4,
      name: 'Cải lương',
      searchQuery: 'Cải lương',
      image: caiLuongImg,
      description: 'Nghệ thuật sân khấu Nam Bộ',
    },
    {
      id: 5,
      name: 'Ca trù',
      searchQuery: 'Ca trù',
      image: caTruImg,
      description: 'Nghệ thuật hát xướng cổ truyền',
    },
  ];

  const handleExploreClick = (searchQuery: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    e.preventDefault(); // Prevent default action
    console.log('Explore clicked for:', searchQuery);
    // Navigate to search page with the category name as search query
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="w-full py-16 px-4 lg:px-8">
      {/* Title Section */}
      <div className="flex justify-center items-center py-12">
        <div className="group relative flex items-center justify-center">
          <h2
            className="text-5xl md:text-7xl font-extrabold text-gray-800 text-center tracking-wider transition-colors duration-200 cursor-pointer group-hover:text-red-500"
            style={{
              fontFamily: 'Merriweather, serif',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
            }}
          >
            THỂ LOẠI KHÁC
          </h2>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 max-w-7xl mx-auto">
        {categories.map((category) => (
          <div key={category.id} className="flex justify-center">
            <PixelTransition
              firstContent={
                <div className="relative w-full h-full">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-4">
                    <h3
                      className="text-white text-xl font-bold text-center"
                      style={{
                        fontFamily: 'Merriweather, serif',
                      }}
                    >
                      {category.name}
                    </h3>
                  </div>
                </div>
              }
              secondContent={
                <div className="relative w-full h-full bg-red-800 flex flex-col items-center justify-center p-6">
                  <h3
                    className="text-white text-2xl font-bold mb-4 text-center"
                    style={{
                      fontFamily: 'Merriweather, serif',
                      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                    }}
                  >
                    {category.name}
                  </h3>
                  <p
                    className="text-white text-sm text-center leading-relaxed"
                    style={{
                      fontFamily: 'Roboto, sans-serif',
                    }}
                  >
                    {category.description}
                  </p>
                  <button
                    className="mt-6 px-6 py-2 bg-white text-red-900 rounded-full font-bold hover:bg-red-100 transition-colors duration-200"
                    style={{
                      fontFamily: 'Merriweather, serif',
                    }}
                    onClick={(e) => handleExploreClick(category.searchQuery, e)}
                  >
                    Khám phá
                  </button>
                </div>
              }
              gridSize={10}
              pixelColor="#ffd700"
              animationStepDuration={0.4}
              aspectRatio="150%"
              className="w-full max-w-[310px]"
              style={{
                borderColor: '#730109',
                borderRadius: '12px',
                width: '310px',
                height: '465px',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Category;