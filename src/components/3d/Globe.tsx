import {useRef, useMemo} from "react";
import {useFrame} from "@react-three/fiber";
import * as THREE from "three";
import {useSettingsStore} from "../../store/settingsStore";
import {useTheme} from "../../hooks/useTheme";
import {getEffectiveGlobeRadius} from "../../utils/globe";

/**
 * Globe mesh — the curved world surface.
 * Renders only the upper hemisphere as a large sphere.
 * Curvature morphs continuously from globe to near-flat.
 */
export default function Globe() {
  const curvature = useSettingsStore((s) => s.curvature);
  const gridOverlayEnabled = useSettingsStore((s) => s.gridOverlayEnabled);
  const theme = useTheme();
  const meshRef = useRef<THREE.Mesh>(null);
  const gridRef = useRef<THREE.LineSegments>(null);
  const effectiveRadius = useMemo(() => getEffectiveGlobeRadius(curvature), [curvature]);

  // Create grid geometry for global overlay toggle
  const gridGeometry = useMemo(() => {
    if (!gridOverlayEnabled) return null;

    const segments = 40;
    const points: THREE.Vector3[] = [];

    // Latitude lines (rings)
    for (let i = 1; i <= segments / 2; i++) {
      const theta = (i / segments) * Math.PI;
      if (theta > Math.PI * 0.55) continue; // Only upper hemisphere
      const ringRadius = effectiveRadius * Math.sin(theta);
      const y = effectiveRadius * Math.cos(theta);
      for (let j = 0; j <= 64; j++) {
        const phi1 = (j / 64) * Math.PI * 2;
        const phi2 = ((j + 1) / 64) * Math.PI * 2;
        points.push(new THREE.Vector3(ringRadius * Math.cos(phi1), y, ringRadius * Math.sin(phi1)), new THREE.Vector3(ringRadius * Math.cos(phi2), y, ringRadius * Math.sin(phi2)));
      }
    }

    // Longitude lines (meridians)
    for (let i = 0; i < 24; i++) {
      const phi = (i / 24) * Math.PI * 2;
      for (let j = 0; j <= 32; j++) {
        const theta1 = (j / 64) * Math.PI;
        const theta2 = ((j + 1) / 64) * Math.PI;
        if (theta1 > Math.PI * 0.55 || theta2 > Math.PI * 0.55) continue;
        points.push(
          new THREE.Vector3(effectiveRadius * Math.sin(theta1) * Math.cos(phi), effectiveRadius * Math.cos(theta1), effectiveRadius * Math.sin(theta1) * Math.sin(phi)),
          new THREE.Vector3(effectiveRadius * Math.sin(theta2) * Math.cos(phi), effectiveRadius * Math.cos(theta2), effectiveRadius * Math.sin(theta2) * Math.sin(phi)),
        );
      }
    }

    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [effectiveRadius, gridOverlayEnabled]);

  useFrame(() => {
    // Gentle rotation for immersion (very slow)
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.00005;
    }
    if (gridRef.current) {
      gridRef.current.rotation.y += 0.00005;
    }
  });

  return (
    <group>
      {/* Main globe sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[effectiveRadius, 128, 64, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color={theme.groundColor} emissive={theme.groundEmissive} emissiveIntensity={theme.groundEmissiveIntensity} roughness={0.9} metalness={0.1} side={THREE.FrontSide} />
      </mesh>

      {/* Grid overlay */}
      {gridOverlayEnabled && gridGeometry && (
        <lineSegments ref={gridRef} geometry={gridGeometry}>
          <lineBasicMaterial color={theme.groundGridColor} transparent opacity={0.4} />
        </lineSegments>
      )}
    </group>
  );
}
