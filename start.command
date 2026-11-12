#!/bin/bash
# Double-click this file to start Byte Belts on this Mac.
# Other devices on the same Wi-Fi (like an iPad) can open the second address it prints.
cd "$(dirname "$0")"
PORT=8642
IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
echo ""
echo "  Byte Belts is running."
echo "  On this Mac:      http://localhost:$PORT"
[ -n "$IP" ] && echo "  On an iPad/phone: http://$IP:$PORT   (same Wi-Fi)"
echo "  Close this window to stop."
echo ""
(sleep 1; open "http://localhost:$PORT") &
python3 -m http.server $PORT
