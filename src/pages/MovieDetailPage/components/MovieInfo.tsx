// MovieInfo.tsx

/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from "framer-motion";
import type { Movie } from "../../../types/Movie.type";
import type { GetTheatersResponse } from "../../../types/Theater.type";
import type { Showtime } from "../../../types/Showtime.type";

type Props = {
  movie: Movie;
  selectedInfo: any;
  setSelectedInfo: (val: any) => void;
  theater: GetTheatersResponse | null;
  showtimes: Showtime[];
  isAuthenticated: boolean;
  userId: string | null;
  navigate: (path: string) => void;
  setShowLoginModal: (show: boolean) => void;
};

export default function MovieInfo({
  movie,
  setSelectedInfo,
  theater,
  showtimes,
  isAuthenticated,
  userId,
  navigate,
  setShowLoginModal,
}: Props) {
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.5, ease: "easeOut" },
    }),
  };

  return (
    // Thêm h-full để component chiếm hết chiều cao của thẻ div cha (500px)
    <div className="h-full text-black">
      <motion.div
        // THAY ĐỔI Ở ĐÂY: Thêm các class flexbox
        className="md:col-span-2 flex flex-col justify-between h-full"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.05 } },
        }}
      >
        {/* Nhóm 1: Các phần tử ở trên cùng */}
        <div>
          <motion.h1
            variants={fadeUp}
            custom={0}
            // UPDATE: Thêm responsive cho tiêu đề phim
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2"
            style={{ fontFamily: "Black Stuff Bold" }}
          >
            {movie.title}
          </motion.h1>

          {showtimes.length > 0 && (
            <>
              <motion.p
                variants={fadeUp}
                custom={1}
                // UPDATE: Thêm responsive cho thông tin suất chiếu
                className="mb-1 flex items-center gap-2 text-base md:text-lg"
                style={{ fontFamily: "Black Stuff Bold" }}
              >
                <svg
                  width="24px"
                  height="30px"
                  viewBox="0 0 24 24"
                  fill="#730109"
                  xmlns="http://www.w3.org/2000/svg"
                  enable-background="new 0 0 24 24"
                >
                  <path d="M2,19c0,1.7,1.3,3,3,3h14c1.7,0,3-1.3,3-3v-8H2V19z M19,4h-2V3c0-0.6-0.4-1-1-1s-1,0.4-1,1v1H9V3c0-0.6-0.4-1-1-1S7,2.4,7,3v1H5C3.3,4,2,5.3,2,7v2h20V7C22,5.3,20.7,4,19,4z" />
                </svg>
                {(() => {
                  const startDate = new Date(showtimes[0].start_time);
                  const endDate = new Date(showtimes[0].end_time);
                  const startHour = startDate.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const endHour = endDate.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const day = startDate.getDate();
                  const month = startDate.getMonth() + 1;
                  const year = startDate.getFullYear();
                  return `${startHour} - ${endHour}, ${day} tháng ${month}, ${year}`;
                })()}
              </motion.p>
              <motion.p
                variants={fadeUp}
                custom={2}
                // UPDATE: Thêm responsive cho thông tin rạp
                className="mb-1 flex items-center gap-2 text-base md:text-lg"
                style={{ fontFamily: "Black Stuff Bold" }}
              >
                <svg
                  width="24px"
                  height="24px"
                  viewBox="0 0 8.4666669 8.4666669"
                  fill="#730109"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g transform="translate(0,-288.53332)">
                    <path
                      d="m 15.996094,0.99609375 c -6.0632836,0 -10.9980445,4.93673065 -10.9980471,11.00000025 -3.8e-6,10.668737 10.3789061,18.779297 10.3789061,18.779297 0.364612,0.290384 0.881482,0.290384 1.246094,0 0,0 10.380882,-8.11056 10.380859,-18.779297 C 27.003893,5.9328244 22.059377,0.99609375 15.996094,0.99609375 Z m 0,6.00195315 c 2.749573,0 5.00585,2.2484784 5.005859,4.9980471 C 21.001971,14.7457 18.745685,17 15.996094,17 c -2.749591,0 -4.998064,-2.2543 -4.998047,-5.003906 9e-6,-2.7495687 2.248474,-4.9980471 4.998047,-4.9980471 z"
                      transform="matrix(0.26458333,0,0,0.26458333,0,288.53332)"
                    />
                  </g>
                </svg>
                {theater?.result?.theaters?.[0]?.name}
              </motion.p>
            </>
          )}
        </div>

        {/* Nhóm 2: Các phần tử ở dưới cùng */}
        <div>
          {showtimes.length > 0 && (
            <>
              {/* Đường line ngang */}
              <div className="border-t border-gray-300 mb-3"></div>
              
              <motion.p
                variants={fadeUp}
                custom={3}
                // UPDATE: Thêm responsive cho giá vé
                className="mb-1 text-2xl md:text-3xl font-bold"
                style={{ fontFamily: "Black Stuff Bold" }}
              >
                Giá từ:{" "}
                <span style={{ color: "#9e1b1b" }}>
                  {showtimes[0].price?.regular?.toLocaleString("vi-VN")} VNĐ
                </span>
              </motion.p>

              <motion.button
                onClick={() => {
                  if (showtimes.length > 0) {
                    setSelectedInfo((prev: any) => ({
                      ...prev,
                      showtimeId: showtimes[0]._id,
                      screenId: showtimes[0].screen_id,
                    }));
                    if (isAuthenticated || userId) {
                      navigate(`/movies/${movie._id}/${showtimes[0].screen_id}`);
                    } else {
                      setShowLoginModal(true);
                    }
                  }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                variants={fadeUp}
                custom={4}
                // UPDATE: Thêm responsive cho button (padding, text size)
                className="mt-4 w-full py-2 md:py-3 bg-[#730109] text-white 
                           text-base md:text-lg font-semibold rounded-lg hover:bg-[#5a0708] 
                           transition-all flex items-center justify-center gap-2"
              >
                {isAuthenticated || userId ? "Mua Vé Ngay" : "Log in to booking"}
              </motion.button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}