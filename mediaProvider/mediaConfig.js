require('dotenv').config()
const mediaBaseFilePath = process.env.DOMAIN + "media/";

function generateUrlFromFilePath(file_path){
    return mediaBaseFilePath + file_path
}

module.exports = {
    generateUrlFromFilePath,
};
