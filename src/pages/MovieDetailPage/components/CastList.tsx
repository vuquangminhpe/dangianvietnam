import type { Movie } from "../../../types/Movie.type";

export default function CastList({ movie }: { movie: Movie }) {
  return (
    <div className="mb-10">
      <p className="text-2xl font-bold mb-6 text-white bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
        Cast
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {movie.cast.map((actor) => (
          <div
            key={actor.id}
            className="flex flex-col items-center p-4 rounded-2xl bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-105 border border-gray-700 hover:border-orange-400/50"
          >
            <div className="relative mb-4">
              <img
                src={actor.profile_image || "/default-avatar.png"}
                alt={actor.name}
                className="w-28 h-28 object-cover rounded-full border-3 border-gradient-to-r from-orange-400 to-red-500 shadow-lg hover:shadow-orange-400/30 transition-all duration-300"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange-400/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="text-white font-semibold text-base text-center mb-1 leading-tight">
              {actor.name}
            </div>
            <div className="text-gray-400 text-sm italic text-center leading-tight">
              {actor.character}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
