import {useRef} from "react";
import {useFrame, useThree} from "@react-three/fiber";
import * as THREE from "three";
import {useSettingsStore} from "../../store/settingsStore";
import {useUIStore} from "../../store/uiStore";
import {getCameraPosition, getCameraTarget} from "../../utils/globe";

/**
 * CameraRig: controls camera movement along a rail on the globe surface.
 *
 * - Scroll zoom is handled by ScrollHandler in Scene
 * - "Look Back" rotates the camera 180° smoothly
 * - All transitions are lerp-smoothed for luxurious feel
 */
export default function CameraRig() {
  const {camera} = useThree();
  const railPosition = useSettingsStore((s) => s.cameraRailPosition);
  const curvature = useSettingsStore((s) => s.curvature);
  const lookingBack = useUIStore((s) => s.lookingBack);

  const targetPosRef = useRef(new THREE.Vector3());
  const targetLookRef = useRef(new THREE.Vector3());
  const currentLookRef = useRef(new THREE.Vector3());

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
