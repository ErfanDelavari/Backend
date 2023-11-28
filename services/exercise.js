const db = require('./db');
const helper = require('../helper');
const { generateUrlFromFilePath } = require('../mediaProvider/mediaConfig');

async function getMultiple(req) {
  let page = 1;
  if (req.query.page) { page = req.query.page };
  let pageSize = 15;
  if (req.query.pageSize) { pageSize = req.query.pageSize };
  let search = null;
  if (req.query.search) { search = req.query.search };
  const offset = helper.getOffset(page, pageSize);
  let query = `
        SELECT 
            exercise.*,
            GROUP_CONCAT(media.id) AS media_ids,
            GROUP_CONCAT(media.file_path) AS media_filePaths,
            GROUP_CONCAT(media.url) AS media_urls,
            GROUP_CONCAT(media.is_video) AS media_is_videos,
            GROUP_CONCAT(media.is_gif) AS media_is_gifs,
            GROUP_CONCAT(media.is_image) AS media_is_images
        FROM exercise
        LEFT JOIN exercise_media ON exercise.id = exercise_media.exercise_id
        LEFT JOIN media ON exercise_media.media_id = media.id
    `;
  if (search) {
    query += ` WHERE exercise.name LIKE '%${search}%'`;
  }
  query += `GROUP BY exercise.id`;

  const rows = await db.query(query, page, pageSize);

  const data = rows.map(row => ({
    ...row,
    instructions: row.instructions ? JSON.parse(row.instructions) : [],
    media: generateMediaArray(row),
    // Exclude unwanted fields from the root of each exercise object
    media_ids: undefined,
    media_filePaths: undefined,
    media_is_videos: undefined,
    media_is_gifs: undefined,
    media_is_images: undefined,
    media_urls: undefined,
  }));
  const meta = { page, pageSize, search };

  return {
    data,
    meta
  }
}

function generateMediaArray(row) {
  const mediaArray = [];
  const mediaIds = row.media_ids ? row.media_ids.split(',') : [];
  const mediaFilePaths = row.media_filePaths ? row.media_filePaths.split(',') : [];
  const mediaUrls = row.media_urls ? row.media_urls.split(',') : [];
  const isVideos = row.media_is_videos ? row.media_is_videos.split(',') : [];
  const isGifs = row.media_is_gifs ? row.media_is_gifs.split(',') : [];
  const isImages = row.media_is_images ? row.media_is_images.split(',') : [];

  for (let i = 0; i < mediaIds.length; i++) {
    const mediaObject = {
      id: parseInt(mediaIds[i]),
      type: generateMediaType(isVideos[i], isGifs[i], isImages[i]),
      url: mediaUrls[i] ? mediaUrls[i] : generateUrlFromFilePath(mediaFilePaths[i])
    };
    mediaArray.push(mediaObject);
  }

  return mediaArray;
}

function generateMediaType(isVideo, isGif, isImage) {
  if (isVideo === '1') {
    return 'video';
  } else if (isGif === '1') {
    return 'gif';
  } else if (isImage === '1') {
    return 'image';
  } else {
    return 'unknown'; // You can adjust this as needed
  }
}

module.exports = {
  getMultiple
}
