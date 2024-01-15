const puppeteer = require('puppeteer-core');
const chalk = require('chalk');

async function GetVideoList(channelUrl, saveLocation) {
    try {
        const browser = await puppeteer.launch({
            executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        console.log(chalk.cyan('Getting video list...'));

        const page = await browser.newPage();
        await page.goto(channelUrl);
        await page.waitForSelector('#items');

        const scrollInterval = 5000; // Scroll every 5 seconds
        const scrollTimeout = 2000; // Wait 2 seconds after each scroll
        const maxScrollAttempts = 5; // Adjust the number of scrolls as needed

        for (let i = 0; i < maxScrollAttempts; i++) {
            await page.evaluate(() => {
                const lastHeight = document.querySelector('.ytd-page-manager').scrollHeight;
                window.scrollTo(0, lastHeight);

                // Check if new content has been loaded
                const newHeight = document.querySelector('.ytd-page-manager').scrollHeight;
                return newHeight !== lastHeight;
            });

            await page.waitForTimeout(scrollTimeout);
        }

        const videoList = await page.evaluate(() => {
            const videos = [];
            const anchors = document.querySelectorAll('a');
            anchors.forEach(anchor => {
                if (anchor.href.includes('/watch') || anchor.href.includes('/shorts')) {
                    videos.push(anchor.href);
                }
            });
            return videos;
        }).catch(err => {
            console.log(err);
        });

        await browser.close();

        const uniqueVideoList = videoList.filter((item, index) => videoList.indexOf(item) === index);
        console.log(chalk.blue(`Found ${uniqueVideoList.length} videos.`));

        const fs = require('fs');
        fs.writeFileSync(saveLocation, uniqueVideoList.join('\n'));

        return uniqueVideoList;
    } catch (error) {
        console.error('Error getting video list:', error);
        return [];
    }
}

module.exports = GetVideoList;

// const { google } = require('googleapis');

// const API_KEY = 'AIzaSyDXeeJqav6yWkZyTCYsjHzyjpHuuBzPmSg'; // Replace with your API key
// const youtube = google.youtube({ version: 'v3', auth: API_KEY });

// async function searchChannel(query) {
//   try {
//     const response = await youtube.search.list({
//       part: 'snippet',
//       q: query, // Your search query
//       type: 'channel',
//       maxResults: 1, // You may adjust the number of results
//     });

//     if (response.data.items.length === 0) {
//       console.log('No channel found for the given query.');
//       return;
//     }

//     const channelId = response.data.items[0].id.channelId;
//     console.log(`Found channel with ID: ${channelId}`);

//     await getVideoList(channelId);
//   } catch (error) {
//     console.error('Error searching for channel:', error.message);
//   }
// }

// async function getVideoList(channelId) {
//   try {
//     const response = await youtube.search.list({
//       part: 'snippet',
//       channelId: channelId,
//       type: 'video',
//       maxResults: 1000, // Adjust as needed
//     });

//     const videos = response.data.items.map(item => ({
//       title: item.snippet.title,
//       description: item.snippet.description,
//       videoId: item.id.videoId,
//       // Add more fields as needed
//     }));

//     // Log or return the video information
//     console.log(videos);
//   } catch (error) {
//     console.error('Error fetching video list:', error.message);
//   }
// }
// // Replace 'Your_Channel_Name' with the channel name you want to search for
// searchChannel('Yvonnie');
