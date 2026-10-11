import React, {useLayoutEffect, useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {cameraAt, particleData, stageAt} from './motion.mjs';

const vertex = `
attribute vec3 aTarget;
attribute float aPhase;
uniform float uTime, uGather, uHandoff;
varying float vPhase;
void main() {
  vec3 drift = vec3(sin(uTime*.6+aPhase),sin(uTime*.6+aPhase+1.),sin(uTime*.6+aPhase+2.))*.09;
  vec3 p = mix(position+drift, aTarget, uGather);
  float a = uTime*.45;
  p = vec3(p.x*cos(a)-p.z*sin(a),p.y,p.x*sin(a)+p.z*cos(a));
  p.x += uHandoff*2.2;
  p.y += sin(uHandoff*3.14159265)*.7;
  vec4 mv = modelViewMatrix * vec4(p,1.);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp((6.+2.*sin(aPhase))*10./max(.1,-mv.z),2.,13.);
  vPhase = aPhase;
}`;
const fragment = `
uniform float uAlpha;
varying float vPhase;
void main() {
  float d = length(gl_PointCoord-.5);
  if(d>.5) discard;
  float edge = 1.-smoothstep(.28,.5,d);
  vec3 mint = vec3(.63,.96,.78), amber = vec3(1.,.42,.23);
  gl_FragColor = vec4(mix(mint,amber,.5+.5*sin(vPhase)),edge*uAlpha);
}`;

const Camera: React.FC<{time:number}> = ({time}) => {
  const {camera} = useThree();
  const state = cameraAt(time);
  useLayoutEffect(() => {
    camera.position.set(state.position[0], state.position[1], state.position[2]);
    camera.lookAt(state.target[0], state.target[1], state.target[2]);
    camera.updateMatrixWorld();
  }, [camera, time]);
  return null;
};

const Field: React.FC<{time:number}> = ({time}) => {
  const data = useMemo(() => particleData(), []);
  const s = stageAt(time);
  return <points frustumCulled={false}>
    <bufferGeometry>
      <bufferAttribute attach="attributes-position" args={[data.base,3]}/>
      <bufferAttribute attach="attributes-aTarget" args={[data.target,3]}/>
      <bufferAttribute attach="attributes-aPhase" args={[data.phase,1]}/>
    </bufferGeometry>
    <shaderMaterial vertexShader={vertex} fragmentShader={fragment} transparent depthWrite={false}
      blending={THREE.AdditiveBlending} uniforms={{uTime:{value:time},uGather:{value:s.gather},
        uHandoff:{value:s.handoff},uAlpha:{value:s.fieldAlpha}}}/>
  </points>;
};

export const ParticleJourney: React.FC = () => {
  const f = useCurrentFrame(), {fps,width,height} = useVideoConfig(), t = f/fps;
  const opacity = stageAt(t).handoff;
  return <ThreeCanvas width={width} height={height} style={{position:'absolute',top:0,left:0}}
    camera={{fov:42, near:0.1, far:50, position:[0,.2,11]}}>
    <Camera time={t}/>
    <hemisphereLight args={['#d4ffe6','#15233b',2.1]}/>
    <directionalLight position={[4,5,6]} intensity={3}/>
    <directionalLight position={[-4,0,-2]} color="#ff7848" intensity={2}/>
    <Field time={t}/>
    <mesh position={[2.2,0,0]} rotation={[.25,t*.3,.4]} scale={.52}>
      <torusKnotGeometry args={[.6,.13,128,12]}/>
      <meshStandardMaterial color="#d6fa78" metalness={.35} roughness={.3} transparent opacity={opacity}/>
    </mesh>
  </ThreeCanvas>;
};
