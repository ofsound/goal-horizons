import {useMemo} from "react";
import * as THREE from "three";
import {Stars, Sphere} from "@react-three/drei";
import {useTheme} from "../../hooks/useTheme";

/**
 * Sky dome and atmospheric elements.
 * Renders differently for each theme.
 */
export default function SkyAndGround() {
  const theme = useTheme();

  // Gradient sky shader
  const skyMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        topColor: {value: new THREE.Color(theme.skyTopColor)},
        bottomColor: {value: new THREE.Color(theme.skyBottomColor)},
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition).y;
          float t = max(0.0, min(1.0, h * 0.5 + 0.5));
          gl_FragColor = vec4(mix(bottomColor, topColor, t), 1.0);
        }
      `,
      side: THREE.BackSide,
    });
  }, [theme.skyTopColor, theme.skyBottomColor]);

  return (
    <group>
      {/* Sky dome */}
      <mesh material={skyMaterial}>
        <sphereGeometry args={[500, 32, 32]} />
      </mesh>

      {/* Stars for dark theme */}
      {theme.showStars && <Stars radius={300} depth={100} count={8000} factor={6} saturation={0.5} fade speed={0.5} />}

      {/* Sun for vaporwave/natural themes */}
      {theme.showSun && (
        <group position={theme.sunPosition}>
          <Sphere args={[12, 32, 32]}>
            <meshBasicMaterial color={theme.sunColor} />
          </Sphere>
          {/* Sun glow */}
          <Sphere args={[18, 32, 32]}>
            <meshBasicMaterial color={theme.sunColor} transparent opacity={0.15} />
          </Sphere>
        </group>
      )}
    </group>
  );
}
