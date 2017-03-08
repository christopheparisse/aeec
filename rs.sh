mkdir dist
rsync -auv  --exclude="*/.*"  --exclude="builds/" --exclude="*.class" --exclude="*.git" --exclude="node_modules/" --exclude="dist/" /devlopt/trjs2017/aeec .
rsync -auv  --exclude="*/.*"  --exclude="builds/" --exclude="*.class" --exclude="*.git" --exclude="node_modules/" --exclude="dist/" /devlopt/trjs2017/tools .
rsync -auv  --exclude="*/.*"  --exclude="builds/" --exclude="*.class" --exclude="*.git" --exclude="node_modules/" --exclude="dist/" /devlopt/trjs2017/systemcall .
rsync -auv  --exclude="*/.*"  --exclude="builds/" --exclude="*.class" --exclude="*.git" --exclude="node_modules/" --exclude="dist/" /devlopt/trjs2017/html .
rsync -auv  --exclude="*/.*"  --exclude="builds/" --exclude="*.class" --exclude="*.git" --exclude="node_modules/" --exclude="dist/" /devlopt/trjs2017/dist/bin dist
rsync -auv  --exclude="*/.*"  --exclude="builds/" --exclude="*.class" --exclude="*.git" --exclude="node_modules/" --exclude="dist/" /devlopt/trjs2017/dist/css dist
rsync -auv  --exclude="*/.*"  --exclude="builds/" --exclude="*.class" --exclude="*.git" --exclude="node_modules/" --exclude="dist/" /devlopt/trjs2017/dist/lib dist
rsync -auv  --exclude="*/.*"  --exclude="builds/" --exclude="*.class" --exclude="*.git" --exclude="node_modules/" --exclude="dist/" /devlopt/trjs2017/gul*js .
rsync -auv  --exclude="*/.*"  --exclude="builds/" --exclude="*.class" --exclude="*.git" --exclude="node_modules/" --exclude="dist/" /devlopt/trjs2017/*json .
rsync -auv  --exclude="*/.*"  --exclude="builds/" --exclude="*.class" --exclude="*.git" --exclude="node_modules/" --exclude="dist/" /devlopt/trjs2017/*sh .
rsync -auv  --exclude="*/.*"  --exclude="builds/" --exclude="*.class" --exclude="*.git" --exclude="node_modules/" --exclude="dist/" /devlopt/trjs2017/*nsi .
rsync -auv  --exclude="*/.*"  --exclude="builds/" --exclude="*.class" --exclude="*.git" --exclude="node_modules/" --exclude="dist/" /devlopt/trjs2017/*bat .

