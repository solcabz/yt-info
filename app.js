const express = require('express');
const http = require('http');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const ytdl = require('ytdl-core');

const getVideoInfo = require('./components/videoInfoModule');
const GetVideoList = require('./components/getvideolist');

const app = express();
const server = http.createServer(app);

const configFile = './youtubeChannels.json';

app.use(express.static('public'))
// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.get('/', async (req, res) => {
  try {
    console.log(chalk.red('Welcome to the YtChannel Info!'));
    const config = loadConfig();
    const channelUrls = Array.isArray(config.channelUrls) ? config.channelUrls : [config.channelUrls];

    for (const channelUrl of channelUrls) {
      if (linkValidator(channelUrl)) {
        console.log(chalk.green(`Valid channel URL entered: ${channelUrl}`));
        const channelName = channelUrl.replace("https://www.youtube.com/", "");
        const saveLocation = `F:/Downloads/Video/ytDownload/${channelName}`;
        fs.mkdirSync(saveLocation, { recursive: true });

        const videoListPath = path.join(saveLocation, 'video-list.txt');
        const videoList = await GetVideoList(channelUrl, videoListPath);
        const videoInfoList = await Promise.all(videoList.map(videoUrl => getVideoInfo(videoUrl)));

        // Render the HTML page with video information
        res.render('index', { channelName, videoInfoList });
      } else {
        console.log(chalk.red(`Invalid channel URL entered: ${channelUrl}`));
      }
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('Internal Server Error');
  }
});

function loadConfig() {
  try {
    const data = fs.readFileSync(configFile);
    const config = JSON.parse(data);
    console.log('Loaded configuration:', config);
    return config;
  } catch (err) {
    console.error(chalk.red(`Failed to load config file: ${err.message}`));
    process.exit();
  }
}

function linkValidator(value) {
  const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/g;
  return regex.test(value);
}

// Set up the server to listen on a specific port (e.g., 3000)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
