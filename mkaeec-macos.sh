dir='/devlopt/builds'
rm -rf $dir/aeec-macos
mkdir $dir/aeec-macos
cp ./dist/* $dir/aeec-macos
cp -R ./dist/tools $dir/aeec-macos
cp -R ./dist/aeec $dir/aeec-macos
cp -R ./dist/css $dir/aeec-macos
cp -R ./dist/systemcall $dir/aeec-macos
cp -R ./dist/lib $dir/aeec-macos
mkdir $dir/aeec-macos/bin
cp dist/bin/ffmpeg $dir/aeec-macos/bin
cp dist/bin/ffmpeg_10_6 $dir/aeec-macos/bin
cp dist/bin/ffprobe $dir/aeec-macos/bin
cp dist/bin/ffprobe_10_6 $dir/aeec-macos/bin
cp dist/bin/fonts.conf $dir/aeec-macos/bin
cp dist/bin/conversions.jar $dir/aeec-macos/bin
cp -R dist/bin/java-osx $dir/aeec-macos/bin
cp -R dist/bin/presets $dir/aeec-macos/bin
cp ./README.md $dir/aeec-macos
cp ./LICENSE.md $dir/aeec-macos
