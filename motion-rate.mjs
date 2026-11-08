import {pathToFileURL} from 'node:url';
const scales={mm:0.001,cm:0.01,m:1};
export function motionRate({distance,unit='m',durationSeconds,playbackSpeed=1}){
 for(const[k,v]of Object.entries({distance,durationSeconds,playbackSpeed}))if(typeof v!=='number'||!Number.isFinite(v))throw new TypeError(k+' must be finite');
 if(distance<0||durationSeconds<=0||playbackSpeed<=0)throw new RangeError('Use nonnegative distance and positive duration/speed');
 if(!Object.hasOwn(scales,unit))throw new RangeError('Supported units: mm, cm, m');
 const distanceMetres=distance*scales[unit],effectiveDurationSeconds=durationSeconds/playbackSpeed,meanMetresPerSecond=distanceMetres/effectiveDurationSeconds;
 if(![distanceMetres,effectiveDurationSeconds,meanMetresPerSecond].every(Number.isFinite)||effectiveDurationSeconds<=0)throw new RangeError('Calculation overflow or underflow');
 return {distanceMetres,effectiveDurationSeconds,meanMetresPerSecond,status:'arithmetic_only',gameplayAccepted:false};
}
export function durationFromFrameIntervals(intervals,fps){if(!Number.isInteger(intervals)||intervals<=0||typeof fps!=='number'||!Number.isFinite(fps)||fps<=0)throw new RangeError('Positive integer intervals and finite positive FPS required');return intervals/fps;}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){console.log(JSON.stringify(motionRate({distance:200,unit:'cm',durationSeconds:1.25,playbackSpeed:1.25}),null,2));}
