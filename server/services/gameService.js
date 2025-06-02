// When a player selects a photo preset, it will go and grab those photos from the server
// and use them as the current photos for the game.

import { gameRoom, photos } from '../index.js';
import fs from 'fs/promises';
import path from 'path';

const PHOTO_PRESETS = {
  fish: [
    '/assets/fish/clownfish.jpg',
    '/assets/fish/dory.jpg',
    '/assets/fish/marlin.png',
    '/assets/fish/tilapia.jpeg',
    '/assets/fish/ugly.jpg',
  ],
  friends: [
    '/assets/friends/chandler.jpeg',
    '/assets/friends/joey.jpeg',
    '/assets/friends/monica.jpeg',
    '/assets/friends/phoebe.jpeg',
    '/assets/friends/rachel.jpeg',
    '/assets/friends/ross.jpeg',
  ],
};

export async function handlePhotoPreset(ws, data) {
  if (!data.preset) {
    console.warn('No preset provided');
    return;
  }

  // Check if the preset exists
  const presetPhotos = PHOTO_PRESETS[data.preset];
  if (!presetPhotos) {
    console.warn(`Preset ${data.preset} does not exist`);
    return;
  }

  // Update the current photos with the preset
  Object.keys(photos).forEach((key) => {
    delete photos[key]; // Clear existing photos
  });

  // Read and encode each image as a Data URL
  const photoEntries = await Promise.all(
    presetPhotos.map(async (photo, index) => {
      const ext = path.extname(photo).toLowerCase();
      const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
      const filePath = path.join(path.resolve('server'), photo);
      let dataUrl = '';
      try {
        const fileBuffer = await fs.readFile(filePath);
        const base64 = fileBuffer.toString('base64');
        dataUrl = `data:${mimeType};base64,${base64}`;
      } catch (err) {
        console.warn(`Could not read file: ${filePath}`, err);
      }
      return [
        `preset-${data.preset}-${index}`,
        {
          id: `preset-${data.preset}-${index}`,
          name: photo.split('/').pop(),
          type: mimeType,
          size: 0,
          lastModified: Date.now(),
          dataUrl,
        },
      ];
    })
  );

  photoEntries.forEach(([photoId, photoObj]) => {
    photos[photoId] = photoObj;
  });

  // Notify the client about the updated photos
  ws.send(
    JSON.stringify({
      type: 'photos',
      photos,
    })
  );

  console.log(`User ${ws.userId} selected photo preset: ${data.preset}`);
}

export function canLoggedInUserMoveToken(token, userId) {
  switch (gameRoom.mode) {
    case 'god':
      if (gameRoom.host === userId) {
        return true;
      }
      if (token.userId === userId) {
        return true;
      }
      return false;
    case 'ffa':
      if (token.userId === userId) {
        return true;
      }
      return false;
    case 'group':
      if (token.userId === userId) {
        return true;
      }
      return false;
  }
}
