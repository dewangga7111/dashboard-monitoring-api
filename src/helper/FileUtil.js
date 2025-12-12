const fs = require('fs')
const path = require('path')
const archiver = require('archiver')

const writeB64ImageToDisk = (pathAndFileName, base64Data) => {
    try {
        let file = base64Data.replace(/^data:image\/png;base64,/, "")
        file = base64Data.replace(/^data:image\/jpeg;base64,/, "")
        fs.writeFileSync(pathAndFileName,  file, 'base64')
        return true
    } catch(err) {
        console.log('FileUtil.writeB64ImageToDisk', err)
        return false
    }
}

const writeCsvToDisk = (pathAndFileName, data) => {
    try {
        fs.writeFileSync(pathAndFileName,  data)
        return true
    } catch(err) {
        console.log('FileUtil.writeCsvToDisk', err)
        return false
    }
}

const getFileExt = (filename) => {
    return path.extname(filename)
}

const getFileName = (filepath, withExt = true) => {
    if(withExt)
        return path.basename(filepath)
    return path.parse(filepath).name
}

const deleteFileFromDisk = (pathAndFileName) => {
    try {
        fs.unlinkSync(pathAndFileName)
    } catch(err) {
        console.log(`File ${pathAndFileName} already deleted`)
    }
}

const checkFileExist = (pathAndFileName) => {
    return fs.existsSync(pathAndFileName)
}

const readFileFromDisk = (pathAndFileName) => {
    return fs.readFileSync(pathAndFileName)
}

/* 
    files = [ { filepath, filename, buffer } ],
    zipfilename = fullpath to zip filename, contoh: ./temp/file.zip
*/
const zipFiles = (files = [], zipfilename) => {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(zipfilename);
        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });
    
        output.on('close', () => {
          resolve();
        });
    
        archive.on('error', (err) => {
          reject(err);
        });
    
        archive.pipe(output);
    
        for(let fb of files) {
            if(fb.filepath)
                archive.file(fb.filepath, { name: fb.filename })
            else if(fb.buffer)
                archive.append(fb.buffer, { name: fb.filename })
        }        
    
        archive.finalize();
    });
}

module.exports = {
    writeB64ImageToDisk,
    writeCsvToDisk,
    getFileExt,
    deleteFileFromDisk,
    getFileName,
    checkFileExist,
    readFileFromDisk,
    zipFiles,
}