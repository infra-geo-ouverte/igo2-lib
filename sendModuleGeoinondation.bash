npm run build.lib
npm pack
rm -rf ../igo2-geoinondation/node_modules/@igo2/igo2/*
mv igo2-igo2-0.19.5.tgz ../igo2-geoinondation/node_modules/@igo2/igo2/.
cd ../igo2-geoinondation/node_modules/@igo2/igo2/
tar zxvf igo2-igo2-0.19.5.tgz
mv package/* .
