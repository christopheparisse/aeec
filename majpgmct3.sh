cd /devlopt/builds
cd AEEC-darwin-x64
zip -r ../aeec-v0.2.0-macos.zip AEEC.app
cd ..
scp aeec-v0.2.0-macos.zip parisse@ct3.ortolang.fr:/applis/download/
cp aeec-v0.2.0-macos.zip ~/ownCloud/betatrjs
cd /devlopt/trjs2017
#scp aeec-v0.2.0-x64.exe parisse@ct3.ortolang.fr:/applis/download/
