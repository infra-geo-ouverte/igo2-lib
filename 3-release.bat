call npm run build.geo

call gulp core:bundleLocale
robocopy dist\auth    ..\igo2\node_modules\@igo2\auth /COPYALL /E
robocopy dist\common  ..\igo2\node_modules\@igo2\common /COPYALL /E
robocopy dist\context ..\igo2\node_modules\@igo2\context /COPYALL /E
robocopy dist\core    ..\igo2\node_modules\@igo2\core /COPYALL /E
robocopy dist\geo     ..\igo2\node_modules\@igo2\geo /COPYALL /E
robocopy dist\integration   ..\igo2\node_modules\@igo2\integration /COPYALL /E
robocopy dist\utils    ..\igo2\node_modules\@igo2\utils /COPYALL /E