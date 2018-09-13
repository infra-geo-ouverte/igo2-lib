npm run build.lib
npm pack
rm -rf ../igo/node_modules/@igo2/igo2/*
mv igo2-igo2-0.15.0.tgz ../igo/node_modules/@igo2/igo2/.
cd ../igo/node_modules/@igo2/igo2/
tar zxvf igo2-igo2-0.15.0.tgz
mv package/* .
