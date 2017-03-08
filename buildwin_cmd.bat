cd \devlopt\builds
cmd /c electron-packager aeec-x64 --platform=win32 --arch=x64 --overwrite --icon=aeec-x64/css/aeec.ico
cmd /c electron-packager aeec-x86 --platform=win32 --arch=ia32 --overwrite --icon=aeec-x86/css/aeec.ico
