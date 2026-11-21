#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SDK_DIR="${ANDROID_SDK_TMP:-/tmp/android-sdk}"
BUILD_TOOLS="$SDK_DIR/android-14"
PLATFORM_JAR="$SDK_DIR/android-34/android.jar"

if [ ! -f "$PLATFORM_JAR" ]; then
  mkdir -p "$SDK_DIR"
  pushd "$SDK_DIR" >/dev/null
  curl -sL -O https://dl.google.com/android/repository/build-tools_r34-linux.zip
  curl -sL -O https://dl.google.com/android/repository/platform-34-ext7_r02.zip
  unzip -q -o build-tools_r34-linux.zip
  unzip -q -o platform-34-ext7_r02.zip
  popd >/dev/null
fi

KEYSTORE="$SCRIPT_DIR/android-src/release-key.jks"
if [ ! -f "$KEYSTORE" ]; then
  keytool -genkeypair -v \
    -keystore "$KEYSTORE" \
    -alias rosario4voci \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass rosario2026 -keypass rosario2026 \
    -dname "CN=Rosario Guidato a 4 Voci, OU=Preghiera, O=Rosario4Voci, L=Roma, ST=RM, C=IT" >/dev/null 2>&1
fi

build_variant() {
  local HTML_SOURCE="$1"
  local OUTPUT_APK="$2"
  local COPY_WEB_ASSETS="${3:-0}"
  local WORK_DIR="/tmp/apk-build-$(basename "$OUTPUT_APK" .apk)"
  rm -rf "$WORK_DIR"
  mkdir -p "$WORK_DIR/gen" "$WORK_DIR/obj" "$WORK_DIR/dex" "$WORK_DIR/assets"

  cp "$HTML_SOURCE" "$WORK_DIR/assets/index.html"
  if [ "$COPY_WEB_ASSETS" = "1" ]; then
    for asset in styles.css app.js icon.svg schema-preghiere-istruzioni.json; do
      if [ -f "$SCRIPT_DIR/web/$asset" ]; then
        cp "$SCRIPT_DIR/web/$asset" "$WORK_DIR/assets/$asset"
      fi
    done
    if [ -f "$SCRIPT_DIR/android-src/res/drawable/ic_launcher.png" ]; then
      cp "$SCRIPT_DIR/android-src/res/drawable/ic_launcher.png" "$WORK_DIR/assets/icon-192.png"
    fi
  fi

  # 1. Generate R.java
  "$BUILD_TOOLS/aapt" package -f -m \
    -J "$WORK_DIR/gen" \
    -M "$SCRIPT_DIR/android-src/AndroidManifest.xml" \
    -S "$SCRIPT_DIR/android-src/res" \
    -I "$PLATFORM_JAR"

  # 2. Compile Java sources (target Java 8 bytecode for d8 compatibility)
  javac --release 8 \
    -cp "$PLATFORM_JAR" \
    -d "$WORK_DIR/obj" \
    "$WORK_DIR/gen/it/rosarioguidato/quattrovoci/R.java" \
    "$SCRIPT_DIR/android-src/src/it/rosarioguidato/quattrovoci/MainActivity.java"

  # 3. Convert class files to classes.dex using d8
  "$BUILD_TOOLS/d8" --lib "$PLATFORM_JAR" \
    --output "$WORK_DIR/dex" \
    $(find "$WORK_DIR/obj" -name "*.class")

  # 4. Package resources, AndroidManifest.xml, and assets into unaligned APK
  "$BUILD_TOOLS/aapt" package -f \
    -M "$SCRIPT_DIR/android-src/AndroidManifest.xml" \
    -S "$SCRIPT_DIR/android-src/res" \
    -A "$WORK_DIR/assets" \
    -I "$PLATFORM_JAR" \
    -F "$WORK_DIR/unaligned.apk"

  # 5. Add classes.dex to the root of the APK
  pushd "$WORK_DIR/dex" >/dev/null
  "$BUILD_TOOLS/aapt" add "$WORK_DIR/unaligned.apk" classes.dex >/dev/null
  popd >/dev/null

  # 6. Align APK with zipalign
  "$BUILD_TOOLS/zipalign" -f 4 "$WORK_DIR/unaligned.apk" "$WORK_DIR/aligned.apk"

  # 7. Sign APK (v1 + v2 + v3 signatures)
  "$BUILD_TOOLS/apksigner" sign \
    --ks "$KEYSTORE" \
    --ks-key-alias rosario4voci \
    --ks-pass pass:rosario2026 \
    --key-pass pass:rosario2026 \
    --out "$OUTPUT_APK" \
    "$WORK_DIR/aligned.apk"

  "$BUILD_TOOLS/apksigner" verify --verbose "$OUTPUT_APK" | head -n 5
}

echo "Building Cloud APK (Supabase CDN Streaming)..."
build_variant "$SCRIPT_DIR/web/index.html" "$SCRIPT_DIR/Rosario-Guidato-4-Voci.apk" 1

echo "Building Offline APK (All 65 MP3s Embedded)..."
build_variant "$SCRIPT_DIR/web/rosario-coroncina-app.html" "$SCRIPT_DIR/Rosario-Guidato-4-Voci-Offline.apk" 0

rm -f "$SCRIPT_DIR"/Rosario-Guidato-4-Voci*.apk.idsig
