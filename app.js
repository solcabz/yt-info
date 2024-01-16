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

const configFile = './youtubeChannelsList.json';

app.use(express.static('public'))
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', async (req, res) => {
  try {
    console.log(chalk.red('Welcome to the YtChannel Info!'));
    const config = loadConfig();
    const channelUrls = Array.isArray(config.channelUrls) ? config.channelUrls : [config.channelUrls];

    let selectedChannelUrl = req.query.channelUrl || channelUrls[0];

    if (linkValidator(selectedChannelUrl)) {
      console.log(chalk.green(`Selected channel URL: ${selectedChannelUrl}`));
      const channelName = selectedChannelUrl.replace("https://www.youtube.com/", "");
      const saveLocation = `F:/Downloads/Video/ytDownload/${channelName}`;
      fs.mkdirSync(saveLocation, { recursive: true });

      const videoListPath = path.join(saveLocation, 'video-list.txt');
      const videoList = await GetVideoList(selectedChannelUrl, videoListPath);
      const videoInfoList = await Promise.all(videoList.map(videoUrl => getVideoInfo(videoUrl)));

      // Render the HTML page with video information
      res.render('index', { channelName, videoInfoList, config });
    } else {
      console.log(chalk.red(`Invalid channel URL entered: ${selectedChannelUrl}`));
      res.status(400).send('Bad Request');
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
