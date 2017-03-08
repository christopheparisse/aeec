dir='/mnt/c/devlopt/builds'
rm -rf $dir/aeec-x64
mkdir $dir/aeec-x64
cp ./dist/* $dir/aeec-x64
cp -R ./dist/tools $dir/aeec-x64
cp -R ./dist/aeec $dir/aeec-x64
cp -R ./dist/css $dir/aeec-x64
cp -R ./dist/systemcall $dir/aeec-x64
cp -R ./dist/lib $dir/aeec-x64
mkdir $dir/aeec-x64/bin
cp dist/bin/ffmpeg $dir/aeec-x64/bin
cp dist/bin/ffmpeg_10_6 $dir/aeec-x64/bin
cp dist/bin/ffprobe $dir/aeec-x64/bin
cp dist/bin/ffprobe_10_6 $dir/aeec-x64/bin
cp dist/bin/fonts.conf $dir/aeec-x64/bin
cp dist/bin/conversions.jar $dir/aeec-x64/bin
cp -R dist/bin/java-osx $dir/aeec-x64/bin
cp -R dist/bin/presets $dir/aeec-x64/bin
cp ./README.md $dir/aeec-x64
cp ./LICENSE.md $dir/aeec-x64
