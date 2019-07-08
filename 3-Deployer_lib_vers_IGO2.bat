call npm run build.libs
robocopy dist\auth    ..\igo2\node_modules\@igo2\auth /COPYALL /E > nul
robocopy dist\common  ..\igo2\node_modules\@igo2\common /COPYALL /E > nul
robocopy dist\context ..\igo2\node_modules\@igo2\context /COPYALL /E > nul
robocopy dist\core    ..\igo2\node_modules\@igo2\core /COPYALL /E > nul
robocopy dist\geo     ..\igo2\node_modules\@igo2\geo /COPYALL /E > nul
robocopy dist\tools   ..\igo2\node_modules\@igo2\tools /COPYALL /E > nul
robocopy dist\integration   ..\igo2\node_modules\@igo2\integration /COPYALL /E > nul
robocopy dist\utils    ..\igo2\node_modules\@igo2\utils /COPYALL /E > nul

