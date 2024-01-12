const express = require('express');
const ytdl = require('ytdl-core');

const app = express();

app.use(express.static('public'))

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

    // Format uploadDate to MM:DD:YY
    const uploadDate = new Date(info.videoDetails.uploadDate);
    const formattedUploadDate = `${uploadDate.getMonth() + 1}/${uploadDate.getDate()}/${uploadDate.getFullYear()}`;

    const views = info.videoDetails.viewCount;

    //Format time to seconds to minute
    const durationSeconds = parseInt(info.videoDetails.lengthSeconds);
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;
    const duration = `${minutes}:${seconds}`;

    const likes = info.videoDetails && info.videoDetails.likes ? parseInt(info.videoDetails.likes) : 0;
    
    //Extracting data to the api
    const videoInfo = {
      title,
      uploadDate: formattedUploadDate,
      views,
      duration,
      likes
    };

    res.json(videoInfo);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch video information.' });
  }
});

//port server
const PORT = process.env.PORT || 2000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



// const express = require('express');
// const http = require('http');
// const chalk = require('chalk');
// const fs = require('fs');
// const path = require('path');
// const ytdl = require('ytdl-core');

// const GetVideoList = require('./components/getvideolist');

// const app = express();

// const configFile = './config.json'; // Path to the JSON config file

// function linkValidator(value) {
//   const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/g;
//   return regex.test(value);
// }

// async function startDownloadProcess() {
//   try {
//     console.log(chalk.red('Welcome to the YtChannel Downloader!'));
//     const config = loadConfig();
//     const channelUrls = Array.isArray(config.channelUrls) ? config.channelUrls : [config.channelUrls];

//     for (const channelUrl of channelUrls) {
//       if (linkValidator(channelUrl)) {
//         console.log(chalk.green(`Valid channel URL entered: ${channelUrl}`));

//         // Remove "https://www.youtube.com/" from channelUrl
//         const channelName = channelUrl.replace("https://www.youtube.com/", "");

//         const saveLocation = `F:/Downloads/Video/ytDownload/${channelName}`; // Use the channel name in the save location
//         fs.mkdirSync(saveLocation, { recursive: true }); // Fix: Create entire directory path if it doesn't exist

//         const videoListPath = path.join(saveLocation, 'video-list.txt');
//         // Rest of the code remains unchanged...
//       } else {
//         console.log(chalk.red(`Invalid channel URL entered: ${channelUrl}`));
//       }
//     }
//   } catch (error) {
//     console.error('Error retrieving VODs:', error);
//   }
// }

// async function displayVideoInfo(videoList) {
//   for (const videoUrl of videoList) {
//     try {
//       const videoInfo = await ytdl.getInfo(videoUrl);
//       console.log(`Video Title: ${videoInfo.videoDetails.title}`);
//       console.log(`Video URL: ${videoInfo.videoDetails.video_url}`);
//       console.log(`Author: ${videoInfo.videoDetails.author.name}`);
//       console.log(`Views: ${videoInfo.videoDetails.viewCount}`);
//       console.log(`Published Date: ${videoInfo.videoDetails.publishDate}`);
//       console.log('\n');
//     } catch (error) {
//       console.error('Error fetching video info:', error);
//     }
//   }
// }

// function loadConfig() {
//   try {
//     const data = fs.readFileSync(configFile);
//     const config = JSON.parse(data);
//     console.log('Loaded configuration:', config); // Debug statement
//     return config;
//   } catch (err) {
//     console.error(chalk.red(`Failed to load config file: ${err.message}`));
//     process.exit();
//   }
// }
