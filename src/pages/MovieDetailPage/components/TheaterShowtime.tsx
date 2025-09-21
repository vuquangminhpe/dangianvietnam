/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Showtime } from "../../../types/Showtime.type";
import type { GetTheatersResponse } from "../../../types/Theater.type";

type Props = {
  selectedInfo: any;
  setSelectedInfo: (val: any) => void;
  theater: GetTheatersResponse | null;
  showtimes: Showtime[];
  fetchShowtimesByTheater: (id: string) => void;
  isLoadingTheaters: boolean;
  isLoadingShowtimes: boolean;
};

export default function TheaterShowtime({
  selectedInfo,
  setSelectedInfo,
  theater,
  showtimes,
  fetchShowtimesByTheater,
  isLoadingTheaters,
  isLoadingShowtimes,
}: Props) {
  // Lọc ra các rạp có lịch chiếu (theater đã được filter từ API)
  const availableTheaters = theater?.result?.theaters || [];

  // Component loading spinner
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      <span className="ml-2 text-gray-400">Loading...</span>
    </div>
  );

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Theater</h2>
      <div className="mb-4">
        {isLoadingTheaters ? (
          <LoadingSpinner />
        ) : availableTheaters.length ? (
          <select
            className="bg-[#2A2A2A] text-gray-300 px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary transition"
            value={selectedInfo.theaterId || ""}
            onChange={(e) => {
              const selectedId = e.target.value;
              setSelectedInfo((prev: any) => ({
                ...prev,
                theaterId: selectedId,
                showtimeId: null,
                screenId: null,
              }));
              if (selectedId) {
                fetchShowtimesByTheater(selectedId);
              }
            }}
          >
            <option value="">-- Select theater --</option>
            {availableTheaters.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name} - {t.location}
              </option>
            ))}
          </select>
        ) : (
          <div className="text-gray-400">
            No theater has a schedule for this movie yet..
          </div>
        )}
      </div>

      <h2 className="text-2xl font-bold mb-4">Show times</h2>
      <div className="mb-4">
        {isLoadingShowtimes ? (
          <LoadingSpinner />
        ) : showtimes.length ? (
          <div className="flex flex-wrap gap-2">
            {showtimes.map((showtime) => {
              console.log(showtime);

              const isSelected = selectedInfo.showtimeId === showtime._id;
              const isClosed = showtime.status !== "booking_open";
              const startDate = new Date(showtime.start_time);
              const endDate = new Date(showtime.end_time);

              const startTime = startDate.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              });
              const endTime = endDate.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              });

              const screenName = showtime.screen?.name || "Screen";
              const timeRange = `${startTime} - ${endTime}`;
              const dateInfo = `${startDate.toLocaleDateString("vi-VN", {
                weekday: "short",
              })}, ${startDate.toLocaleDateString("vi-VN")}`;

              return (
                <button
                  key={showtime._id}
                  onClick={() => {
                    if (!isClosed) {
                      setSelectedInfo((prev: any) => ({
                        ...prev,
                        showtimeId: showtime._id,
                        screenId: showtime.screen_id,
                      }));
                    }
                  }}
                  disabled={isClosed}
                  className={`px-3 py-2 rounded text-sm font-medium transition min-w-[140px] relative ${
                    isClosed
                      ? "border border-red-500 text-gray-500 cursor-not-allowed opacity-60"
                      : isSelected
                      ? "bg-primary text-white"
                      : "border border-primary text-white hover:bg-[#1E1E1E]"
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`font-semibold text-xs ${
                        isClosed ? "text-red-400" : "text-primary-light"
                      }`}
                    >
                      {screenName}
                    </div>
                    <div className="text-xs opacity-75">{dateInfo}</div>
                    <div className="font-bold">{timeRange}</div>
                    {isClosed && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded">
                        <span className="text-red-400 font-bold text-xs border border-red-500 px-2 py-1 rounded">
                          CLOSED
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : selectedInfo.theaterId ? (
          <div className="text-gray-400">
            There are no showtimes for this theater yet..
          </div>
        ) : (
          <div className="text-gray-400">
            Please select a theater to view the showtimes..
          </div>
        )}
      </div>
    </>
  );
}
