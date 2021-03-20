import Image from "next/image";

export default function Song({ data }) {
  return (
    <>
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center">
        <div className="flex-shrink-0 text-center">
          <Image className="bg-image" src={data.images.uabUrl} alt={data.attractionAndSong} layout="fill" />
          <div className="max-w-md mx-auto">
            <div className="relative">
              <div className="image_holder">
                <div className="bg_image_container">
                  <Image className="h-12 w-12" src={data.images.uabUrl}
                    alt={data.attractionAndSong}
                    width='500' height='500' />
                </div>
                <div id="overlay"></div>
                <div className="song-text">
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
        </div>
      </div>
    </>
  )
}
