import { motion } from 'framer-motion';
import { images } from './assets';
import DomeGallery from '../../components/DomeGallery';

const ProductPage = () => {
  // Animation variants cho hiệu ứng nhẹ
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
    viewport: { once: true, margin: "-100px" }
  };

  const fadeIn = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    transition: { duration: 0.8, ease: "easeInOut" },
    viewport: { once: true, margin: "-50px" }
  };

  const slideInLeft = {
    initial: { opacity: 0, x: -30 },
    whileInView: { opacity: 1, x: 0 },
    transition: { duration: 0.7, ease: "easeOut" },
    viewport: { once: true, margin: "-80px" }
  };

  const slideInRight = {
    initial: { opacity: 0, x: 30 },
    whileInView: { opacity: 1, x: 0 },
    transition: { duration: 0.7, ease: "easeOut" },
    viewport: { once: true, margin: "-80px" }
  };

  const scaleIn = {
    initial: { opacity: 0, scale: 0.95 },
    whileInView: { opacity: 1, scale: 1 },
    transition: { duration: 0.6, ease: "easeOut" },
    viewport: { once: true, margin: "-60px" }
  };

  return (
    <div className="relative w-full">
      {/* Hero Section với bg02 */}
      <motion.div className="relative" {...fadeIn}>
        <img 
          src={images.backgrounds.bg02} 
          alt="background" 
          className="w-full h-auto block z-0" 
        />
        <motion.img 
          src={images.text.gioi_thieu} 
          alt="múa rối nước 07" 
          className="absolute top-0 left-0 w-full h-auto z-10"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
        />
      </motion.div>

      {/* Section 2 với bg03 */}
      <div className="relative" {...fadeInUp}>
        <img 
          src={images.backgrounds.bg03} 
          alt="background" 
          className="w-full h-auto block z-0" 
        />
        <motion.img 
          src={images.text.lich_su} 
          alt="múa rối nước 12" 
          className="absolute top-0 left-0 w-full h-auto z-10"
          {...slideInLeft}
          transition={{ ...slideInLeft.transition, delay: 0.2 }}
        />
        <motion.img 
          src={images.content.img08} 
          alt="múa rối nước 08" 
          className="absolute top-0 left-[6px] w-full h-auto z-20"
          {...slideInRight}
          transition={{ ...slideInRight.transition, delay: 0.4 }}
        />
      </div>

      {/* Section 3 với bg04 */}
      <motion.div className="relative" {...scaleIn}>
        <img 
          src={images.backgrounds.bg04} 
          alt="background" 
          className="w-full h-auto block z-0" 
        />
        <motion.img 
          src={images.content.img09} 
          alt="múa rối nước 09" 
          className="absolute top-[10px] left-0 w-full h-auto z-10"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          viewport={{ once: true, margin: "-70px" }}
        />
        <motion.img 
          src={images.content.img17} 
          alt="múa rối nước 17" 
          className="absolute top-[10px] left-0 w-full h-auto z-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          viewport={{ once: true, margin: "-70px" }}
        />
        <motion.img 
          src={images.text.dac_trung} 
          alt="múa rối nước 13" 
          className="absolute top-0 left-0 w-full h-auto z-30"
          {...fadeIn}
          transition={{ ...fadeIn.transition, delay: 0.5 }}
        />
      </motion.div>

      {/* Section 4 với bg05 */}
      <motion.div className="relative" {...fadeInUp}>
        <img 
          src={images.backgrounds.bg05} 
          alt="background" 
          className="w-full h-auto block z-0" 
        />
        <motion.img 
          src={images.content.img10} 
          alt="múa rối nước 10" 
          className="absolute top-0 left-0 w-full h-auto z-10"
          {...slideInLeft}
          transition={{ ...slideInLeft.transition, delay: 0.1 }}
        />
        <motion.img 
          src={images.content.img18} 
          alt="múa rối nước 18" 
          className="absolute top-0 left-0 w-full h-auto z-20"
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          viewport={{ once: true, margin: "-60px" }}
        />
         <motion.img 
          src={images.content.img20} 
          alt="múa rối nước 20" 
          className="absolute top-0 left-0 w-full h-auto z-20"
          {...slideInRight}
          transition={{ ...slideInRight.transition, delay: 0.5 }}
        />
        <motion.img 
          src={images.text.mot_so_phuong} 
          alt="múa rối nước 14" 
          className="absolute top-0 left-0 w-full h-auto z-30"
          {...fadeIn}
          transition={{ ...fadeIn.transition, delay: 0.7 }}
        />
      </motion.div>

      {/* Section 5 với bg06 */}
      <motion.div className="relative" {...scaleIn}>
        <img 
          src={images.backgrounds.bg06} 
          alt="background" 
          className="w-full h-auto block z-0" 
        />
         <motion.img 
          src={images.text.mua_roi_nuoc_title} 
          alt="múa rối nước 19" 
          className="absolute top-0 left-0 w-full h-auto z-30"
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          viewport={{ once: true, margin: "-50px" }}
        />
      
        {/* DomeGallery ở dưới cùng bg06 */}
        <div 
          className="absolute bottom-2.5 left-0 z-40 bg-transparent mt-5"
          style={{ 
            width: '100vw', 
            height: '100vh',
            backgroundColor: 'transparent',
            background: 'none'
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

          <DomeGallery 
            overlayBlurColor="rgba(0,0,0,0)"
          />
        </div>
      </motion.div>

    </div>
  );
};

export default ProductPage;
