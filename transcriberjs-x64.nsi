; transcriberjs-x64.nsi
;
; This script is based on example1.nsi, but it remember the directory,
; has uninstall support and (optionally) installs start menu shortcuts.
;
; It will install transcriberjs.nsi into a directory that the user selects,

;--------------------------------
!include "MUI.nsh"
!include nsDialogs.nsh

;--------------------------------

; The name of the installer
Name "aeec-install-v0.2.0-x64"

; The file to write
OutFile "aeec-v0.2.0-x64.exe"

; The default installation directory
InstallDir "$PROGRAMFILES64\aeec"

; Registry key to check for directory (so if you install again, it will
; overwrite the old one automatically)
InstallDirRegKey HKLM "Software\trjs" "Install_Dir"

; Request application privileges for Windows Vista
RequestExecutionLevel admin

;--------------------------------

; Pages

Page components
Page directory
Page instfiles

UninstPage uninstConfirm
UninstPage instfiles

;--------------------------------

; The stuff to install
Section "aeec 64bits v0.2.0 (required)"

  SectionIn RO

  ; Put file there
  SetOutPath $INSTDIR
  File /r "c:\devlopt\builds\Aeec-win32-x64\*.*"
 
  ; Write the installation path into the registry
  WriteRegStr HKLM SOFTWARE\aeec "Install_Dir" "$INSTDIR"

  ; Write the uninstall keys for Windows
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\aeec" "DisplayName" "aeec"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\aeec" "UninstallString" '"$INSTDIR\uninstall.exe"'
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\aeec" "NoModify" 1
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\aeec" "NoRepair" 1
  WriteUninstaller "uninstall.exe"

  CreateDirectory "$SMPROGRAMS\aeec"
  CreateShortCut "$SMPROGRAMS\aeec\Uninstall.lnk" "$INSTDIR\uninstall.exe" "" "$INSTDIR\uninstall.exe" 0
  CreateShortCut "$SMPROGRAMS\aeec\aeec.lnk" "$INSTDIR\aeec.exe"
  
SectionEnd

; Optional section (can be disabled by the user)
Section "Desktop Shortcuts"

  CreateShortCut "$DESKTOP\aeec.lnk" "$INSTDIR\aeec.exe"
  
SectionEnd

;--------------------------------

; Uninstaller

Section "Uninstall"

  ; Remove registry keys
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\aeec"
  DeleteRegKey HKLM SOFTWARE\aeec

  ; Remove shortcuts, if any
  Delete "$SMPROGRAMS\aeec\*.*"
  Delete "$DESKTOP\aeec.lnk"

  ; Remove directories used
  RMDir "$SMPROGRAMS\aeec"
  RMDir /r "$INSTDIR"

SectionEnd
