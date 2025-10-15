import { useState, useEffect } from 'react'
import { caiLuong03, caiLuong04, caiLuong06, caiLuong07, caiLuong08, caiLuong09, caiLuong10, caiLuong11, caiLuong12, caiLuong13, caiLuong14, caiLuong15, caiLuong16, caiLuong17, caiLuong18, caiLuong19 } from '../../assets/Giao diện cải lương/index'
import { thuVienAnhCLuongImages } from '../../assets/ThuVienAnhCLuong/index'
import DomeGallery from '../../components/DomeGallery'

const ProductCaiLuong = () => {
  const [showGallery, setShowGallery] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGallery(true)
    }, 1500) // Hiển thị sau 1.5 giây

    return () => clearTimeout(timer)
  }, [])
  return (
    <div className="relative w-full">
      {/* Section 1 với caiLuong03 */}
      <div className="relative m-0 p-0">
        <img
          src={caiLuong03}
          alt="Cải lương background"
          className="w-full h-auto block z-0 m-0 p-0"
        />
        <img
          src={caiLuong04}
          alt="Cải lương overlay"
          className="absolute top-0 left-0 w-full h-auto z-10 m-0 p-0"
        />
      </div>

      {/* Section 2 với caiLuong06 */}
      <div className="relative m-0 p-0">
        <img
          src={caiLuong06}
          alt="Cải lương section 2"
          className="w-full h-auto block z-0 m-0 p-0"
        />
        <img
          src={caiLuong07}
          alt="Cải lương overlay 2"
          className="absolute top-0 left-0 w-full h-auto z-10 m-0 p-0"
        />
        <img
          src={caiLuong08}
          alt="Cải lương overlay 3"
          className="absolute top-0 left-0 w-full h-auto z-20 m-0 p-0"
        />
        <img
          src={caiLuong09}
          alt="Cải lương overlay 4"
          className="absolute top-0 left-0 w-full h-auto z-30 m-0 p-0"
        />
      </div>

      {/* Section 3 với caiLuong10 */}
      <div className="relative m-0 p-0">
        <img
          src={caiLuong10}
          alt="Cải lương section 3"
          className="w-full h-auto block z-0 m-0 p-0"
        />
        <img
          src={caiLuong11}
          alt="Cải lương overlay 5"
          className="absolute top-0 left-0 w-full h-auto z-10 m-0 p-0"
        />
        <img
          src={caiLuong12}
          alt="Cải lương overlay 6"
          className="absolute top-0 left-0 w-full h-auto z-20 m-0 p-0"
        />
      </div>

      {/* Section 4 với caiLuong13 */}
      <div className="relative m-0 p-0">
        <img
          src={caiLuong13}
          alt="Cải lương section 4"
          className="w-full h-auto block z-0 m-0 p-0"
        />
        <img
          src={caiLuong14}
          alt="Cải lương overlay 7"
          className="absolute top-0 left-0 w-full h-auto z-10 m-0 p-0"
        />
        <img
          src={caiLuong15}
          alt="Cải lương overlay 8"
          className="absolute top-0 left-0 w-full h-auto z-20 m-0 p-0"
        />
      </div>

      {/* Section 5 với caiLuong16 */}
      <div className="relative m-0 p-0">
        <img
          src={caiLuong16}
          alt="Cải lương section 5"
          className="w-full h-auto block z-0 m-0 p-0"
        />
        <img
          src={caiLuong17}
          alt="Cải lương overlay 9"
          className="absolute top-0 left-0 w-full h-auto z-10 m-0 p-0"
        />
        <img
          src={caiLuong18}
          alt="Cải lương overlay 10"
          className="absolute top-0 left-0 w-full h-auto z-20 m-0 p-0"
        />
        <img
          src={caiLuong19}
          alt="Cải lương overlay 11"
          className="absolute top-0 left-0 w-full h-auto z-30 m-0 p-0"
        />

        {/* DomeGallery ở cuối section 5 */}
        <div
          className="absolute top-[60%] left-0 z-40 bg-transparent"
          style={{
            width: '100vw',
            height: '100vh',
            backgroundColor: 'transparent',
            background: 'none',
            marginTop: '50px'
          }}
        >
          <h2
            className='text-4xl md:text-5xl font-extrabold text-center tracking-wider'
            style={{
              fontFamily: 'Merriweather, serif',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
              color: '#730109'
            }}
          >
            THƯ VIỆN ẢNH
          </h2>

          {!showGallery && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#730109]"></div>
            </div>
          )}

          {showGallery && (
            <DomeGallery
              images={thuVienAnhCLuongImages}
              overlayBlurColor="rgba(0,0,0,0)"
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductCaiLuong