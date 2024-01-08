const express = require('express');
const ytdl = require('ytdl-core');

const app = express();

app.get('/', async (req, res) => {
  res.sendFile('index.html', { root: './' });
});

app.get('/videoInfo', async (req, res) => {
  const { videoUrl } = req.query;

  if (!videoUrl) {
    return res.status(400).json({ error: 'Please provide a video URL.' });
  }

  try {
    const info = await ytdl.getInfo(videoUrl);

    const title = info.videoDetails.title;

    // Format uploadDate to MM:DD:YY
    const uploadDate = new Date(info.videoDetails.uploadDate);
    const formattedUploadDate = `${uploadDate.getMonth() + 1}/${uploadDate.getDate()}/${uploadDate.getFullYear()}`;

    const views = info.videoDetails.viewCount;

    const durationSeconds = parseInt(info.videoDetails.lengthSeconds);
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;
    const duration = `${minutes}:${seconds}`;

    const likes = info.videoDetails && info.videoDetails.likes;
    const dislikes = info.videoDetails && info.videoDetails.dislikes ? parseInt(info.videoDetails.dislikes) : 0;

    const separateVideoCounter = info.videoDetails.isLiveContent ? 'Live Stream' : 'Single Video';

    const videoInfo = {
      title,
      uploadDate: formattedUploadDate,
      views,
      duration,
      likes,
      dislikes,
      separateVideoCounter,
    };

    res.json(videoInfo);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch video information.' });
  }
});


const PORT = process.env.PORT || 2000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
