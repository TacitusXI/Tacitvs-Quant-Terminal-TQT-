# 🎵 Radio Station Curation Guide

## Current Station Sources

### Premium Services (Free Tiers Available)

#### Digitally Imported (DI.FM)
- **Website**: https://www.di.fm/
- **Free Tier**: 128 kbps streams
- **Genres**: Electronic, Techno, Trance, House, Industrial
- **URL Format**: `https://prem2.di.fm/{channel}?mp3`
- **Used in TQT**: Hard Techno, Industrial, Dark Techno

**Popular Channels**:
- `hardtechno` — Hard Techno
- `industrial` — Industrial / EBM
- `darkdnb` — Dark Drum & Bass
- `techno` — Classic Techno
- `hardcore` — Hardcore / Gabber

#### SomaFM
- **Website**: https://somafm.com/
- **Quality**: 128 kbps (free, listener-supported)
- **Genres**: Ambient, Space, Drone, Electronic
- **URL Format**: `https://ice1.somafm.com/{channel}-128-mp3`
- **Used in TQT**: Deep Space One, Drone Zone, Doomed

**Popular Channels**:
- `deepspaceone` — Deep Space / Ambient
- `dronezone` — Drone / Ambient
- `doomed` — Industrial / Dark Ambient / EBM
- `spacestation` — Space / Ambient
- `missioncontrol` — Ambient Chillout
- `groovesalad` — Downtempo / Ambient

#### Laut.fm
- **Website**: https://laut.fm/
- **Quality**: 128 kbps
- **Genres**: Various user-curated stations
- **URL Format**: `https://stream.laut.fm/{channel}`
- **Used in TQT**: Synthwave, Vaporwave, Ambient

**Popular Channels**:
- `synthwave` — Synthwave / Retrowave
- `vaporwave` — Vaporwave
- `ambient` — Ambient
- `dark-industrial` — Dark Industrial

## Selection Criteria for TQT

### Technical Requirements
1. **Bitrate**: Minimum 128 kbps
2. **CORS**: Must allow cross-origin requests
3. **Format**: MP3 preferred (universal browser support)
4. **Uptime**: 99%+ availability
5. **No authentication**: Free tier or public stream

### Genre Guidelines by Theme

#### Matrix Theme (Research)
**Goal**: Focus, concentration, deep work
**Genres**: 
- Ambient Electronic
- Space Music
- Synthwave / Retrowave
- Vaporwave
- Downtempo
- Chillwave

**Avoid**: Vocals, aggressive sounds, jarring transitions

#### BlackOps Theme (Execution)
**Goal**: Energy, intensity, alertness
**Genres**:
- Hard Techno
- Industrial Techno
- Dark Techno
- EBM (Electronic Body Music)
- Industrial
- Hardcore Techno
- Gabber

**Key characteristics**: 
- BPM: 140-160+
- Sound: Cold, aggressive, mechanical
- Mood: Intense, driving, relentless

**Avoid**: Soft melodies, slow tempo, ambient

#### Neon Theme (Analysis)
**Goal**: Calm, contemplation, clarity
**Genres**:
- Drone Ambient
- Dark Ambient
- Space Ambient
- Minimal Ambient
- Chillout
- Downtempo

**Avoid**: Aggressive sounds, fast tempo

## How to Add Custom Stations

### 1. Find Stream URL

Test the stream in your browser first:
```bash
# Using curl to test
curl -I "https://ice1.somafm.com/doomed-128-mp3"

# Should return HTTP 200 and Content-Type: audio/mpeg
```

### 2. Update `lib/radio.ts`

```typescript
export const RADIO_STATIONS: Record<ThemeName, RadioStation[]> = {
  blackops: [
    // Add your new station here
    { 
      name: "Your Station Name", 
      url: "https://stream.url.com/channel",
      genre: "Hard Techno",
      bitrate: "128 kbps"
    },
    // ... existing stations
  ],
};
```

### 3. Test in Browser

1. Start the dev server
2. Open DevTools Console
3. Start radio
4. Check for errors:
   - CORS errors → Stream won't work
   - 404 errors → URL incorrect
   - Timeout → Stream offline

## Recommended Additional Stations

### For BlackOps (Hard/Aggressive)

**Loops Radio - Techno**
- URL: `https://stream.loopsradio.com/techno_192`
- Genre: Techno / Industrial Techno
- Bitrate: 192 kbps

**Radio Caprice - Industrial**
- URL: `http://79.111.14.76:8000/industrial`
- Genre: Industrial
- Bitrate: 128 kbps

**Noise FM - Industrial**
- URL: `http://noisefm.ru:8000/play_256`
- Genre: Industrial / EBM / Dark Electro
- Bitrate: 256 kbps

**DI.FM - Hardcore**
- URL: `https://prem2.di.fm/hardcore?mp3`
- Genre: Hardcore / Gabber
- Bitrate: 128 kbps

### For Matrix (Focus/Electronic)

**DI.FM - Chillout**
- URL: `https://prem2.di.fm/chillout?mp3`
- Genre: Chillout / Downtempo
- Bitrate: 128 kbps

**SomaFM - Groove Salad**
- URL: `https://ice1.somafm.com/groovesalad-128-mp3`
- Genre: Ambient Downtempo
- Bitrate: 128 kbps

**DI.FM - Ambient**
- URL: `https://prem2.di.fm/ambient?mp3`
- Genre: Ambient
- Bitrate: 128 kbps

### For Neon (Calm/Ambient)

**SomaFM - Suburbs of Goa**
- URL: `https://ice1.somafm.com/suburbsofgoa-128-mp3`
- Genre: Psychedelic Downtempo
- Bitrate: 128 kbps

**Ambient Sleeping Pill**
- URL: `https://streams.radiomast.io/sleep-radio`
- Genre: Deep Ambient
- Bitrate: 128 kbps

## Troubleshooting Streams

### CORS Issues
If you get CORS errors:
1. Stream provider doesn't allow web playback
2. Try different URL (some have CORS-enabled mirrors)
3. Contact stream provider

### Authentication Required
Some premium streams need API keys:
```typescript
// For DI.FM premium (example)
url: `https://prem2.di.fm/hardtechno?mp3&listen_key=YOUR_KEY`
```

### Stream Offline
- Check stream status on provider website
- Have fallback stations ready
- Auto-fallback will handle this

## Station Testing Checklist

Before adding a station:
- [ ] Test URL in browser
- [ ] Verify bitrate is 128 kbps+
- [ ] Check CORS headers
- [ ] Listen for 5+ minutes (stability check)
- [ ] Verify genre matches theme
- [ ] Test on Chrome, Firefox, Safari
- [ ] Check mobile compatibility

## Community Station Suggestions

Want to suggest a station? Consider:
1. **Reliability**: 99%+ uptime
2. **Quality**: 128 kbps minimum
3. **Genre fit**: Matches theme identity
4. **Licensing**: Legal for streaming
5. **CORS**: Allows web playback

## References

- **Radio.net**: https://www.radio.net/ — Industrial stations database
- **Radio Browser**: https://www.radio-browser.info/ — API for finding stations
- **Shoutcast Directory**: https://directory.shoutcast.com/
- **Icecast Directory**: https://dir.xiph.org/

---

**Note**: Always respect copyright and licensing terms when streaming music. The stations listed here are legitimate internet radio services that allow public streaming.

