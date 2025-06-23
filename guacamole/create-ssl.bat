@echo off
setlocal

:: Sertifikaların oluşturulacağı klasör
set SSL_DIR=nginx\ssl

:: OpenSSL yolu (gerekirse özelleştir)
set OPENSSL="C:\Program Files\OpenSSL-Win64\bin\openssl.exe"

:: Klasörü oluştur
if not exist "%SSL_DIR%" (
    mkdir "%SSL_DIR%"
)

:: Sertifikaları oluştur
%OPENSSL% req -x509 -nodes -days 36500 -newkey rsa:2048 ^
-keyout "%SSL_DIR%\self.key" ^
-out "%SSL_DIR%\self.cert" ^
-subj "/C=TR/ST=Istanbul/L=City/O=MyCompany/OU=IT/CN=localhost"

echo.
echo ✅ Sertifikalar oluşturuldu: %SSL_DIR%\self.cert ve self.key
pause
