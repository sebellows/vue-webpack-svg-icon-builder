const fs = require('fs');
const path = require('path');
const promisify = require('util').promisify;
const mkdirp = require('mkdirp');

const asyncFS = {
    readFileAsync: promisify(fs.readFile),
    writeFilePromise: promisify(fs.writeFile),
    mkdirpPromise: promisify(mkdirp),

    /**
     * checks if a file/directory is accessable
     * @param {any} directory
     * @returns
     */
    exists: async function(directory) {
        return new Promise((resolve, reject) => {
            fs.access(directory, fs.constants.R_OK | fs.constants.W_OK, (err) => {
                if (err) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    },

    mkdirpAsync: async function(filepath) {
        const directory = path.dirname(filepath);

        // if the directory doesn't exist, create it
        if (!(await asyncFS.exists(directory))) {
            return await asyncFS.mkdirpAsync(directory);
        }

        return directory;
    },

    /**
     * async wrapper for writeFile that will create the directory if it does not already exist
     * @param {String} filename
     * @param {Buffer} buffer
     * @returns
     */
    writeFileAsync: async function(filename, buffer) {
        // const directory = path.dirname(filename);

        // // if the directory doesn't exist, create it
        // if (!(await exists(directory))) {
        //   await mkdirpAsync(directory);
        // }
        await asyncFS.mkdirpAsync(filename);

        return asyncFS.writeFilePromise(filename, buffer);
    },
};

module.exports = asyncFS;
