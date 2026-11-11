# Pinterest — trial → standard access

**Status (2026-11-12): Trial access APPROVED 2026-10-21.** App secret on prod (`NETWORK_PINTEREST_*`), Pinterest
available in health. Trial = connect and read; publishing Pins needs **Standard** access (developers.pinterest.com →
app 1622986 → Upgrade access; needs a demo film recorded by hand).

## [F]
1. Convert/create a Pinterest **business account** (FF's).
2. developers.pinterest.com → Connect app: name **Siar**, description below, redirect
   https://api.siaran.my/api/v1/social-account/callback/PINTEREST, privacy https://siaran.my/privacy.
   Trial access arrives immediately (sandbox + limited writes).

Description: *"Siar lets businesses and creators publish and schedule Pins (images, carousels,
videos) to their own boards and see Pin and account analytics, from one dashboard and API."*

## Standard access (after deploy)
Video demo: connect Pinterest → board list → create a Pin with image, title, link → Pin visible on
the board → analytics screen. Scopes: boards:read, boards:write, pins:read, pins:write,
user_accounts:read.
