import Audic from 'audic';
import fs from 'fs/promises';
import path from 'path';
import process from 'process';
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';
import isEqual from 'lodash/isEqual.js';

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Gets cell values from a Spreadsheet.
 * @param {string} spreadsheetId The spreadsheet ID.
 * @param {string} range The sheet range.
 * @return {obj} spreadsheet information
 */
async function getSpreadsheet(spreadsheetId, range) {
  const auth = await authorize();
  const sheets = google.sheets({ version: 'v4', auth });
  let res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
  res = res.data.values.filter(value => value.length > 1 && (value[1].toLowerCase() === 'eliminate' || value[1].toLowerCase() === 'eliminated'))
  res = res.map(sublist => sublist[0])
  return res;
}

// const SPID = '1z874uReqqQE8bxeYIArmApIwBb6BouGE-WQq9ryI5II'
// const RANGE = 'Sheet1!B:C'
const SPID = '1Iap9kkZBUIYE39AWiMXtNCop_dsNxuyP17dWQSfMO1M'
const RANGE = 'Game 1!B:C'
let audioQueue = [];

// let data = await getSpreadsheet(SPID, RANGE)
// console.log(data)

// setInterval(async () => {
//   let data = await getSpreadsheet(SPID, RANGE)
//   console.log(data)
// }, 3000);




/* <--This is the audio playing part-->*/

// async function monitorUpdates(spreadsheetId, range, interval) {
//   let previousData = null;
//   let uniqueValuesSet = new Set();

//   async function fetchDataAndCheckUpdates() {
//     try {
//       const newData = await getSpreadsheet(spreadsheetId, range);
//       if (!isEqual(newData, previousData)) {
//         newData.forEach(value => {
//           if (!uniqueValuesSet.has(value)) {
//             audioQueue.push(value);
//             uniqueValuesSet.add(value);
//           }
//         });
//         previousData = newData;
//         console.log('Updated list:');
//         console.log(uniqueValuesSet);
//         console.log('Audio queue:');
//         console.log(audioQueue);
//       }
//     } catch (error) {
//       console.error('Error fetching data:', error);
//     }
//     handleListUpdate();
//   }
  
//   fetchDataAndCheckUpdates();  
//   setInterval(fetchDataAndCheckUpdates, interval);
// }
// monitorUpdates(SPID, RANGE, 2000);

// let isPlaying = false;
// async function playFromQueue(arr) {
//   if (arr.length > 0) {
//     let fileToPlay = `audio/${arr.shift()}.mp3`
//     const audic = new Audic(fileToPlay);
//     isPlaying = true
//     await audic.play();

//     audic.addEventListener('ended', () => {
//       audic.destroy();
//       playFromQueue(arr)
//     });
//   } else {
//     isPlaying = false;
//   }
// }

// let tempArr = [];

// function handleListUpdate() {
//   if (audioQueue.length > 0 && !isPlaying) {
//     tempArr = audioQueue;
//     audioQueue = []
//     playFromQueue(tempArr)
//   }
// }


/* <--This is the end of audio playing part-->*/





/* <--This is the expressjs part-->*/

import express from 'express';
import cors from 'cors';

const app = express()
app.use(express.json())
app.use(cors())

app.get('/', async (req, res)=>{
    let data = await getSpreadsheet(SPID, RANGE)
    console.log(data);
    
    return res.json(data);
  })
  
app.listen(8000, () =>{
    console.log(`API is active at port : http://localhost:8000`)
  })

/* <--This is the end of expressjs part-->*/
    
    
    
    
    
    