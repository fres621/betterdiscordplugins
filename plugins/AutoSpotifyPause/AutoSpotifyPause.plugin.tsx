/**
 * @name AutoSpotifyPause
 * @author fres621
 * @authorId 843448897737064448
 * @version 1.0.0
 * @description Automatically pause Spotify when you play media files on Discord
 */

import type * as _React from 'react';

const { Patcher, Webpack, React, Data } = new BdApi("AutoSpotifyPause");

interface Thing {
    mediaRef: _React.RefObject<HTMLAudioElement>;
}

module.exports = _ => {
    // Do stuff in here before returning
    const findByProps = (...props) => Webpack.getModule(Webpack.Filters.byKeys(...props));

    const { FormSwitch } = findByProps("FormSwitch");

    const SpotifySocket = findByProps("getActiveSocketAndDevice");
    const SpotifyUtils = findByProps("SpotifyAPI");

    const controller = new AbortController();

    return {
        start: () => {
            const module: { default: { prototype: { componentDidMount: (this: Thing) => void } } } = findByProps("convertSecondsToClockFormat");

            let playingAudios = 0;

            function playSpotify() {
                if (!Data.load('resume')) return;
                const { socket, device } = SpotifySocket.getActiveSocketAndDevice();
                SpotifyUtils.SpotifyAPI.put(socket.accountId, socket.accessToken, {
                    url: 'https://api.spotify.com/v1/me/player/play',
                    device_id: device.id
                });
            };

            function pauseSpotify() {
                const { socket, device } = SpotifySocket.getActiveSocketAndDevice();
                SpotifyUtils.SpotifyAPI.put(socket.accountId, socket.accessToken, {
                    url: 'https://api.spotify.com/v1/me/player/pause',
                    device_id: device.id
                });
            };

            const isSpotifyPlaying = () => SpotifySocket.getTrack() !== null;


            Patcher.before(module.default.prototype, "componentDidMount", function (p) {
                if (!p.mediaRef.current) return; // Should never be the case but it's here to make TypeScript happy
                let wasSpotifyPlaying: boolean | undefined = undefined;
                let isSeeking = false;

                p.mediaRef.current.addEventListener("pause", () => {
                    playingAudios -= 1;
                    if (!isSeeking && playingAudios == 0 && wasSpotifyPlaying) playSpotify();
                }, { signal: controller.signal });
                p.mediaRef.current.addEventListener("play", () => {
                    if (wasSpotifyPlaying === undefined) wasSpotifyPlaying = isSpotifyPlaying();
                    playingAudios += 1;
                    if (isSpotifyPlaying()) pauseSpotify();
                }, { signal: controller.signal });

                p.mediaRef.current.addEventListener("seeking", () => {
                    isSeeking = true;
                }, { signal: controller.signal });

                p.mediaRef.current.addEventListener("seeked", () => {
                    isSeeking = false;
                }, { signal: controller.signal });
            });
        },
        stop: () => {
            Patcher.unpatchAll();
            controller.abort();
        },
        getSettingsPanel: () => {
            function SettingsPanel() {
                const [resume, setResume] = React.useState(Data.load('resume') ?? false);
                function onSwitchResume(v) {
                    Data.save('resume', v);
                    setResume(v);
                }
                return <FormSwitch className="bd-asp-resume-switch" value={resume} onChange={onSwitchResume}>Resume Spotify playback after media stops playing</FormSwitch>
            }

            return <SettingsPanel />
        }
    }
};