@echo off
REM ── 3DPrintCraft: ενημέρωση αρχείου φωτογραφιών ──────────────────
REM Ριξε φωτογραφιες στο  assets\img\archive\  (η σε υποφακελους = κατηγοριες)
REM και κανε ΔΙΠΛΟ-ΚΛΙΚ σε αυτο το αρχειο. Τιποτα αλλο.
echo.
echo   Ενημερωση αρχειου φωτογραφιων 3DPrintCraft...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0build-archive.ps1"
echo.
echo   Ετοιμο! Κλεισε το παραθυρο.
pause >nul
