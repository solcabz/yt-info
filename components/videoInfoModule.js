// videoInfoModule.js

const ytdl = require('ytdl-core');

async function getVideoInfo(videoUrl) {
  try {
    const info = await ytdl.getInfo(videoUrl);

    const title = info.videoDetails.title;
    const uploadDate = new Date(info.videoDetails.uploadDate);
    const formattedUploadDate = `${uploadDate.getMonth() + 1}/${uploadDate.getDate()}/${uploadDate.getFullYear()}`;
    const views = info.videoDetails.viewCount;
    const durationSeconds = parseInt(info.videoDetails.lengthSeconds);
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;
    const duration = `${minutes}:${seconds}`;
    const likes = info.videoDetails && info.videoDetails.likes ? parseInt(info.videoDetails.likes) : 0;
    const description = info.videoDetails.description || '';

    const videoInfo = {
      title,
      uploadDate: formattedUploadDate,
      views,
      duration,
      likes,
      description,
    };

    return videoInfo;
  } catch (error) {
    throw new Error('Could not fetch video information.');
  }
}

module.exports = getVideoInfo;