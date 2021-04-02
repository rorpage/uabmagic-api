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
          <Image className="h-12 w-12" src={data.images.uabUrl}
            alt={data.attractionAndSong}
            width='200' height='200' />
            <div className="max-w-md mx-auto">
              <div className="relative">
                <div className="text-xl font-bold text-white">
                  {data.attractionAndSong}
                </div>
                <p className="text-white">{data.themeParkAndLand}</p>
                { data.elapsedTimeDisplay !== undefined &&
                  <p className="text-white">{data.elapsedTimeDisplay} of {data.playback.durationDisplay}</p>
                }
              </div>
            </div>
        </div>
      </div>
    </>
  )
}
