import {useRef} from "react";
import {useFrame, useThree} from "@react-three/fiber";
import * as THREE from "three";
import {useSettingsStore} from "../../store/settingsStore";
import {useUIStore} from "../../store/uiStore";
import {getCameraPosition, getCameraTarget} from "../../utils/globe";

/**
 * CameraRig: controls camera movement along a rail on the globe surface.
 *
 * - Scroll wheel slides the camera forward/backward on the rail (zoom)
 * - "Look Back" rotates the camera 180° smoothly
 * - All transitions are lerp-smoothed for luxurious feel
 */
export default function CameraRig() {
  const {camera, gl} = useThree();
  const railPosition = useSettingsStore((s) => s.cameraRailPosition);
  const curvature = useSettingsStore((s) => s.curvature);
  const setCameraRailPosition = useSettingsStore((s) => s.setCameraRailPosition);
  const lookingBack = useUIStore((s) => s.lookingBack);

  const targetPosRef = useRef(new THREE.Vector3());
  const targetLookRef = useRef(new THREE.Vector3());
  const currentLookRef = useRef(new THREE.Vector3());
  const initializedRef = useRef(false);

  // Handle scroll for zoom
  useFrame(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * 0.0008;
      setCameraRailPosition(railPosition + delta);
    };

    const canvas = gl.domElement;
    // We attach and detach each frame — not ideal but simpler than effect in R3F
    // Actually let's set it up once
    if (!initializedRef.current) {
      canvas.addEventListener("wheel", handleWheel, {passive: false});
      initializedRef.current = true;

      return () => {
        canvas.removeEventListener("wheel", handleWheel);
      };
    }
  });

  // Smooth camera movement
  useFrame((_, delta) => {
    const targetPos = getCameraPosition(railPosition, curvature);
    const targetLook = getCameraTarget(railPosition, lookingBack, curvature);

    targetPosRef.current.copy(targetPos);
    targetLookRef.current.copy(targetLook);

    // Smooth interpolation
    const lerpSpeed = 3;
    camera.position.lerp(targetPosRef.current, delta * lerpSpeed);

    // Smooth look-at
    currentLookRef.current.lerp(targetLookRef.current, delta * lerpSpeed);
    camera.lookAt(currentLookRef.current);

    camera.updateProjectionMatrix();
  });

  return null;
}
