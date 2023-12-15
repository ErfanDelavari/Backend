const db = require('./db');
const helper = require('../helper');
const { generateUrlFromFilePath } = require('../mediaProvider/mediaConfig');


async function getSingle(exerciseId) {
const exerciseQuery = `
SELECT 
    exercise.*,
    GROUP_CONCAT(media.id) AS media_ids,
    GROUP_CONCAT(media.file_path) AS media_filePaths,
    GROUP_CONCAT(media.url) AS media_urls,
    GROUP_CONCAT(media.type) AS media_types
FROM exercise
LEFT JOIN exercise_media ON exercise.id = exercise_media.exercise_id
LEFT JOIN media ON exercise_media.media_id = media.id
WHERE exercise.id = '${exerciseId}'
GROUP BY exercise.id
`;
const exercise = await db.querySingle(exerciseQuery);

const musclesQuery =`
SELECT
    muscle.*,
    exercise_muscle.is_primary_muscle,
    media.id AS media_id,
    media.file_path AS media_filePath,
    media.url AS media_url,
    media.type AS media_type
FROM muscle
LEFT JOIN exercise_muscle ON muscle.id = exercise_muscle.muscle_id
LEFT JOIN media ON muscle.media_id = media.id
WHERE exercise_muscle.exercise_id = '${exerciseId}'
GROUP BY muscle.id;
`;
const musclesRows  = await db.queryAllNoPagination(musclesQuery);
const muscles = musclesRows.map(row => ({
  ...row,
  media : row.media_id ? generateMediaObject(row.media_id,row.media_type,row.media_url,row.media_filePath) : null,
  media_id : undefined,
  media_filePath : undefined,
  media_url: undefined,
  media_type: undefined
}));

const equipmentQuery =`
SELECT
    equipment.*,
    media.id AS media_id,
    media.file_path AS media_filePath,
    media.url AS media_url,
    media.type AS media_type
FROM equipment
LEFT JOIN exercise_equipment ON equipment.id = exercise_equipment.equipment_id
LEFT JOIN media ON equipment.media_id = media.id
WHERE exercise_equipment.exercise_id = '${exerciseId}';
`;
const equipmentRows = await db.queryAllNoPagination(equipmentQuery)
const equipments = equipmentRows.map(row => ({
  ...row,
  media : row.media_id ? generateMediaObject(row.media_id,row.media_type,row.media_url,row.media_filePath) : null,
  media_id : undefined,
  media_filePath : undefined,
  media_url: undefined,
  media_type: undefined
}));
const data ={
  ...exercise,
  equipments,
  muscles,
  instructions: exercise.instructions ? JSON.parse(exercise.instructions) : [],
  medias: generateMediaArray(exercise),
  // Exclude unwanted fields from the root of each exercise object
  media_ids: undefined,
  media_filePaths: undefined,
  media_types: undefined,
  media_urls: undefined,
}
return {
  data
}
}


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
            GROUP_CONCAT(media.type) AS media_types
        FROM exercise
        LEFT JOIN exercise_media ON exercise.id = exercise_media.exercise_id
        LEFT JOIN media ON exercise_media.media_id = media.id
    `;
  if (search) {
    const decodedSearchTerm = decodeURIComponent(searchTerm);
    query += ` WHERE exercise.name LIKE '%${decodedSearchTerm}%'`;
  }
  query += `GROUP BY exercise.id`;

  const rows = await db.queryAll(query, page, pageSize);

  const data = rows.map(row => ({
    ...row,
    instructions: row.instructions ? JSON.parse(row.instructions) : [],
    medias: generateMediaArray(row),
    // Exclude unwanted fields from the root of each exercise object
    media_ids: undefined,
    media_filePaths: undefined,
    media_types: undefined,
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
  const mediaTypes = row.media_types ? row.media_types.split(',') : [];

  for (let i = 0; i < mediaIds.length; i++) {
    mediaArray.push(generateMediaObject(mediaIds[i],mediaTypes[i],mediaUrls[i],mediaFilePaths[i]));
  }

  return mediaArray;
}

function generateMediaObject(id ,type ,url,filePath){
  return {
    id : parseInt(id),
    type : type,
    url: url ? url : generateUrlFromFilePath(filePath)
  };
}
module.exports = {
  getMultiple,
  getSingle
}
