import React from 'react'
import Song from './song'

class NowPlaying extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      timeLeft: 30000,
      song: { playback: {}, imageUrl: '' },
    };
  }

  async componentDidMount() {
    const res = await fetch(`/api/songs/nowplaying`);
    const data = await res.json();
    data.nextUpdateIn = data.playback.timeLeft * 1000 + 3000;

    this.setState({
      song: data,
      timeLeft: data.playback.timeLeft * 1000,
    });

    var that = this;

    setTimeout(function() {
      that.updateNextSong();
    }, data.nextUpdateIn);

    setInterval(function() {
      that.updateTimeLeft();
    }, 1000);
  }

  async updateTimeLeft() {
    const currentTimeLeft =
      this.state.timeLeft < 0 || this.state.timeLeft - 1000 < 0
        ? 0
        : this.state.timeLeft - 1000;

    this.setState({timeLeft: currentTimeLeft});
  }

  async updateNextSong() {
    const res = await fetch(`/api/songs/nowplaying`);
    const data = await res.json();
    data.nextUpdateIn = data.playback.timeLeft * 1000 + 3000;

    this.setState({
      song: data,
      timeLeft: data.playback.timeLeft * 1000,
    });

    var that = this;

    setTimeout(function() {
      that.updateNextSong();
    }, data.nextUpdateIn);
  }

  render() {
    const elapsedTime = (this.state.song.playback.duration || 0) - this.state.timeLeft / 1000;
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    const elapsedTimeDisplay = `${minutes}:${seconds
      .toString()
      .padStart(2, '0')}`;

    this.state.song.elapsedTimeDisplay = elapsedTimeDisplay;

    const data = this.state.song;
    data.elapsedTimeDisplay = elapsedTimeDisplay;

    if (this.state.song.images) {
      return <Song data={data} />
    } else {
      return <div>Loading...</div>
    }
  }
}

export default NowPlaying
