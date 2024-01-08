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
    console.log('Video Info:', info); // Log the entire 'info' object to the console

    const title = info.videoDetails.title;
    const uploadDate = info.videoDetails.uploadDate;
    const views = info.videoDetails.viewCount;
    const duration = parseInt(info.videoDetails.lengthSeconds) / 60;
    
    // Fetching likes and dislikes with default values of 0
    const likes = info.videoDetails && info.videoDetails.likes ;
    const dislikes = info.videoDetails && info.videoDetails.dislikes ? parseInt(info.videoDetails.dislikes) : 0;
    
    const separateVideoCounter = info.videoDetails.isLiveContent ? 'Live Stream' : 'Single Video';

    const videoInfo = {
      title,
      uploadDate,
      views,
      duration: duration.toFixed(2),
      likes,
      dislikes, // Adding dislikes to the videoInfo object
      separateVideoCounter,
    };

    res.json(videoInfo);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch video information.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
