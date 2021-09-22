import Image from "next/image";

export default function Song({ data }) {
  return (
    <>
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center">
        <div className="flex-shrink-0 text-center mx-4">
          <Image className="bg-image" src={data.images.uabUrl}
            alt={data.attractionAndSong}
            layout="fill" objectFit="cover" />
          <div id="overlay"></div>
          <div className="max-w-md mx-auto text-white">
            <div className="relative">
              { data.schedule !== undefined &&
                <div className="text-white m-2 font-light">{data.schedule}</div>
              }
              <Image className="h-12 w-12" src={data.images.uabUrl}
                alt={data.attractionAndSong}
                width='200' height='200' />
              <p className="gray uppercase font-light">{data.themeParkAndLand}</p>
              <div className="text-2xl font-semibold">
                {data.attractionAndSong}
              </div>
              { data.requestor !== '' &&
                <div className="text-white m-2">Requested by {data.requestor}</div>
              }
              { data.elapsedTimeDisplay !== undefined &&
                <p className="time-display">{data.elapsedTimeDisplay} of {data.playback.durationDisplay}</p>
              }
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
