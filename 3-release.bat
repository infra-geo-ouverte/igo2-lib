call npm run build.geo

REM robocopy dist\auth    ..\igo2\node_modules\@igo2\auth /COPYALL /E
REM robocopy dist\common  ..\igo2\node_modules\@igo2\common /COPYALL /E
REM robocopy dist\context ..\igo2\node_modules\@igo2\context /COPYALL /E
REM robocopy dist\core    ..\igo2\node_modules\@igo2\core /COPYALL /E
robocopy dist\geo     ..\igo2\node_modules\@igo2\geo /COPYALL /E
REM robocopy dist\integration   ..\igo2\node_modules\@igo2\integration /COPYALL /E
REM robocopy dist\utils    ..\igo2\node_modules\@igo2\utils /COPYALL /E