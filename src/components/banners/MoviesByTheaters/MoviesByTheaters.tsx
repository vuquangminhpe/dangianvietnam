import { GoLocation } from "react-icons/go";
import { FaLocationCrosshairs } from "react-icons/fa6";
import { useQuery } from "@tanstack/react-query";
import { getPopularMovies } from "../../../apis/movie.api";
import { MovieCard } from "../../movies";

const LogoIcons = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <img
        src="https://vignette.wikia.nocookie.net/logopedia/images/9/9f/Cgv_logo.png/revision/latest?cb=20180828170655"
        alt=""
        className="h-10 w-10 px-2 py-2 border border-gray-500 rounded-md"
      />
      <p className="text-xs">Beta Cinema</p>
    </div>
  );
};

const MoviesByTheaters = () => {
  const array = [1, 2, 3, 4, 5, 6, 7];

  const { data: moviesShowing } = useQuery({
    queryKey: ["moviesShowing"],
    queryFn: () => getPopularMovies(10, 1),
  });

  return (
    <div className="w-full h-screen flex flex-col bg-white/10 backdrop-blur-lg mt-5 rounded-3xl shadow-xl border border-white/20 text-gray-300">
      <div className="flex flex-col gap-3 items-start border-b border-gray-600 w-full">
        <div className="flex p-3 gap-2 items-center">
          <p>Vị trí</p>
          <select
            name=""
            id=""
            className="pl-1 pr-20 py-2 rounded-lg bg-white/10 hover:bg-white/30 transition-colors duration-300"
          >
            <option value="">
              <div>
                <GoLocation />
                <p>Hà Nội</p>
              </div>
            </option>
          </select>

          <div className="flex items-center gap-2 bg-white/10 pl-1 py-2 rounded-lg pr-10 cursor-pointer hover:bg-white/30 transition-colors duration-300">
            {/* px-3 py-1 rounded-lg text-sm transition-colors bg-white/10 text-gray-300 hover:bg-white/20 */}
            <FaLocationCrosshairs />
            <p>Gan ban</p>
          </div>
        </div>

        <div className="flex gap-2">
          {array.map(() => (
            <LogoIcons />
          ))}
        </div>
      </div>

      <div className="">
        <div>
          {/* Location of the selecting theater */}
          <div className="border-b border-gray-500 pb-3">
            <div className="flex gap-2 p-3 bg-gray-300 w-full items-center">
              <img
                className="w-10 h-10 px-2 py-2 border border-gray-500 bg-white"
                src="https://vignette.wikia.nocookie.net/logopedia/images/9/9f/Cgv_logo.png/revision/latest?cb=20180828170655"
                alt=""
              />
              <div className="flex flex-col justify-start items-start text-black">
                <h1 className="text-lg">
                  Lịch chiếu Buổi biểu diễn Beta Đan Phượng
                </h1>
                <div className="flex items-center gap-3 ">
                  <p className="text-sm text-gray-600">
                    Tầng 2 Tòa nhà HHA, Khu Đô Thị XPHomes (Tân Tây Đô), Xã Tân
                    Lập, Huyện Đan Phượng, TP Hà Nội
                  </p>
                  <a href="#" className="text-blue-500 hover:underline">
                    [Ban do]
                  </a>
                </div>
              </div>
            </div>

            {/* Select show time */}
            <div className="flex gap-3 items-center justify-start w-full mt-2 ml-4">
              {array.map(() => (
                <div className="flex flex-col items-center w-14 h-14 bg-red-400 rounded-sm">
                  <h1>18</h1>
                  <p className="text-sm mt-3">Hom nay</p>
                </div>
              ))}
            </div>
          </div>

          {/* Movies show */}
          <div className="w-full border-b border-gray-500 pb-3 h-[400px] overflow-y-scroll">
            <div className="w-36 flex flex-col gap-3 h-fit">
              {moviesShowing?.map((item) => (
                <MovieCard movie={item} key={item._id} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoviesByTheaters;
