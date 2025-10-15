import { useState, useEffect } from 'react'
import { cheo03, cheo04, cheo05, cheo06, cheo07, cheo08, cheo09, cheo10, cheo11, cheo12, cheo13, cheo14, cheo15, cheo16, cheo17, cheo18, cheo19, cheo20, cheo21, cheo22 } from '../../assets/Giao diện chèo/index'
import { thuVienAnhCheoImages } from '../../assets/ThuVienAnhCheo/index'
import DomeGallery from '../../components/DomeGallery'

const ProductCheo = () => {
  const [showGallery, setShowGallery] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGallery(true)
    }, 1500) // Hiển thị sau 1.5 giây

    return () => clearTimeout(timer)
  }, [])
  return (
    <div className="relative w-full">
      {/* Section 1 với cheo03 */}
      <div className="relative m-0 p-0">
        <img
          src={cheo03}
          alt="Chèo background"
          className="w-full h-auto block z-0 m-0 p-0"
        />
        <img
          src={cheo04}
          alt="Chèo overlay"
          className="absolute top-0 left-0 w-full h-auto z-10 m-0 p-0"
        />
      </div>

      {/* Section 2 với cheo05 */}
      <div className="relative m-0 p-0">
        <img
          src={cheo05}
          alt="Chèo section 2"
          className="w-full h-auto block z-0 m-0 p-0"
        />
        <img
          src={cheo06}
          alt="Chèo overlay 2"
          className="absolute top-0 left-0 w-full h-auto z-10 m-0 p-0"
        />
        <img
          src={cheo07}
          alt="Chèo overlay 3"
          className="absolute top-0 left-0 w-full h-auto z-20 m-0 p-0"
        />
      </div>

      {/* Section 3 với cheo08 */}
      <div className="relative m-0 p-0">
        <img
          src={cheo08}
          alt="Chèo section 3"
          className="w-full h-auto block z-0 m-0 p-0"
        />
        <img
          src={cheo09}
          alt="Chèo overlay 4"
          className="absolute top-0 left-0 w-full h-auto z-10 m-0 p-0"
        />
        <img
          src={cheo10}
          alt="Chèo overlay 5"
          className="absolute top-0 left-0 w-full h-auto z-20 m-0 p-0"
        />
      </div>

      {/* Section 4 với cheo11 */}
      <div className="relative m-0 p-0">
        <img
          src={cheo11}
          alt="Chèo section 4"
          className="w-full h-auto block z-0 m-0 p-0"
        />
        <img
          src={cheo12}
          alt="Chèo overlay 6"
          className="absolute top-0 left-0 w-full h-auto z-10 m-0 p-0"
        />
        <img
          src={cheo13}
          alt="Chèo overlay 7"
          className="absolute top-0 left-0 w-full h-auto z-20 m-0 p-0"
        />
        <img
          src={cheo14}
          alt="Chèo overlay 8"
          className="absolute top-0 left-0 w-full h-auto z-30 m-0 p-0"
        />
        <img
          src={cheo15}
          alt="Chèo overlay 9"
          className="absolute top-0 left-0 w-full h-auto z-40 m-0 p-0"
        />
        <img
          src={cheo16}
          alt="Chèo overlay 10"
          className="absolute top-0 left-0 w-full h-auto z-50 m-0 p-0"
        />
      </div>

      {/* Section 5 với cheo17 */}
      <div className="relative m-0 p-0">
        <img
          src={cheo17}
          alt="Chèo section 5"
          className="w-full h-auto block z-0 m-0 p-0"
        />
        <img
          src={cheo18}
          alt="Chèo overlay 11"
          className="absolute top-0 left-0 w-full h-auto z-10 m-0 p-0"
        />
        <img
          src={cheo19}
          alt="Chèo overlay 12"
          className="absolute top-0 left-0 w-full h-auto z-20 m-0 p-0"
        />
        <img
          src={cheo20}
          alt="Chèo overlay 13"
          className="absolute top-0 left-0 w-full h-auto z-30 m-0 p-0"
        />
        <img
          src={cheo21}
          alt="Chèo overlay 14"
          className="absolute top-0 left-0 w-full h-auto z-40 m-0 p-0 opacity-70"
        />
        <img
          src={cheo22}
          alt="Chèo overlay 15"
          className="absolute top-0 left-0 w-full h-auto z-50 m-0 p-0"
        />

        {/* DomeGallery ở nửa cuối section 5 */}
        <div
          className="absolute top-[60%] left-0 z-[60] bg-transparent"
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
              images={thuVienAnhCheoImages}
              overlayBlurColor="rgba(0,0,0,0)"
            />
          )}
        </div>
      </div>

    </div>
  )
}

export default ProductCheo