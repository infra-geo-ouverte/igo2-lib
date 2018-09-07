npm run build.lib
npm pack
rm -rf ../igo2-admin/node_modules/igo2/*
mv igo2-0.8.1.tgz ../igo2-admin/node_modules/igo2/.
cd ../igo2-admin/node_modules/igo2/
tar zxvf igo2-0.8.1.tgz
mv package/* .
