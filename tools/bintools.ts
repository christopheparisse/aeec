/** 
 * @module: bintools.ts
 **/

let os = require('os');

export var bintools = {
    binLoc: function () {
        var htmlTrjsPath;
        console.log("! global appTarget type " + global['applicationTarget_type']);
        console.log('! __dirname', __dirname);
        console.log('! process', process.cwd());
        console.log('! OS', os.platform(), os.arch());
        if (global['applicationTargetType'] !== undefined && global['applicationTargetType'] === 'webpack') {
            htmlTrjsPath = process.cwd().replace(/\\/g, '/') + "/../bin";
            console.log('cas1= ' + htmlTrjsPath);
        } else if (__dirname !== undefined) {
            htmlTrjsPath = __dirname.replace(/\\/g, '/') + "/../bin";
            console.log('cas2= ' + htmlTrjsPath);
        } else {
            htmlTrjsPath = process.cwd().replace(/\\/g, '/') + "/bin";
            console.log('cas3= ' + htmlTrjsPath);
        }
        // console.log('path= ' + htmlTrjsPath);
        return htmlTrjsPath;
    },

    javaLoc: function () {
        if (os.platform() === 'win32') {
            if (os.arch() === 'x64')
                return this.binLoc() + "/java-x64/bin/java.exe";
            else
                return this.binLoc() + "/java-x86/bin/java.exe";
        } else if (os.platform() === 'darwin') {
    //		if (os.release() < '14.1.0')
            return this.binLoc() + "/java-osx/bin/java";
    //		else
    //			return version.binLoc() + "/java-osx3264";
        } else if (os.platform() === 'linux') {
            return "java";
        }
    },

    ffmpegLoc: function () {
        if (os.platform() === 'win32') {
            if (os.arch() === 'x64')
                return this.binLoc() + "/ffmpeg-x64.exe";
            else
                return this.binLoc() + "/ffmpeg-x86.exe";
        } else if (os.platform() === 'darwin') {
            if (os.release() < '14.1.0')
                return this.binLoc() + "/ffmpeg_10_6";
            else
                return this.binLoc() + "/ffmpeg";
        } else if (os.platform() === 'linux') {
            return "ffmpeg";
        }
    },

    ffprobeLoc: function () {
        if (os.platform() === 'win32') {
            if (os.arch() === 'x64')
                return this.binLoc() + "/ffprobe-x64.exe";
            else
                return this.binLoc() + "/ffprobe-x86.exe";
        } else if (os.platform() === 'darwin') {
            if (os.release() < '14.1.0')
                return this.binLoc() + "/ffprobe_10_6";
            else
                return this.binLoc() + "/ffprobe";
        } else if (os.platform() === 'linux') {
            return "ffprobe";
        }
    },
};
