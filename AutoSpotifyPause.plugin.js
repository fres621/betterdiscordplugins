/**
 * @name AutoSpotifyPause
 * @author fres621
 * @authorId 843448897737064448
 * @version 1.0.0
 * @description Automatically pause Spotify when you play media files on Discord
 * @source https://github.com/fres621/betterdiscordplugins/tree/main/plugins/AutoSpotifyPause
 * @updateUrl https://fres621.github.io/betterdiscordplugins/AutoSpotifyPause.plugin.js
 */
const{Patcher,Webpack,React,Data}=new BdApi("AutoSpotifyPause");module.exports=p=>{const a=(...i)=>Webpack.getModule(Webpack.Filters.byKeys(...i)),{FormSwitch:f}=a("FormSwitch"),c=a("getActiveSocketAndDevice"),l=a("SpotifyAPI"),n=new AbortController;return{start:()=>{const i=a("convertSecondsToClockFormat");let o=0;function r(){if(!Data.load("resume"))return;const{socket:e,device:t}=c.getActiveSocketAndDevice();l.SpotifyAPI.put(e.accountId,e.accessToken,{url:"https://api.spotify.com/v1/me/player/play",device_id:t.id})}function d(){const{socket:e,device:t}=c.getActiveSocketAndDevice();l.SpotifyAPI.put(e.accountId,e.accessToken,{url:"https://api.spotify.com/v1/me/player/pause",device_id:t.id})}const s=()=>c.getTrack()!==null;Patcher.before(i.default.prototype,"componentDidMount",function(e){if(!e.mediaRef.current)return;let t,u=!1;e.mediaRef.current.addEventListener("pause",()=>{o-=1,!u&&o==0&&t&&r()},{signal:n.signal}),e.mediaRef.current.addEventListener("play",()=>{t===void 0&&(t=s()),o+=1,s()&&d()},{signal:n.signal}),e.mediaRef.current.addEventListener("seeking",()=>{u=!0},{signal:n.signal}),e.mediaRef.current.addEventListener("seeked",()=>{u=!1},{signal:n.signal})})},stop:()=>{Patcher.unpatchAll(),n.abort()},getSettingsPanel:()=>{function i(){const[o,r]=React.useState(Data.load("resume")??!1);function d(s){Data.save("resume",s),r(s)}return React.createElement(f,{className:"bd-asp-resume-switch",value:o,onChange:d},"Resume Spotify playback after media stops playing")}return React.createElement(i,null)}}};
