const mediaBaseFilePath = "http://localhost:3000/media/";

function generateUrlFromFilePath(file_path){
    return mediaBaseFilePath + file_path
}

module.exports = {
    generateUrlFromFilePath,
};
