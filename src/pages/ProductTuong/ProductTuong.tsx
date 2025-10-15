import  { useState, useEffect } from 'react'
import { tuong03, tuong04, tuong06, tuong07, tuong08, tuong09, tuong10, tuong11, tuong12, tuong13, tuong16, tuong17, tuong18, tuong19, tuong20, tuong21, tuong22, tuong23, tuong24, tuong25, tuong26, tuong27, tuong28, tuong29, tuong30, tuong31 } from '../../assets/Giao diện Tuồng/index'
import { thuVienAnhTuongImages } from '../../assets/ThuVienAnhTuong/index'
import DomeGallery from '../../components/DomeGallery'

const ProductTuong = () => {
  const [showGallery, setShowGallery] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGallery(true)
    }, 1500) // Hiển thị sau 1.5 giây

    return () => clearTimeout(timer)
  }, [])
  return (
    <div className="relative w-full">
      {/* Section 1 với tuong03 */}
      <div className="relative m-0 p-0">
        <img
          src={tuong03}
          alt="Tuồng background"
          className="w-full h-auto block z-0 m-0 p-0"
        />
        <img
          src={tuong04}
          alt="Tuồng overlay"
          className="absolute top-0 left-0 w-full h-auto z-10 m-0 p-0"
        />
      </div>

      {/* Section 2 với tuong06 */}
      <div className="relative m-0 p-0">
        <img
          src={tuong06}
          alt="Tuồng section 2"
          className="w-full h-auto block z-0 m-0 p-0"
        />
        <div className="absolute top-0 left-0 w-full h-auto z-10 m-0 p-0">
          <img
            src={tuong07}
            alt="Tuồng overlay 2"
            className="w-full h-auto block m-0 p-0"
          />
          <img
            src={tuong08}
            alt="Tuồng overlay 3"
            className="absolute top-0 left-0 w-full h-auto m-0 p-0"
          />
        </div>
      </div>

      {/* Section 3 với tuong09 */}
      <div className="relative m-0 p-0">
        <img
          src={tuong09}
          alt="Tuồng section 3"
          className="w-full h-auto block z-0 m-0 p-0"
        />
        <div className="absolute top-0 left-0 w-full h-auto z-10 m-0 p-0">
          <img
            src={tuong10}
            alt="Tuồng overlay 5"
            className="w-full h-auto block m-0 p-0"
          />
          <img
            src={tuong11}
            alt="Tuồng overlay 6"
            className="absolute top-0 left-0 w-full h-auto m-0 p-0"
          />
          <img
            src={tuong12}
            alt="Tuồng overlay 7"
            className="absolute top-0 left-0 w-full h-auto m-0 p-0"
          />
        </div>
      </div>

      {/* Section 4 với tuong13 */}
      <div className="relative m-0 p-0">
        <img
          src={tuong13}
          alt="Tuồng section 4"
          className="w-full h-auto block z-0 m-0 p-0"
        />
      </div>

      {/* Section 5 với tuong16 */}
      <div className="relative m-0 p-0">
        <img
          src={tuong16}
          alt="Tuồng section 5"
          className="w-full h-auto block z-0 m-0 p-0"
        />
        <div className="absolute top-0 left-0 w-full h-auto z-10 m-0 p-0">
          <img
            src={tuong17}
            alt="Tuồng overlay 8"
            className="w-full h-auto block m-0 p-0"
          />
          <img
            src={tuong18}
            alt="Tuồng overlay 9"
            className="absolute top-0 left-0 w-full h-auto m-0 p-0"
          />
          <img
            src={tuong19}
            alt="Tuồng overlay 10"
            className="absolute top-0 left-0 w-full h-auto m-0 p-0"
          />
        </div>

    
      </div>

      {/* Section 6 với tuong20 */}
      <div className="relative m-0 p-0">
        <img
          src={tuong20}
          alt="Tuồng section 6"
          className="w-full h-auto block z-0 m-0 p-0"
        />
        <div className="absolute top-0 left-0 w-full h-auto z-10 m-0 p-0">
          <img
            src={tuong21}
            alt="Tuồng overlay 11"
            className="w-full h-auto block m-0 p-0"
          />
          <img
            src={tuong22}
            alt="Tuồng overlay 12"
            className="absolute top-0 left-0 w-full h-auto m-0 p-0"
          />
          <img
            src={tuong23}
            alt="Tuồng overlay 13"
            className="absolute top-0 left-0 w-full h-auto m-0 p-0"
          />
          <img
            src={tuong24}
            alt="Tuồng overlay 14"
            className="absolute top-0 left-0 w-full h-auto m-0 p-0"
          />
          <img
            src={tuong25}
            alt="Tuồng overlay 15"
            className="absolute top-0 left-0 w-full h-auto m-0 p-0"
          />
        </div>
      </div>

      {/* Section 7 với tuong26 */}
      <div className="relative m-0 p-0">
        <img
          src={tuong26}
          alt="Tuồng section 7"
          className="w-full h-auto block z-0 m-0 p-0"
        />
        <div className="absolute top-0 left-0 w-full h-auto z-10 m-0 p-0">
          <img
            src={tuong27}
            alt="Tuồng overlay 16"
            className="w-full h-auto block m-0 p-0"
          />
        </div>
      </div>

      {/* Section 8 với tuong29 */}
      <div className="relative m-0 p-0">
        <img
          src={tuong29}
          alt="Tuồng section 8"
          className="w-full h-auto block z-0 m-0 p-0"
        />
        <div className="absolute top-0 left-0 w-full h-auto z-10 m-0 p-0">
          <img
            src={tuong28}
            alt="Tuồng overlay 17"
            className="w-full h-auto block m-0 p-0"
          />
          <img
            src={tuong30}
            alt="Tuồng overlay 18"
            className="absolute top-0 left-0 w-full h-auto m-0 p-0"
          />
          <img
            src={tuong31}
            alt="Tuồng overlay 19"
            className="absolute top-0 left-0 w-full h-auto m-0 p-0"
          />
        </div>

        {/* DomeGallery ở cuối section 8 */}
        <div
          className="absolute top-[60%] left-0 z-20 bg-transparent"
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
              images={thuVienAnhTuongImages}
              overlayBlurColor="rgba(0,0,0,0)"
            />
          )}
        </div>
      </div>

    </div>
  )
}

export default ProductTuong